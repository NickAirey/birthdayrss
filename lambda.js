/**
 * Author: Nick Airey
 */

let ssm_config = require('config_aws_ssm');
let main = require('main');
let util = require('util');

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
        let config = await ssm_config.getConfig();
        let res = await main.getHttpReport(config);

        // extract js results from report, transform report results list into rssItems list
        let jsonObj = JSON.parse(main.extractJsFromReport(res));
        let rssItems = jsonObj.results.map(i => main.reportResultToRssItem(i, runDate) );

        // construct rssXml, put into API result object format
        let rssXml = main.rssXmlBuilder(rssItems, config, runDate);
        let result = {"statusCode": 200, "headers": {'Content-Type': 'text/xml'}, "body": rssXml};

        console.log(util.inspect(result, {showHidden:false, depth:5}));
        return result;
    }
    catch(err) {
        console.error(util.inspect(err, {showHidden:false, depth:5}));
        let result = {"statusCode": 503, "body": "error processing request"};
        return result;
    }
};