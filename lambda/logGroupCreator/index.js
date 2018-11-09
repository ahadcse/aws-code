'use strict'

const aws = require('aws-sdk')
aws.config.update({ region: 'eu-west-1' })
const cwl = new aws.CloudWatchLogs({ apiVersion: '2014-03-28' })

exports.handler = async (event, context, callback) => {
    // Creating log group and subscription
    try {
        await cwl.createLogGroup({ logGroupName: event.logGroupName }).promise().then(_ => console.log('Log group created'))
        await cwl.putSubscriptionFilter(event).promise().then(_ => console.log('Subscription filter created'))
        callback(null, { statusCode: 200, code: 'success', message: 'log group and subscription filter created' })
    }  catch (err) {
        if(err.code === 'ResourceAlreadyExistsException') {
            console.log('Resouce already exists')
            callback (null, { statusCode: err.statusCode || 400, code: err.code, message: err.message || 'resource exists' })
        }
        console.log('Error creating log group or subscription: ', err.code, err.statusCode, err.message)
        return callback(null, { statusCode: err.statusCode || 500, code: err.code || 'unknown', message: err.message || 'unknown error' })
    }
}