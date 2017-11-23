'use strict';
const graphql = require('graphql'),
    request = require('request'),
    rp = require('request-promise'),
    rpErrors = require('request-promise/errors');

let apiBaseUrl = '';
let apiKey = '';
let logger;

class s3ReadSchema {
    constructor(o) {
        apiBaseUrl = o.apiBaseUrl;
        apiKey = o.apiKey;
        logger = o.logger.child({schema: 's3ReadSchema'});
    }

    resolve(_, args) {
        let options = {
            uri: `https://${apiBaseUrl}/reads3/${args.formId}`,
            headers: {
                accept: 'application/json',
                'x-api-key': apiKey
            },
            qs: {
                lang: args.lang
            },
            json: true
        }
        logger.debug({options: options}, 'The options: %j');
        return rp(options)
            .then(r => {
                logger.debug({data: r}, '---- formId response from api');
                if ((r || []).length === 0) {
                    return null;
                }
                let s3Result = {
                    "questions": Object.keys(r.questions[args.formId]).map(i => {
                        return {
                            "question": r.questions[args.formId][i].question,
                            "answers": Object.keys(r.questions[args.formId][i].answers).map(j => {
                                return {
                                    "answer": j,
                                    "description": r.questions[args.formId][i].answers[j]
                                }
                            })
                        };
                    })
                };
                logger.debug({formId: s3Result}, "---- formId schema");
                return s3Result;
            })
            .catch(rpErrors.StatusCodeError, err => {
                if (err.statusCode === 404) {
                    logger.warn({methodName, error: err}, "Error returned");
                    return null;
                } else {
                    throw err;
                }
            });
    }

    ReadS3() {
        return new graphql.GraphQLObjectType({
            name: "ReadS3",
            description: "This provides formId texts",
            fields: () => ({
                "questions": {type: new graphql.GraphQLList(this.Questions())}
            })
        });
    }

    Questions() {
        return new graphql.GraphQLObjectType({
            name: "Questions",
            description: "This provides all formId questions",
            fields: () => ({
                "question": {type: graphql.GraphQLString},
                "answers": {type: new graphql.GraphQLList(this.Answers())}
            })
        })

    }

    Answers() {
        return new graphql.GraphQLObjectType({
            name: "Answers",
            description: "This provides the formId answers",
            fields: () => ({
                "answer": {type: graphql.GraphQLString},
                "description": {type: graphql.GraphQLString}
            })
        });
    }

    schema() {
        return {
            type: this.ReadS3(),
            args: {
                formId: {type: graphql.GraphQLString},
                lang: {type: graphql.GraphQLString}
            },
            resolve: this.resolve
        }
    }

}

module.exports = feedbackSchema;