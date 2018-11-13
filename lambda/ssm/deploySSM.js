const AWS = require('aws-sdk')
const SSM = new AWS.SSM({region: process.env.AWS_REGION || 'eu-west-1'})

const putSSM = async param => {
    return SSM.putParameter(param)
        .promise()
        .then((_) => undefined)
        .catch((error) => {
            if (error.code === 'ParameterAlreadyExists') {
                return Promise.resolve()
            }
            console.log('Failed to put parameter to SSM', param, error)
            return Promise.reject(`Failed to put parameter to SSM. param: ${param}, error: ${error}`)
        })
}

const putConfig = async () => {
    const ssm = require(`../../config/ssm.json`)
    if (!Array.isArray(ssm)) {
        console.log('Invalid config')
        process.exit(1)
    }
    console.log('Configuring SSM parameter')
    for (const param of ssm) {
        try {
            await putSSM(param)
        } catch (error) {
            console.log('Error when pushing config to SSM')
            process.exit(1)
        }
    }
}

putConfig()