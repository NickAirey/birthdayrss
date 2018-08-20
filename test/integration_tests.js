const assert = require('assert');
const fs = require('fs');
const main = require('../main');

describe('integration tests', function() {

    this.timeout(15000);

    it('live http request', async() => {

        let runDate = new Date(2018, 6, 31);
        let nbc_config = JSON.parse(fs.readFileSync('test/config_integration.json'));
        let res = await main.getHttpReport(nbc_config);

        assert.equal(res.length > 0, true);

        let jsStr = main.extractJsFromReport(res);
        assert.equal(jsStr.length > 0, true);

        let jsonObj = JSON.parse(jsStr);
        assert.equal(jsonObj != null, true);

        let items = jsonObj.results.map(i => main.reportResultToRssItem(i, runDate) );
        assert.equal(items.length, jsonObj.results.length);

        main.rssXmlBuilder(items, nbc_config, runDate);
    })
});