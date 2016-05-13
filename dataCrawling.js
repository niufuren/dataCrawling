/*
crawling the website onthehouse. Collecting data for the feasibility calculation

casperjs --engine=slimerjs dataCrawling.js
*/

fs = require('fs');

var casper = require('casper').create({
    verbose: true,
    //logLevel: 'debug',
    viewportSize: {
        width: 1024,
        height: 1600
    },
    pageSettings: {
        loadImages: true, //The script is much faster when this field is set to false
        loadPlugins: true
    }
});

var url = 'http://www.onthehouse.com.au/';

var usrName = 'bo.song@projectmate.com.au';
var pwd = 'projectmate2015';

var getData = require('./getData');

var pageNum = 1; 

var searchSuburb = 'Summer Hill';
var searchPostcode = 2130; //The postcode of Ashfield

var searchState = 'NSW';

var jsonFolder = './json/';

var htmlFolder = './html/';

var searchStreet;

// read the street name from the csv file
var streets=[]; 
stream = fs.open('summer_hill.csv', 'r');
line = stream.readLine();
i = 0;

while(line) {
    if (i>0){
        //put the name of street into an array
        streets.push(line);
    } 
    line = stream.readLine();
    i++;
}

console.log(streets);


var processPage=function(){
    this.echo("**********");
    this.echo(searchStreet, 'INFO');
    this.capture('afterSearch-'+ pageNum+'.png');
    fs.write('afterSearch-'+pageNum+'.html', this.getPageContent(), 'w');

    var currentPageNum=pageNum;
    
    //show the number of search result
    if(currentPageNum==1){
        var searchNum =  this.evaluate(function(){
            var matchingResult;
            var searchResult = document.querySelector(
                'div[class="number-of-results ng-scope"]')
            if (searchResult){
                var searchResultString = searchResult.innerText;
                matchingResult = searchResultString.match(/\d+/) 
                }
            return matchingResult;
           });
        this.echo('the matching result is '+ searchNum, 'INFO'); 

        if (searchNum > 1000){
            this.echo('the result exceeds the maximum', 'ERROR');
            this.exit();
        }       
    }

    this.echo("current page number is "+currentPageNum, 'INFO');
    this.then( function(){
    var propertyNum = this.evaluate(function() {
        var searchList = document.querySelector('div[class="property-list"]');
        var propertyItems = searchList.querySelectorAll('div[class="ng-scope"][ng-repeat="property in properties"]');
        var propertyNum = propertyItems.length;

        //var hrefAll = searchList.querySelectorAll('a[href]');

        return propertyNum;
    });

    this.echo("number of property is "+propertyNum, 'INFO');

    var hrefStrPre = '#topOfSearchResults div div div:nth-child(';
    // var hrefStrPost = ') div.property-list-item.ng-isolate-scope div.property-list-item-body div.property-item-details a span.suburb-state-postcode.ng-binding';

    var hrefStrPost = ') div.property-list-item.ng-isolate-scope div.property-list-item-body div.property-item-details a';

    // //propertyNum=6;
    var i=1;
    //var count = 1;
    for ( ; i <= propertyNum;  ) {
        

        // this.wait(10000, function() {
        // if (this.exists(hrefStr)){
        //     this.echo('the hypelink exists', 'INFO');
        // }
        (function(count){
        casper.then( function(){
            var hrefStr = hrefStrPre + count + hrefStrPost;
            //this.echo('the value of i is'+JSON.stringify(i)+' '+'the value of count'+count, 'INFO');

            this.wait(5000);
            this.thenClick(hrefStr, function() {
                this.waitForSelector('div[class="property-pane-inner-container"]',
                function() {
                    this.echo("the item "+count, 'INFO');
                    this.capture(count + '.png');
                    fs.write(htmlFolder+currentPageNum+'-'+count + '-wholePage.html', this.getPageContent(), 'w');
                    fs.write(htmlFolder+currentPageNum+'-'+count + '.html', this.getHTML('div[name="propertyDetails"]', true), 'w');
                    //var propertyDetails;

                    var propertyDetails = this.evaluate(getData.getData);
                    //this.echo(JSON.stringify(propertyDetails), 'INFO');

                    fs.write(jsonFolder+searchPostcode+'-'+searchStreet+'-'+ currentPageNum+'-'+count + '.json', JSON.stringify(propertyDetails), 'w');
                    //count = count + 1;
                },
                function() { 
                        this.capture('timeout-'+searchStreet+'-'+currentPageNum+'-'+count+'.png');
                        fs.write('timeout-'+searchStreet+'-'+currentPageNum+'-'+count+'.html', this.getPageContent(),'w');
                        count = count + 1;}, 
                10000 
            );
        });
           //i++; 
        });    
        })(i);
        
        i++;
       // count++;
        
    }

    });
    
    this.then(function(){
    var nextPagebutton;
    nextPagebutton = 'a[class="paginator-button paginator-button-next"]'; // the button of next page 

    if (this.exists(nextPagebutton)){
        pageNum = currentPageNum+1;
        this.echo("the next page number is "+pageNum, 'INFO');
        this.click(nextPagebutton);
        this.wait(1000);
        this.then(function(){

            this.waitForSelector('div[class="search-results-pane show-pagination"]',
                                    processPage,
                                    function() { 
                                    this.capture('timeout-'+searchStreet+'-'+currentPageNum +'.png');
                                    fs.write('timeout-'+searchStreet+'-'+currentPageNum +'.html', this.getPageContent(),'w');
                                    }, 
                                    10000 
                                 );
        });
    }else{
        //this.echo("Done", "INFO").exit();
        pageNum = 1;
        this.echo("the page number is changed to "+ pageNum, "INFO")
    }
   });
};

