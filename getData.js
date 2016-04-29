/*
test the getData function in dataCrawling.js
*/


var require = patchRequire(require);
fs = require('fs');

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

var url='file:///Users/juanlu/Workspace/code/webDataCollection/onTheHouseData/8.html';

function getData(){
//exports.answer = function(){    
    var propertyDetails = {};
    //get the status of the webpage

    var propertyDiv = document.querySelector('div[name="propertyDetails"]');


    //get the property address

    var address = propertyDiv.querySelector('div[class="address"]');

    var street = address.querySelector('span[class="street-address ng-binding ng-scope"]').innerHTML;
    propertyDetails['street']=street;

    var suburb = address.querySelector('span[itemprop="addressLocality"]').innerHTML;
    propertyDetails['suburb']=suburb;

    var state = address.querySelector('span[itemprop="addressRegion"]').innerHTML;
    propertyDetails['state']=state;

    var postcode = address.querySelector('span[itemprop="postalCode"]').innerHTML;
    propertyDetails['postcode']=postcode;

    //get the number of bathroom, bedroom and car park

    var property = propertyDiv.querySelector('ul[property="property"]');
    if (property.querySelector('li[class="property-attribute property-attribute-bed ng-binding"]')){
        var bedroom = property.querySelector('li[class="property-attribute property-attribute-bed ng-binding"]').innerHTML;
        propertyDetails['bedroom']=bedroom;
    }
    else{
        propertyDetails['bedroom']="";
    }
    

    if (property.querySelector('li[class="property-attribute property-attribute-bath ng-binding"]')){
        var bathroom = property.querySelector('li[class="property-attribute property-attribute-bath ng-binding"]').innerHTML;
        propertyDetails['bathroom']=bathroom;
    }
    else{
        propertyDetails['bathroom']="";
    }

    if(property.querySelector('li[class="property-attribute property-attribute-car ng-binding"]')){

        var carpark = property.querySelector('li[class="property-attribute property-attribute-car ng-binding"]').innerHTML;
        propertyDetails['carpark']=carpark;
    }
    else{
        propertyDetails['carpark']=""
    }
    
    //get the type of the property
    var propertyType = propertyDiv.querySelector('div[class="property-type ng-binding ng-scope"]').innerHTML;
    propertyDetails['type']=propertyType;

    //get the estimate price and updated date
    if(propertyDiv.querySelector('div[class="estimate"] span')){

        var estimatePrice = propertyDiv.querySelector('div[class="estimate"] span').innerText;
        propertyDetails['estimate price']=estimatePrice;

    }else{
        propertyDetails['estimate price']="";
    }


    //get the estimate accuracy
    if(propertyDiv.querySelector('div[ng-class="estimateAccuracyClass"] div')){
        var accuracy = propertyDiv.querySelector('div[ng-class="estimateAccuracyClass"] div').innerText;
        propertyDetails['estimate accuracy'] = accuracy;
    }
    else{
        propertyDetails['estimate accuracy'] = "";
    }

    var updateDiv = propertyDiv.querySelector('div[class="date-row"] span').innerText;
    propertyDetails['update Time'] = updateDiv;
    
    /*
    get the property info: year built, lot plan, zoing, primary land use, issuing area, land size
    */
    var propertyInfo = propertyDiv.querySelector('div[class="property-info property-pane-panel ng-isolate-scope"]');
    
    if(propertyInfo.querySelector('tr[class="legal-attribute-row year-built"] td[class="value ng-binding"]')){
        var yearBuilt = propertyInfo.querySelector('tr[class="legal-attribute-row year-built"] td[class="value ng-binding"]').innerText;
        propertyDetails['year built'] = yearBuilt;
    }
    else{
        propertyDetails['year built'] ="";
    }
    
    if(propertyInfo.querySelector('tr[class="legal-attribute-row lot-plan"] td[class="value ng-binding"]')){
        var lotPlan = propertyInfo.querySelector('tr[class="legal-attribute-row lot-plan"] td[class="value ng-binding"]').innerText;
        propertyDetails['lot plan'] = lotPlan;
    }
    else{
        propertyDetails['lot plan'] = "";
    }
    
    if (propertyInfo.querySelector('tr[class="legal-attribute-row zoning"] td[class="value ng-binding"]')){
        var zoning = propertyInfo.querySelector('tr[class="legal-attribute-row zoning"] td[class="value ng-binding"]').innerText;
        propertyDetails['zoning'] = zoning;
    }else{

        propertyDetails['zoning'] = "";
    }

    if (propertyInfo.querySelector('tr[class="legal-attribute-row primary-land-use"] td[class="value ng-binding"]')) {

        var primaryLand = propertyInfo.querySelector('tr[class="legal-attribute-row primary-land-use"] td[class="value ng-binding"]').innerText;
        propertyDetails['primary land use'] = primaryLand;
    }
    else {
        propertyDetails['primary land use'] = "";
    }
     
    if (propertyInfo.querySelector('tr[class="legal-attribute-row issuing-area"] td[class="value ng-binding"]')){ 

        var issuingArea = propertyInfo.querySelector('tr[class="legal-attribute-row issuing-area"] td[class="value ng-binding"]').innerText;
        propertyDetails['issuing area'] = issuingArea;
    }
    else{

        propertyDetails['issuing area'] ="";
    }
    
    if(propertyInfo.querySelector('tr[class="legal-attribute-row land-size"] td[class="value"] square-meters')){

        var landSize = propertyInfo.querySelector('tr[class="legal-attribute-row land-size"] td[class="value"] square-meters').getAttribute('size');
        propertyDetails['land size'] = landSize;
    }else{

        propertyDetails['land size'] = "";
    }

    // get the property history
    var historyDiv = propertyDiv.querySelector('div[class="property-history-list ng-scope"]');

    var historyList = historyDiv.querySelectorAll('div[class="property-history-list-item ng-scope"]');

    propertyDetails['history'] = [];

    var i=0;

    for (; i<historyList.length; i++){
        var record = {};

        var itemText=historyList[i].querySelector('div[class="property-history-list-text"]');

        var soldPrice = itemText.querySelector('div[class="property-history-row-heading"]');

        var soldPriceStatus = soldPrice.querySelector('span[class="property-history-type ng-binding ng-scope"]').innerText;

        var soldPriceValue = soldPrice.querySelector('span[class="ng-binding ng-scope"]').innerText;


        var soldSource = itemText.querySelector('div[class="property-history-row"]');

        var soldDate = soldSource.querySelector('span[class="property-history-date ng-binding ng-scope"]').innerText;

        var sourceFrom = soldSource.querySelector('span[class="property-history-source ng-binding ng-scope"]').innerText;
         
        // //record['sold Price'] = historyList[item].innerHTML;
        record['sold status'] = soldPriceStatus;
        record['sold price'] = soldPriceValue;
        record['sold source'] = sourceFrom;
        record['sold date'] = soldDate;

        propertyDetails['history'].push(record);
        //console.log(item.innerHTML);
    } 

    
    return propertyDetails;
};

exports.getData = getData;

// casper.start(url);

// casper.then(function(){
//     var propertyDetails;
//     propertyDetails = this.evaluate(getData);
//     this.echo(JSON.stringify(propertyDetails), 'INFO');
// });

// casper.run(
//     function(){
//     this.echo("Done", "INFO").exit();
// });
