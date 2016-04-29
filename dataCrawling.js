/*
crawling the website onthehouse. Collecting data for the feasibility calculation

casperjs --engine=slimerjs dataCrawling.js
*/

fs = require('fs');

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

var url='http://www.onthehouse.com.au/';

var usrName='bo.song@projectmate.com.au';
var pwd='projectmate2015';

//var getData = require('./getData');

function getData(){
    var propertyDetails = {};
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
    var estimatePrice = propertyDiv.querySelector('div[class="estimate"]').innerText;
    propertyDetails['estimate price']=estimatePrice;

    //get the estimate accuracy
    var accuracy = propertyDiv.querySelector('div[ng-class="estimateAccuracyClass"] div').innerText;
    propertyDetails['estimate accuracy'] = accuracy;

    var updateDiv = propertyDiv.querySelector('div[class="date-row"] span').innerText;
    propertyDetails['update Time'] = updateDiv;
    
    /*
    get the property info: year built, lot plan, zoing, primary land use, issuing area, land size
    */
    var propertyInfo = propertyDiv.querySelector('div[class="property-info property-pane-panel ng-isolate-scope"]');

    var yearBuilt = propertyInfo.querySelector('tr[class="legal-attribute-row year-built"] td[class="value ng-binding"]').innerText;
    propertyDetails['year built'] = yearBuilt;
    
    if(propertyInfo.querySelector('tr[class="legal-attribute-row lot-plan"] td[class="value ng-binding"]')){
        var lotPlan = propertyInfo.querySelector('tr[class="legal-attribute-row lot-plan"] td[class="value ng-binding"]').innerText;
        propertyDetails['lot plan'] = lotPlan;
    }
    else{
        propertyDetails['lot plan'] = "";
    }

    var zoning = propertyInfo.querySelector('tr[class="legal-attribute-row zoning"] td[class="value ng-binding"]').innerText;
    propertyDetails['zoning'] = zoning;
    
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

    var landSize = propertyInfo.querySelector('tr[class="legal-attribute-row land-size"] td[class="value"] square-meters').getAttribute('size');
    propertyDetails['land size'] = landSize;

    // // get the property history
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

casper.start(url);

casper.then(function(){
//    fs.write('content.html', this.getPageContent(),'w');

    this.click('#nav-bar div.ng-scope div div a'); // click login button

//    this.capture('afterLogin.png'); 
});

casper.then(function(){
    //this.capture('afterLogin2.png'); 
    // body > div.modal.fade.ng-isolate-scope.membership-modal.log-in-modal.in > div > div > log-in-form > div > form
    var formDiv;
    // var formDiv='body div.modal.fade.ng-isolate-scope.membership-modal.log-in-modal.in div div log-in-form div form';

    formDiv='form[name="logInForm"]';

    if (this.exists(formDiv)){
        this.echo('login form found', 'INFO');
    }
    else{
        this.echo('login form not found', 'ERROR');
    }

    this.fill('form[name="logInForm"]',{
        'email': usrName,
        'password':pwd
        }, false);

    this.evaluate(function(){
        document.querySelector('form[name="logInForm"]').logIn();
    });
    

    if (this.exists('button[type="submit"][tabindex="3"]')){
        this.echo('submit button found', 'INFO');
    }
    else{
        this.echo('submit button not found', 'ERROR');
    }
    
    this.click('button[type="submit"][tabindex="3"]');
    // this.capture('submit.png');
    // fs.write('login.html', this.getPageContent(),'w')
});

casper.then(function(){
    this.fill('form[name="homeSearchForm"]',{
       'search': 'NSW 2015' 
    }, false);
    this.evaluate(function(){
        document.querySlector('form[name="homeSearchForm"]').search(); 
    });
   

    if (this.exists('#searchButton')){
        this.echo('search button found', 'INFO');
    }
    else{
        this.echo('search button not found', 'ERROR');
    }

    this.click('button#searchButton');
    this.wait(10000);
    // this.capture('afterSubmit.png');
    // fs.write('afterSubmit.html', this.getPageContent(),'w');
    //this.wait(60000);
});

casper.then(function(){
//   this.wait(60000);
   this.capture('afterSearch.png');
   fs.write('afterSearch.html', this.getPageContent(),'w');

// get the number of properties in a webpage 
   var hrefAll;

   propertyNum = this.evaluate(function(){
    var searchList = document.querySelector('div[class="property-list"]');
    var propertyItems = searchList.querySelectorAll('div[class="ng-scope"][ng-repeat="property in properties"]');
    var propertyNum = propertyItems.length;

    //var hrefAll = searchList.querySelectorAll('a[href]');

    return propertyNum;
   });

// this.echo(propertyNum, 'INFO');
   var hrefStrPre = '#topOfSearchResults div div div:nth-child(';
   var hrefStrPost = ') div.property-list-item.ng-isolate-scope div.property-list-item-body div.property-item-details a span.suburb-state-postcode.ng-binding';
   
   propertyNum=6;
   var i;
   var count=1; 
   for (i=1; i<=propertyNum;i++ ){
       var hrefStr = hrefStrPre+i+hrefStrPost;
       
       this.thenClick(hrefStr, function(){
           this.wait(10000, function(){
                this.capture(count+'.png'); 
                fs.write(count+'-page.html', this.getPageContent(),'w');
                fs.write(count+'.html',this.getHTML('div[name="propertyDetails"]',true),'w');
                var propertyDetails;
                propertyDetails = this.evaluate(getData);
                //propertyDetails = this.evaluate(getData.getData);
                //this.echo(JSON.stringify(propertyDetails), 'INFO');
                this.echo(count, 'INFO');
                fs.write('2015-'+count+'.json',JSON.stringify(propertyDetails),'w');
                count=count+1;
                //i++;
                //this.wait(60000);
           });      
       });
   }

});


casper.run(
    function(){
    this.echo("Done", "INFO").exit();
});