//console.log(getData.answer1());

casper.start(url);

casper.then(function() {
    //    fs.write('content.html', this.getPageContent(),'w');

    this.click('#nav-bar div.ng-scope div div a'); // click login button

    //    this.capture('afterLogin.png'); 
});

casper.then(function() {
    //this.capture('afterLogin2.png'); 
    // body > div.modal.fade.ng-isolate-scope.membership-modal.log-in-modal.in > div > div > log-in-form > div > form
    var formDiv;
    // var formDiv='body div.modal.fade.ng-isolate-scope.membership-modal.log-in-modal.in div div log-in-form div form';

    formDiv = 'form[name="logInForm"]';

    if (this.exists(formDiv)) {
        this.echo('login form found', 'INFO');
    } else {
        this.echo('login form not found', 'ERROR');
    }

    this.fill('form[name="logInForm"]', {
        'email': usrName,
        'password': pwd
    }, false);

    this.evaluate(function() {
        document.querySelector('form[name="logInForm"]').logIn();
    });


    if (this.exists('button[type="submit"][tabindex="3"]')) {
        this.echo('submit button found', 'INFO');
    } else {
        this.echo('submit button not found', 'ERROR');
    }

    this.click('button[type="submit"][tabindex="3"]');

    this.wait(6000);
    // this.capture('submit.png');
    // fs.write('login.html', this.getPageContent(),'w')
});

//casper.each(streets, function(self, street){
casper.eachThen(streets, function(street){

    var currentSearchStreet = street.data;

    searchStreet = currentSearchStreet;
    //this.echo('the street is '+ street, 'INFO');
    this.echo('the current street is '+ searchStreet, 'INFO');
    this.echo('the current suburb is '+ searchSuburb, 'INFO');
    var searchString = searchStreet+','+searchSuburb+','+searchState+' '+searchPostcode;
    this.echo('the searchString is '+ searchString, 'INFO');

    // if (this.exists('form[name="homeSearchForm"]')) {
    //         this.echo('search form  found', 'INFO');
    //     } else {
    //         this.echo('search form not found', 'ERROR');
    //     }

    this.wait(6000);
    this.capture('afterSearch.png');
    fs.write('afterSearch.html', this.getPageContent(),'w');
    
    if (this.exists('form[name="searchControlsForm"]')){
        
        this.fill('form[name="searchControlsForm"]', {
                  'search': searchString 
                   }, false);

       this.evaluate(function() {
            document.querySlector('form[name="searchControlsForm"]').search();
        });

    }else if (this.exists('form[name="homeSearchForm"]')){
        this.fill('form[name="homeSearchForm"]', {
                  'search': searchString
                  }, false);

        this.evaluate(function() {
            document.querySlector('form[name="homeSearchForm"]').search();
        });

    }else{
        this.echo('search form not found', 'ERROR');
    }


    if (this.exists('#searchButton')) {
        this.echo('search button found', 'INFO');
        this.click('button#searchButton');
        this.echo('search button is clicked');
    } else {
        this.echo('search button not found', 'ERROR');
    }
    
    this.wait(6000);
    this.waitForSelector('div[class="search-results-main-pane"]', 
                        processPage,  
                        function() { 
                        this.capture(searchStreet+'.png');
                        fs.write(searchStreet+'.html', this.getPageContent(),'w');}, 
                        10000
                        );
});

//casper.waitForSelector('div[class="search-results-pane show-pagination"]', processPage2);

casper.run(
    function() {
        this.echo("Done", "INFO").exit();
    });