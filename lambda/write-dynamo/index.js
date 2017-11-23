'use strict';
const config = require('./env.json'),
    Promise = require('bluebird'),
    AWS = require('aws-sdk'),
    bunyan = require('bunyan'),
    bformat = require('bunyan-format'),
    uuid = require('uuid/v4'),
    exceptions = require('./exceptions.js'),
    isJSON = require('is-valid-json');

const manadatory_must_have_value = ["id"];
const self = exports;
const lformat = bformat({outputMode: 'bunyan', levelInString: true});

const dynamoDB = new AWS.DynamoDB.DocumentClient({region: config.awsRegion, convertEmptyValues: true});

const log = bunyan.createLogger({
    name: 'write-dynamo',
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
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,x-guid,x-channel-name,x-request-token'

        },
        statusCode: statusCode
    }
}

function isValidJson(json) {
    let methodName = "isValidJson";
    try {
        json = JSON.parse(json);
        log.debug({"methodName": methodName}, "Payload is a valid json");
    } catch (e) {
        log.debug({"methodName": methodName}, "Payload is an invalid json");
        return false;
    }
    return true;
}

function save(object) {
    let methodName = "storePerson";
    let params = {
        TableName: config.dbTableName,
        Item: object
    };
    return dynamoDB.put(params).promise()
        .then(function () {
            log.info({"methodName": methodName}, "Storing data OK ");
            return Promise.resolve(object)
        });
}

function get(array, key, errors) {
    var value = array ? array[key] : null;
    if (!value || value.trim() == "") {
        errors.push(key);
    }
}

exports.extractEvent = (event) => {
    let methodName = "extractEvent";
    return new Promise(function (resolve,reject) {
        if (event.body && isValidJson(event.body)) {
            log.debug({"methodName": methodName}, "Payload extracted successfully from request");
           return resolve(JSON.parse(event.body));
        }
        let ex = new exceptions.BadRequestException();
        log.error({"methodName": methodName}, ex.message);
        throw ex;
    });
}

/*
* Entry point to the lambda
* */
exports.handler = (event, context, callback) => {
    let methodName = "exports.handler";
    log.debug({event: event, "methodName": methodName}, " event received");

    self.extractEvent(event)
        .then(save)
        .then((response) => {
            log.debug({response: response, "methodName": methodName}, " Lambda completed successfully");
            callback(null, self.setResponse(200, response));
        })
        .catch(err => {
            let statusCode = err.statusCode ? err.statusCode : 404;
            let message = err.message ? err.message : err.stack;
            log.error({message: message, "methodName": methodName},"error occurred");
            callback(null,self.setResponse(statusCode, {"exception": message}));
        });
};