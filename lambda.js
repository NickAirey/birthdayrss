/**
 *
 * Author: Nick Airey
 *
 */

let config = require('./config_aws_ssm');
let main = require('./main');
let util = require('util');

function logError(data) {
    console.error(util.inspect(data, {showHidden:false, depth:5}));
    return data;
}

function logObject(data) {
    console.log(util.inspect(data, {showHidden:false, depth:5}));
    return data;
}

/**
 * AWS API lambda handler
 *
 * @param event
 * @returns {Promise<*>}
 */
exports.handler = async (event) => {
    try {
        let runDate = new Date();

        // get config and use it to get http report
        let config = await config.getConfig();
        let res = await main.getHttpReport(config);

        // extract js results from report, transform report results list into rssItems list
        let jsonObj = JSON.parse(main.extractJsFromReport(res));
        let rssItems = jsonObj.results.map(i => main.reportResultToRssItem(i, runDate) );

        // construct rssXml, put into API result object format
        let rssXml = main.rssXmlBuilder(rssItems, config, runDate);
        let result = {"statusCode": 200, "headers": {'Content-Type': 'text/xml'}, "body": rssXml};

        logObject(result);
        return result;
    }
    catch(err) {
        logError(err);
        let result = {"statusCode": 503, "body": "error processing request"};
        logError(result);
        return result;
    }
};