const AWS = require('aws-sdk');

const sns = new AWS.SNS({apiVersion: '2010-03-31'});

exports.handler =  async function(event, context) {
	const message = JSON.parse(event.body);
	if (!(message.topic && message.message)) {
		console.log("ERROR: Message does not have valid topic or valid body");
		throw new Error("Message topic/body was null/undefined");
	}
	const snsMessage = JSON.stringify({
		source: process.env['CLIENT_NAME'],
		timestamp: new Date().getTime(),
		topic: message.topic,
		message: message.message
	});
	
	const snsParams = {
		Message: snsMessage,
		TopicArn: process.env['DATABUS']
	}
	
	return sns.publish(snsParams).promise().then((data) => {
		console.log("Successfully published message");
		return {
			statusCode: 200,
			headers: {'Access-Control-Allow-Origin': '*'},
		};
	}).catch((err) => {
		console.log("ERROR: Error publishing to SNS topic");
		throw err;
	});
};