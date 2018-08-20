

let AWS = require('aws-sdk');

exports.getConfig = async function() {

    return new Promise( (resolve, reject) => {

        const keyList = ["organisation/general/name", "organisation/general/website-url", "organisation/birthday/feed-description",
            "organisation/birthday/feed-url", "organisation/birthday/elvanto-report-id", "elvanto/reports/report-url",
            "elvanto/reports/auth-key"];

        let awsRegion = process.env.AWS_REGION;

        let ssm = new AWS.SSM({region: awsRegion});

        let params = {
            Names: keyList,
            WithDecryption: false
        };

        ssm.getParameters(params, function (err, data) {
            if (err) {
                reject(err.message);
            } else {
                if (data.InvalidParameters[0] === paramName) {
                    reject('Unable to retrieve parameter: ' + paramName);
                }
                else if (data.Parameters[0].Name === paramName) {
                    resolve(data.Parameters[0]);
                }
                else {
                    reject('error retrieving parameter: ' + paramName);
                }
            }
        });
    });
};