let assert = require('assert');
let fs = require('fs');
let main = require('../main');

describe('report parsing', () => {
    it('extract js', () => {
        let htmlStr = fs.readFileSync('test/birthday_report.html', 'utf-8');
        let jsStr = main.extractJsFromReport(htmlStr);
        let jsonStrRef = fs.readFileSync('test/birthday_report.json', 'utf-8');

        assert.equal(jsStr, jsonStrRef);
    });

    it('process js', () => {
        let jsonStrRef = fs.readFileSync('test/birthday_report.json', 'utf-8');
        let jsonObj = JSON.parse(jsonStrRef);

        assert.equal(jsonObj.results.length, 11);
    });
});

describe('date calculations', () => {
   it('current year', () => {
       assert.equal(main.getNextDate('19 July', new Date(2018, 6, 12)).toLocaleString(), new Date(2018, 6, 19).toLocaleString());
       assert.equal(main.getNextDate('2 Feb', new Date(2018, 1, 2)).toLocaleString(), new Date(2018, 1, 2).toLocaleString());
    });

    it('increment year', () => {
        assert.equal(main.getNextDate('19 July', new Date(2018, 6, 29)).toLocaleString(), new Date(2019, 6, 19).toLocaleString());
        assert.equal(main.getNextDate('2 Jan', new Date(2018, 11, 29)).toLocaleString(), new Date(2019, 0, 2).toLocaleString());
    });
});


describe('result to item', () => {
   it('result to item', ()=> {

       let runDate = new Date(2018, 6, 12);
       let input1 = '{ "cols": [ { "field": "firstname", "data": "Ben", "html": false }, { "field": "lastname","data": "Johnson","html": false },{"field": "birthday_month", "data": "29 July","html": false } ]}';

       let item1Obj = main.reportResultToRssItem(JSON.parse(input1), runDate);

       assert.equal(JSON.stringify(item1Obj), '{"item":{"title":"Ben Johnson","description":"Sunday"}}');
   });
});

describe('create xml', () => {
    it('create xml from items', () => {

        let rssRef = fs.readFileSync('test/rss.xml', 'utf-8');

        var items = [
            { item: { title: "Ben Johnson", description: "Sunday" }},
            { item: { title: "Mark Singer", description: "Monday" }}];

        let config = JSON.parse(fs.readFileSync('test/config_test.json', 'utf-8'));
        let runDate = new Date(2018, 6, 29);

        assert.equal(main.rssXmlBuilder(items, config, runDate), rssRef);
    });
});