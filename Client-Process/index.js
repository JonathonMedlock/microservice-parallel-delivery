const AWS = require('aws-sdk');

const documentClient = new AWS.DynamoDB.DocumentClient();

const insertMessage = (message) => {
	const insertParams = {
		TableName: process.env['MESSAGES_TABLE'],
		Item: {
			Source: message.source,
			Timestamp: message.timestamp,
			Topic: message.topic,
			Message: message.message
		}
	};
	return documentClient.put(insertParams).promise().then((data) => {
		console.log("Message from " + message.source + " with timestamp " + message.timestamp + " inserted.");
		return;
	}).catch((err) => {
		console.log("ERROR: Problem inserting into messages table");
		throw err;
	});
};

const receivedMessage = (message, messageParams) => {
	return documentClient.get(messageParams).promise().then((data) => {
		if (data.Item) {
			console.log("Received duplicate message from " + message.source + " with timestamp " + message.timestamp + ".");
			return;
		} else {
			return insertMessage(message);
		}
	}).catch((err) => {
		console.log("ERROR: Error retrieving message from Dynamo");
		throw err;
	});
};

exports.handler =  async function(event, context) {
	const sourceParams = {
		TableName: process.env['TOPICS_TABLE']
	}
	
	const topicsTable = await documentClient.scan(sourceParams).promise();
	const topics = topicsTable.Items.map((item) => { return item.TopicName; });
	
	return Promise.all(event.Records.map(async (item) => {
		const message = JSON.parse(JSON.parse(item.body).Message);
		const messageParams = {
				TableName: process.env['MESSAGES_TABLE'],
				Key: {
					Source: message.source,
					Timestamp: message.timestamp
				}
			}
		if (!message.approved) {
			return;
		} else {
			if (topics.indexOf(message.topic) >= 0) {
				return receivedMessage(message, messageParams);
			} else {
				return;
			}
		}
	})).then((data) => {
		console.log("Completed batch processing");
	}).catch((err) => {
		console.log("ERROR: Error occurred in batch processing");
		throw err;
	});
};
