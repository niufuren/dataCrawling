


fs = require('fs');

var url='file:///Users/juanlu/Workspace/code/webDataCollection/onTheHouseData/8.html';

var getData = require('./getData');
//dataCrawling = require('./dataCrawling.js');

var casper = require('casper').create({
    verbose: true,
    logLevel: 'debug',
    viewportSize: {
        width: 1024,
        height: 1600
    },
    pageSettings: {
        loadImages: true,//The script is much faster when this field is set to false
        loadPlugins: true            
    }
});

casper.start(url);

casper.then(function(){
    var propertyDetails;
    propertyDetails = this.evaluate(getData.getData);
    this.echo(JSON.stringify(propertyDetails), 'INFO');
});

casper.run(
    function(){
    this.echo("Done", "INFO").exit();
});