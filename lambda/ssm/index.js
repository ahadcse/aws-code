'use strict'

const ssm = new (require('aws-sdk/clients/ssm'))()

exports.handler = async event => {
    const key = ['/data/key/key1', '/data/key/key2', '/data/key/key3']
    return await ssm.getParameters({
        Names: key,
        WithDecryption: true
    }).promise()
}