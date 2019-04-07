const express = require('express');
const path = require('path');
const request = require('request');

const app = express();
const port = 3000;

const APP_ID = "MatthewJ-CS571-PRD-2f2cd4cf7-09303b6c";

const API_KEY_GOOGLE = "AIzaSyBwpgJ1itQ4GGtIt7FaK1BEFbnUhpQIYs4";
const SEARCH_ENGINE_ID = "014960389558713957690:vh9mjjot-u4";

const GeonamesUsername = "theeighthbyte";

app.use(express.static(__dirname));

//When the base route is requested, send the default HTML files
app.get('/', (req, res) => res.sendFile(path.join(__dirname + '/index.html')));
//When the JSON route is requested, construct the URL and send the JSON
app.get('/json', function(req, res) { getJSON(req, res); });
app.get('/jsonItem', function(req, res) { getItemJSON(req, res); } );
app.get('/googleImg', function(req, res) { getGoogleImages(req, res); });
app.get('/similarItems', function(req, res) {
    getSimilarItemsJSON(req, res);
});
app.get('/zipComplete', function(req, res) { getAutoComplete(req, res); });

//Listen on port 3000
app.listen(port, () => console.log(`Homework 8 listening on port ${port}!`));

function getJSON(req, res)
{
    var GET = req.query;
    
    var kwd = GET.Keyword.trim().replace(' ', '+');
    var category = GET.Category != "all" ? "&categoryId=" + GET.Category : "";
    
    var index = 2;
    var freeShipping = GET.FreeShipping == "true" ? "&itemFilter(" + index + ").name=FreeShippingOnly&itemFilter(" + (index++) + ").value=true" : "";
    var localPickup = GET.LocalPickup == "true" ? "&itemFilter(" + index + ").name=LocalPickupOnly&itemFilter(" + (index++) + ").value=true" : "";
    
    var searchNew = GET.ConditionNew == "true";
    var searchUsed = GET.ConditionUsed == "true";
    var searchUnspec = GET.ConditionUnspec == "true";
    
    var condition = "";
    var subIndex = 0;
    if (searchNew || searchUsed || searchUnspec) 
    { 
        condition += "&itemFilter(" + index + ").name=Condition";
        if (searchNew) { condition += "&itemFilter(" + index + ").value(" + (subIndex++) + ")=New"; }
        if (searchUsed) { condition += "&itemFilter(" + index + ").value(" + (subIndex++) + ")=Used"; }
        if (searchUnspec) { condition += "&itemFilter(" + index + ").value(" + (subIndex++) + ")=Unspecified"; }
    }
    
    var Distance = GET.Distance != "" ? GET.Distance : "10";
    var zip = GET.Here == "true" ? GET.UserLocZip : GET.Zip;
    
    var API_URL = "http://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsAdvanced&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=" + APP_ID + "&RESPONSE-DATA-FORMAT=JSON&RESTPAYLOAD&paginationInput.entriesPerPage=50&keywords=" + kwd + category + "&buyerPostalCode=" + zip + "&itemFilter(0).name=MaxDistance&itemFilter(0).value=" + Distance + "&itemFilter(1).name=HideDuplicateItems&itemFilter(1).value=true" + freeShipping + localPickup + condition + "&outputSelector(0)=SellerInfo&outputSelector(1)=StoreInfo";
    
    console.log(API_URL);
    
    //Get JSON from URL and send it to client
    request({url: API_URL, json: true}, 
    function(error, response, body)
    {
        res.send(body.findItemsAdvancedResponse[0].searchResult[0].item);
    });
}

function getItemJSON(req, res)
{
    var GET = req.query;
    var itemID = GET.ItemID;
    
    var API_URL = "http://open.api.ebay.com/shopping?callname=GetSingleItem&responseencoding=JSON&appid=" + APP_ID + "&siteid=0&version=967&ItemID=" + itemID + "&IncludeSelector=Description,Details,ItemSpecifics";
    
    console.log(API_URL);
    
    request({url: API_URL, json: true}, 
    function(error, response, body)
    {
        res.send(body.Item);
    });
}

function getGoogleImages(req, res)
{
    var GET = req.query;
    var search = GET.SearchTerm;
    
    var API_URL = "https://www.googleapis.com/customsearch/v1?q=" + search.replace(/ /g, '+').replace(/'/g, '') + "&cx=" + SEARCH_ENGINE_ID + "&imgSize=huge&imgType=news&num=8&searchType=image&key=" + API_KEY_GOOGLE;
    
    console.log(API_URL);
    
    request({url: API_URL, json: true},
    function(error, response, body)
    {
        res.send(body.items);
    });
}

function getSimilarItemsJSON(req, res)
{
    var GET = req.query;
    var itemID = GET.Item;
    
    console.log(itemID);
    
    var API_URL = "http://svcs.ebay.com/MerchandisingService?OPERATION-NAME=getSimilarItems&SERVICE-NAME=MerchandisingService&SERVICE-VERSION=1.1.0&CONSUMER-ID=" + APP_ID + "&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&itemId=" + itemID + "&maxResults=20";
    
    console.log(API_URL);
    
    request({url: API_URL, json: false},
    function(error, response, body)
    {
        res.send(body);
    });
}

function getAutoComplete(req, res)
{
    var GET = req.query;
    var zip = GET.Zip;
    
    var API_URL = "http://api.geonames.org/postalCodeSearchJSON?postalcode_startsWith=" + zip + "&username=" + GeonamesUsername + "&country=US&maxRows=5";
    
    request({url: API_URL, json: true},
    function(error, response, body)
    {
        res.send(body.postalCodes);
    });
}