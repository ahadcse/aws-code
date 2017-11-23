'use strict';
const config = require('./env.json'),
    Promise = require('bluebird'),
    AWS = require('aws-sdk'),
    bunyan = require('bunyan'),
    bformat = require('bunyan-format'),
    firehose = new AWS.Firehose({"region": "eu-west-1"});

AWS.config.setPromisesDependency(Promise);
let dynamoDB = new AWS.DynamoDB.DocumentClient({region: config.awsRegion, convertEmptyValues: true});

const lformat = bformat({outputMode: 'bunyan', levelInString: true});
const log = bunyan.createLogger({
    name: 'write-to-firehose-by-dynamodb-trigger',
    stream: lformat,
    level: process.env.loglevel ? process.env.loglevel : 'DEBUG',
    message: {}
});

exports.setResponse = (statusCode, body) => {
    return {
        body: JSON.stringify(body),
        headers: {
            "Content-type": "application/json",
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,Api-Key'
        },
        statusCode: statusCode
    };
}

function pushToFirehose(event) {
    let methodName = "pushToFirehose";
    log.debug({methodName: methodName, event: event }, " object received to be put to firehose");
    let eventWithNewLineChar = JSON.stringify(event) +"\n";
    let params = {
        DeliveryStreamName: config.firehoseStream,
        Record: {
            Data: eventWithNewLineChar
        }
    };
    return firehose.putRecord(params).promise()
        .then(result => {
            log.debug({methodName: methodName, result: result}, '--- firehose push successful');
            return result;
        });
}

exports.handler = function (event, context, callback) {
    let methodName = "exports.handle";
    log.info({"methodName": methodName}, "event received");
    log.debug({event: event, "methodName": methodName}, "event received");

        pushToFirehose (event)
        .then(function (result) {
            log.debug({"methodName": methodName, result: result}, "Successfully written to firehose" );
            log.info({"methodName": methodName}, "success");
            callback(null,exports.setResponse (200, {"result": "success"}) );
        })
        .catch(function (err) {
            log.error(methodName + ' error occurred: ' + err);
            callback(err , null);
        });
};
