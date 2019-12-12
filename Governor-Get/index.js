const AWS = require('aws-sdk');

const documentClient = new AWS.DynamoDB.DocumentClient();

exports.handler =  async function(event, context) {
	const params = {
		TableName: process.env['MESSAGES_TABLE']
	};
	
	const messages = (await documentClient.scan(params).promise()).Items;
	
	return {
		statusCode:200,
		body:JSON.stringify(messages),
		headers: {'Access-Control-Allow-Origin': '*'},
	};
};