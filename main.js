/*
    Author: Nick Airey
 */

let axios = require('axios');
let builder = require('xmlbuilder');

exports.extractJsFromReport = function(htmlReport) {
    let res = /ReportView.tableInit\((.+)\)/.exec(htmlReport);
    return res[1];
};


exports.getHttpReport = async function(feedConfig) {

    const httpClient = axios.create({
        baseURL: feedConfig['elvanto/reports/report-url'],
        timeout: 5000,
        maxContentLength: 20000
    });

    let uri = '/report/?id='+ feedConfig['organisation/birthday/elvanto-report-id']+'&authkey='+feedConfig['elvanto/reports/auth-key'];
    const result = await httpClient.get(uri);
    return result.data;
};


exports.getNextDate = function(dayMonthStr, currentDate) {
    let currentYear = currentDate.getFullYear();
    let dateCurrentYear = new Date(dayMonthStr + ' ' + currentYear);

    if (dateCurrentYear.getTime() >= currentDate.getTime()) {
        return dateCurrentYear;
    } else {
        return new Date(dayMonthStr + ' ' + ++currentYear);
    }
};

/*
   takes a Result object, returns the rssItem object

    { "cols": [ { "field": "firstname", "data": "Ben", "html": false }, { "field": "lastname","data": "Johnson","html": false },{"field": "birthday_month", "data": "29 July","html": false } ]}
    {"item":{"title":"Ben Johnson","description":"Sunday"}}
*/
exports.reportResultToRssItem = function(reportResult, runDate) {

    let fullName = ' ';
    let next_birthday_day = ' ';

    reportResult.cols.forEach( col => {
        switch(col.field) {
            case 'firstname':
                fullName = col.data + fullName;
                break;
            case 'lastname':
                fullName = fullName + col.data;
                break;
            case 'birthday_month':
                let next_birthday_date = exports.getNextDate(col.data, runDate);
                next_birthday_day = next_birthday_date.toLocaleString('en-us', { weekday: 'long'});
                break;
        }
    });

    return { item: { title: fullName, description: next_birthday_day } };
};


/*
    create a rss compliant xml string, merging the rssItems, the config and run date.
 */
exports.rssXmlBuilder = function(rssItems, feedConfig, runDate) {

    let root = builder.create('rss')
        .att('version', '2.0').att('xmlns:atom', "http://www.w3.org/2005/Atom")
        .element('channel')
        .element('title', feedConfig["organisation/general/name"]).up()
        .element('description', feedConfig["organisation/birthday/feed-description"]).up()
        .element('link', feedConfig["organisation/general/website-url"]).up()
        .element('pubDate', runDate.toUTCString()).up()
        .element('atom:link').att('href', feedConfig["organisation/birthday/feed-url"]).att('rel', 'self').att('type', 'application/rss+xml').up();

    rssItems.forEach( item => {
        root.element(item);
    });

    let xmlStr = root.end({pretty: true});
    console.log(xmlStr);

    return xmlStr;
};
