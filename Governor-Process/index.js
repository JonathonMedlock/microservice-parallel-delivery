const AWS = require('aws-sdk');

const documentClient = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS({apiVersion: '2010-03-31'});

const receivedApprovedMessage = (message, messageParams) => {
	return documentClient.get(messageParams).promise().then((data) => {
		if (data.Item && message.topic === data.Item.Topic && message.message === data.Item.Message) {
			console.log("Received GOVERNOR-APPROVED message from " + message.source + " with timestamp " + message.timestamp + ". Ignoring...");
		} else {
			console.log("ERROR: Received GOVERNOR-APPROVED message that has not been processed!\n" + message);
		}
	}).catch((err) => {
		console.log("ERROR: Error retrieving message from Dynamo");
		throw err;
	});
};

const publishApprovedMessage = (message) => {
	const forSNS = JSON.stringify({
		source: message.source,
		timestamp: message.timestamp,
		topic: message.topic,
		message: message.message,
		approved: true
	});
	const snsParams = {
		Message: forSNS,
		TopicArn: process.env['SNS_TOPIC']
	}
	return sns.publish(snsParams).promise().then((data) => {
		console.log("Successfully published governor-approved message");
		return;
	}).catch((err) => {
		console.log("ERROR: Error publishing to SNS topic");
		throw err;
	});
};

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
		return publishApprovedMessage(message);
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
		TableName: process.env['SOURCES_TABLE']
	}
	
	const sourcesTable = await documentClient.scan(sourceParams).promise();
	const sources = sourcesTable.Items.map((item) => { return item.ClientName; });
	
	return Promise.all(event.Records.map(async (item) => {
		const message = JSON.parse(JSON.parse(item.body).Message);
		const messageParams = {
				TableName: process.env['MESSAGES_TABLE'],
				Key: {
					Source: message.source,
					Timestamp: message.timestamp
				}
			}
		if (message.approved) {
			return receivedApprovedMessage(message, messageParams);
		} else {
			if (sources.indexOf(message.source) >= 0) {
				return receivedMessage(message, messageParams);
			} else {
				console.warn("WARNING: Received message from untrusted source " + message.source);
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
