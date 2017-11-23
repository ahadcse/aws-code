'use strict';

const chai = require('chai'),
    should = chai.should(),
    lambdaLocal = require('lambda-local'),
    chaiAsPromised = require("chai-as-promised"),
    mute = require("mute"),
    assert = require('assert'),
    exception = require('../exceptions');


chai.use(chaiAsPromised);
chai.should();

describe('write-to-firehose-by-dynamodb-trigger', function () {

    this.timeout(15000);

    it('should return a valid response', function () {
        //let unmute = mute();
        let event = require("./events/valid.json");
        return invokeLambda(event)
            .then(function (response) {
          //      unmute();
                assert(response.statusCode == 200)
            });
        //unmute();
    });
});

function invokeLambda(event) {
    return lambdaLocal.execute({
        event: event,
        profileName: 'cco-dev',
        lambdaHandler: "handler",
        lambdaPath: "index.js",
        profile: "cco-dev",
        environment: {'account': 'cco-dev'},

    })

}
