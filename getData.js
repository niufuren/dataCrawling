/*
test the getData function in dataCrawling.js
*/


var require = patchRequire(require);

function getData() {
    var propertyDetails = {};
    //get the status of the webpage

    var propertyDiv = document.querySelector('div[name="propertyDetails"]');

    var propertyReportStatus = propertyDiv.querySelector('div[class="property-status ng-binding"]');
    propertyDetails['report status'] = propertyReportStatus.innerHTML;

    // //get the property address

    var address = propertyDiv.querySelector('div[class="address"]');

    var street = address.querySelector('span[class="street-address ng-binding ng-scope"]').innerHTML;
    propertyDetails['street'] = street;

    var suburb = address.querySelector('span[itemprop="addressLocality"]').innerHTML;
    propertyDetails['suburb'] = suburb;

    var state = address.querySelector('span[itemprop="addressRegion"]').innerHTML;
    propertyDetails['state'] = state;

    var postcode = address.querySelector('span[itemprop="postalCode"]').innerHTML;
    propertyDetails['postcode'] = postcode;

    // //get the number of bathroom, bedroom and car park

    var property = propertyDiv.querySelector('ul[property="property"]');
    if (property.querySelector('li[class="property-attribute property-attribute-bed ng-binding"]')) {
        var bedroom = property.querySelector('li[class="property-attribute property-attribute-bed ng-binding"]').innerHTML;
        propertyDetails['bedroom'] = bedroom;
    } else {
        propertyDetails['bedroom'] = "";
    }


    if (property.querySelector('li[class="property-attribute property-attribute-bath ng-binding"]')) {
        var bathroom = property.querySelector('li[class="property-attribute property-attribute-bath ng-binding"]').innerHTML;
        propertyDetails['bathroom'] = bathroom;
    } else {
        propertyDetails['bathroom'] = "";
    }

    if (property.querySelector('li[class="property-attribute property-attribute-car ng-binding"]')) {

        var carpark = property.querySelector('li[class="property-attribute property-attribute-car ng-binding"]').innerHTML;
        propertyDetails['carpark'] = carpark;
    } else {
        propertyDetails['carpark'] = "";
    }
    
    var propertySold = propertyDiv.querySelector('span[ng-if="lastSoldText"]');
    if (propertySold){
        propertyDetails['last sold'] = propertySold.innerText;
    } else {
        propertyDetails['last sold'] = "";
    }

    // //get the type of the property
    var propertyType = propertyDiv.querySelector('div[class="property-type ng-binding ng-scope"]').innerHTML;
    propertyDetails['type'] = propertyType;

    //get the estimate price and updated date
    if (propertyDetails['report status'] == "Property Report") {
        if (propertyDiv.querySelector('div[class="estimate"] span')) {

            var estimatePrice = propertyDiv.querySelector('div[class="estimate"] span').innerText;
            // propertyDetails['estimate price'] = estimatePrice;

        } else {
            propertyDetails['estimate price'] = "";
        }

        //get the estimate accuracy

        if (propertyDiv.querySelector('div[ng-class="estimateAccuracyClass"] div')) {
            var accuracy = propertyDiv.querySelector('div[ng-class="estimateAccuracyClass"] div').innerText;
            propertyDetails['estimate accuracy'] = accuracy;
        } else {
            propertyDetails['estimate accuracy'] = "";
        }


        var updateDiv = propertyDiv.querySelector('div[class="date-row"] span');
        if (updateDiv)
            propertyDetails['update Time'] = updateDiv.innerText;
        else
            propertyDetails['update Time'] = "";


    } else if (propertyDetails['report status'] == "For Rent") {

        var rentPrice = propertyDiv.querySelector('div[class="summary-text ng-binding ng-scope for-rent"]')
        if (rentPrice)
            propertyDetails['rent price'] = rentPrice.innerText;
        else
            propertyDetails['rent price'] = "";

        var dataListed = propertyDiv.querySelector('div[class="date-row ng-scope"] span[class="date ng-binding"]')
        if (dataListed)
            propertyDetails['data listed'] = dataListed.innerText;
        else
            propertyDetails['data listed'] = "";

    } else {

        propertyDetails['estimate price'] = "";
        propertyDetails['estimate accuracy'] = "";
        propertyDetails['update Time'] = "";
    }

    /*
    get the property info: year built, lot plan, zoing, primary land use, issuing area, land size
    */
    var propertyInfo = propertyDiv.querySelector('div[class="property-info property-pane-panel ng-isolate-scope"]');

    if (propertyInfo.querySelector('tr[class="legal-attribute-row year-built"] td[class="value ng-binding"]')) {
        var yearBuilt = propertyInfo.querySelector('tr[class="legal-attribute-row year-built"] td[class="value ng-binding"]').innerText;
        propertyDetails['year built'] = yearBuilt;
    } else {
        propertyDetails['year built'] = "";
    }

    if (propertyInfo.querySelector('tr[class="legal-attribute-row lot-plan"] td[class="value ng-binding"]')) {
        var lotPlan = propertyInfo.querySelector('tr[class="legal-attribute-row lot-plan"] td[class="value ng-binding"]').innerText;
        propertyDetails['lot plan'] = lotPlan;
    } else {
        propertyDetails['lot plan'] = "";
    }

    if (propertyInfo.querySelector('tr[class="legal-attribute-row zoning"] td[class="value ng-binding"]')) {
        var zoning = propertyInfo.querySelector('tr[class="legal-attribute-row zoning"] td[class="value ng-binding"]').innerText;
        propertyDetails['zoning'] = zoning;
    } else {

        propertyDetails['zoning'] = "";
    }

    if (propertyInfo.querySelector('tr[class="legal-attribute-row primary-land-use"] td[class="value ng-binding"]')) {

        var primaryLand = propertyInfo.querySelector('tr[class="legal-attribute-row primary-land-use"] td[class="value ng-binding"]').innerText;
        propertyDetails['primary land use'] = primaryLand;
    } else {
        propertyDetails['primary land use'] = "";
    }

    if (propertyInfo.querySelector('tr[class="legal-attribute-row issuing-area"] td[class="value ng-binding"]')) {

        var issuingArea = propertyInfo.querySelector('tr[class="legal-attribute-row issuing-area"] td[class="value ng-binding"]').innerText;
        propertyDetails['issuing area'] = issuingArea;
    } else {

        propertyDetails['issuing area'] = "";
    }

    if (propertyInfo.querySelector('tr[class="legal-attribute-row land-size"] td[class="value"] square-meters')) {

        var landSize = propertyInfo.querySelector('tr[class="legal-attribute-row land-size"] td[class="value"] square-meters').getAttribute('size');
        propertyDetails['land size'] = landSize;
    } else {

        propertyDetails['land size'] = "";
    }

    /*get the property history*/
    propertyDetails['history'] = [];

    var historyDiv = propertyDiv.querySelector('div[class="property-history-list ng-scope"]');

    if (historyDiv){

        var historyList = historyDiv.querySelectorAll('div[class="property-history-list-item ng-scope"]');

        var i = 0;

        for (; i < historyList.length; i++) {
            var record = {};

            var itemText = historyList[i].querySelector('div[class="property-history-list-text"]');

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
    }else{
        propertyDetails['history']="";
    }


    return propertyDetails;
};

exports.getData = getData;