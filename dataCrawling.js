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
        loadImages: true, //The script is much faster when this field is set to false
        loadPlugins: true
    }
});

var url = 'http://www.onthehouse.com.au/';

var usrName = 'bo.song@projectmate.com.au';
var pwd = 'projectmate2015';

var getData = require('./getData');

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
    // this.capture('submit.png');
    // fs.write('login.html', this.getPageContent(),'w')
});

casper.then(function() {
    this.fill('form[name="homeSearchForm"]', {
        'search': 'NSW 2131'
    }, false);
    this.evaluate(function() {
        document.querySlector('form[name="homeSearchForm"]').search();
    });


    if (this.exists('#searchButton')) {
        this.echo('search button found', 'INFO');
    } else {
        this.echo('search button not found', 'ERROR');
    }

    this.click('button#searchButton');
    this.wait(10000);
    // this.capture('afterSubmit.png');
    // fs.write('afterSubmit.html', this.getPageContent(),'w');
    //this.wait(60000);
});

casper.then(function() {
    //   this.wait(60000);
    this.capture('afterSearch.png');
    fs.write('afterSearch.html', this.getPageContent(), 'w');

    // get the number of properties in a webpage 
    var hrefAll;

    propertyNum = this.evaluate(function() {
        var searchList = document.querySelector('div[class="property-list"]');
        var propertyItems = searchList.querySelectorAll('div[class="ng-scope"][ng-repeat="property in properties"]');
        var propertyNum = propertyItems.length;

        //var hrefAll = searchList.querySelectorAll('a[href]');

        return propertyNum;
    });

    // this.echo(propertyNum, 'INFO');
    var hrefStrPre = '#topOfSearchResults div div div:nth-child(';
    var hrefStrPost = ') div.property-list-item.ng-isolate-scope div.property-list-item-body div.property-item-details a span.suburb-state-postcode.ng-binding';

    //propertyNum=6;
    var i;
    var count = 1;
    for (i = 1; i <= propertyNum; i++) {
        var hrefStr = hrefStrPre + i + hrefStrPost;


//     casper.waitFor(function check() {
//     return this.evaluate(function() {
//         return document.querySelectorAll('ul.your-list li').length > 2;
//     });
// }, function then() {
//     this.captureSelector('yoursitelist.png', 'ul.your-list');
// });

        // this.wait(10000, function() {
        this.thenClick(hrefStr, function() {
            // this.waitFor(
            //     function check(){
            //     return this.evaluate(function(){
            //         var content = document.querySelector('div[name="propertyDetails"]');
            //         var contentLength = content.innerText.length;

            //         return contentLength > 1;
            //         });
            //     //return true; 
            //     }, 
            this.wait(20000,
                function then() {
                    this.capture(count + '.png');
                    fs.write(count + '-page.html', this.getPageContent(), 'w');
                    fs.write(count + '.html', this.getHTML('div[name="propertyDetails"]', true), 'w');
                    var propertyDetails;

                    propertyDetails = this.evaluate(getData.getData);
                    //this.echo(JSON.stringify(propertyDetails), 'INFO');
                    this.echo(count, 'INFO');
                    fs.write('2131-' + count + '.json', JSON.stringify(propertyDetails), 'w');
                    count = count + 1;
                    //i++;
                    //this.wait(60000);
                }
                // ,
                // function timeout() { // step to execute if check has failed
                //     this.echo("Can't load page", 'ERROR');
                // },
                // 60000 
            );
        });
    }

});


casper.run(
    function() {
        this.echo("Done", "INFO").exit();
    });