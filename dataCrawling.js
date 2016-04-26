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
       'search': 2015 
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
    this.wait(6000);
    // this.capture('afterSubmit.png');
    // fs.write('afterSubmit.html', this.getPageContent(),'w');
    //this.wait(60000);
});

casper.then(function(){
//   this.wait(60000);
   this.capture('afterSearch.png');
   fs.write('afterSearch.html', this.getPageContent(),'w');

// get the number of properties in a webpage 
   var propertyNum;
   
   propertyNum = this.evaluate(function(){
    var searchList = document.querySelector('div[class="property-list"]');
    var propertyItems = searchList.querySelectorAll('div[class="ng-scope"][ng-repeat="property in properties"]');
    var propertyNum = propertyItems.length;

    return propertyNum;
   });

// this.echo(propertyNum, 'INFO');

});



casper.run(
    function(){
    this.echo("Done", "INFO").exit();
});

