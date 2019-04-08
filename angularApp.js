var app = angular.module('hw8', ['ngMaterial', 'angular-svg-round-progressbar']);
app.controller('hw8Ctrl', HW8Controller);

function HW8Controller($scope) 
{
    //Model variables for keyword and zip fields
    $scope.kwd = "";
    $scope.zip = "";

    //user - User Location; other - Other Zip Code
    $scope.zipMode = true;

    //Whether data is currently being fetched
    $scope.loading = false;
    
    $scope.searched = false;

    //Browser local storage
    $scope.local = localStorage;

    $scope.pill = "results";
    
    $scope.emptyKwd = false;
    $scope.emptyZip = false;
    
    $scope.searchModel = {
        page: "results",
        selectedItem: -1,
        pageNum: 0,
        numberOfPages: 0,
        pageJSON: null,
        itemJSON: null,
        photosJSON: null,
        similarItemsJSON: null,
        itemTab: 0,
        similarItemsShown: 5
    }
    
    //Zip code autocomplete suggestions
    $scope.suggestedZipCodes = [];
    
    $scope.userZip = "";
    
    //Checks for valid keyword and zip fields
    $scope.validKwd = function () { return ($scope.kwd.search(/[^ ]+/) != -1); }
    $scope.validZip = function () { return ($scope.zipMode && ($scope.userZip.search(/^[0-9]{5}$/) != -1)) || (!$scope.zipMode && ($scope.zip.search(/^[0-9]{5}$/) != -1)); }
    
    $scope.cutString = function(str)
    {
        var cutStr = Number(str.substring(1, str.indexOf('D')));
        return cutStr + ((cutStr == 1) ? ' day' : ' days');
    }
    
    $scope.checkEmptyKwd = function()
    {
        $scope.emptyKwd = ($scope.kwd.search(/[^ ]+/) == -1);
    }
    
    $scope.resetModel = function()
    {
        //The model variables for the search tab
        $scope.searchModel.page = "results";
        $scope.searchModel.selectedItem = -1;
        $scope.searchModel.error = false;
        $scope.searchModel.pageNum = 0;
        $scope.searchModel.itemTab = 0;
        $scope.searchModel.similarItemsShown = 5;
    }
    
    $scope.sortInput = function()
    {
        alert("Needs sorting");
    }
    
    $scope.getZipAutoComplete = function(searchText)
    {
        $scope.zip = searchText;
        
        if (searchText.search(/[^ ]+/) == -1) { $scope.suggestedZipCodes = []; $scope.emptyZip = true; return; }
        else { $scope.emptyZip = false; }
        
        $.ajax({
            url: '/zipComplete',
            type: 'GET',
            contentType: 'application/json',
            data:
            {
                Zip: searchText
            },
            success: function(json)
            {
            },
            error: function()
            {
                $scope.suggestedZipCodes = [];
            }
        }).then(function(res) 
        { 
            for (var i = 0; i < res.length; i++) 
            { 
                $scope.suggestedZipCodes[i] = res[i].postalCode; 
            }
            
            console.log($scope.suggestedZipCodes);
            
            $scope.$apply();
        });
    }
    
    $scope.loadProducts = function()
    {
        $scope.loading = true;
        $scope.pill = "results";
        $scope.searched = false;
        
        $.ajax({
            url: '/json',
            type: 'GET',
            contentType: 'application/json',
            data:
            {
                Keyword: $("#kwd").val(),
                Category: $("#category").val(),
                ConditionNew: $("#new").is(":checked"),
                ConditionUsed: $("#used").is(":checked"),
                ConditionUnspec: $("#unspec").is(":checked"),
                LocalPickup: $("#local").is(":checked"),
                FreeShipping: $("#free").is(":checked"),
                Distance: $("#miles").val(),
                Here: $("#here").is(":checked"),
                ZipActive: $("#zip").is(":checked"),
                Zip: $scope.zip,
                UserLocZip: $scope.userZip
            },
            success: function(json)
            {
                console.log(json);
                
                $scope.loading = false;
                
                $scope.searchModel.pageJSON = json;
                $scope.searchModel.numberOfPages = Math.floor((json.length - 1) / 10) + 1;

                $scope.searchModel.selectedItem = -1;
                $scope.searchModel.page = "results";
                $scope.searchModel.pageNum = 0;
                
                $scope.searched = true;
                
                if (json.length == 0)
                {
                    $scope.searchModel.error = true;
                }
                
                $scope.$apply();
            },
            error: function()
            {
                alert("Error");
            }
        });
    }
    
    $scope.loadItem = function(itemId, index)
    {
        $scope.loading = true;
        
        $.ajax({
            url: '/jsonItem',
            type: 'GET',
            contentType: 'application/json',
            data:
            {
                ItemID: itemId
            },
            success: function(json)
            {
                $scope.loading = false;
                
                console.log(json);
                
                if($scope.pill=="results") 
                {
                    $scope.searchModel.selectedItem = index; 
                    $scope.searchModel.itemJSON = json; 
                    $scope.searchModel.page = "item";
                    $scope.searchModel.itemTab = 0;
                    $scope.similarItemsShown = 5;
                    
                    console.log(json);
                }
                else 
                { 
                    $scope.wishListModel.selectedItem = index; 
                    $scope.wishListModel.itemJSON = json;
                    $scope.wishListModel.page = "item"; 
                    $scope.wishListModel.itemTab = 0; 
                }
                
                $scope.$apply();
            },
            error: function()
            {
                $scope.loading = false;
                alert("Item has expired. Please try another.");
            }
        });
    }
    
    $scope.loadPhotos = function(item)
    {
        $.ajax({
            url: '/googleImg',
            type: 'GET',
            contentType: 'application/json',
            data:
            {
                SearchTerm: item.title[0]
            },
            success: function(json)
            {
                if($scope.pill=="results")
                {
                    $scope.searchModel.photosJSON = json;
                    console.log(json);
                }
                else
                {
                    $scope.wishListModel.photosJSON = json;
                }
            },
            error: function()
            {
            }
        });
    }
    
    $scope.loadSimilarItems = function(item)
    {
        $.ajax({
            url: '/similarItems',
            type: 'GET',
            contentType: 'application/json',
            data:
            {
                Item: item.itemId
            },
            success: function(json)
            {
                if($scope.pill=="results")
                {
                    $scope.searchModel.similarItemsJSON = JSON.parse(json).getSimilarItemsResponse.itemRecommendations;
                    console.log($scope.searchModel.similarItemsJSON);
                }
                else
                {
                    $scope.wishListModel.similarItemsJSON = json;
                }
            },
            error: function()
            {
            }
        });
    }
    
    $scope.getIndexLastSpace = function(text)
    {
        var t = text;

        if (t.length > 35) 
        {
            var ls = 35;
            while (t[ls] != ' '  && ls > -1) { ls--; }
            
            return ls;
        }
        else { return 35; }
    }
    
    $scope.parseJSON = function(json)
    {
        return JSON.parse(json);
    }
    
    $scope.toggleItem = function(item)
    {
        if (localStorage.getItem(item.itemId) == null)
        {
            var value = {data: [item.galleryURL[0], item.title[0], item.sellingStatus[0].currentPrice[0].__value__, item.shippingInfo[0].shippingServiceCost[0].__value__, item.sellerInfo[0].sellerUserName[0]]};
            
            localStorage.setItem(item.itemId, JSON.stringify(value));
            $scope.local = localStorage;
        }
        else
        {
            localStorage.removeItem(item.itemId);
            $scope.local = localStorage;
        }
    }
    
    $scope.removeItem = function(key)
    {
        localStorage.removeItem(key);
        $scope.local = localStorage;
    }
    
    $scope.getCostOfStorage = function()
    {
        var cost = 0.0;
        
        for(const [k,v] of Object.entries($scope.local))
        {
            var json = JSON.parse(v);
            cost += Number(json.data[2]);
        }
        
        return cost.toFixed(2);
    }
    
    $scope.goToWishList = function()
    {
        $("#wish-list-pill").addClass("active");
        $("#results-pill").removeClass("active");
        
        //$scope.pill = "wish-list";
    }
    
    $scope.clearForm = function()
    {
        //Model variables for keyword and zip fields
        $scope.kwd = "";
        $scope.zip = "";
        
        //Clears the form entirely
        document.getElementById('srch').disabled = true;
        document.getElementById('category').selectedIndex = 0;

        document.getElementById('new').checked = false; 
        document.getElementById('used').checked = false; 
        document.getElementById('unspec').checked = false;

        document.getElementById('local').checked = false; 
        document.getElementById('free').checked = false;

        document.getElementById('miles').value = "";

        document.getElementById('here').checked = true;
        document.getElementById('zip').checked = false;

        //user - User Location; other - Other Zip Code
        $scope.zipMode = true;

        //Whether data is currently being fetched
        $scope.loading = false;

        $scope.searched = false;

        $scope.pill = "results";

        $scope.emptyKwd = false;
        $scope.emptyZip = false;
        
        $scope.searchModel = {
            page: "results",
            selectedItem: -1,
            pageNum: 0,
            numberOfPages: 0,
            pageJSON: null,
            itemJSON: null,
            photosJSON: null,
            similarItemsJSON: null,
            itemTab: 0,
            similarItemsShown: 5
        }
        
        //Zip code autocomplete suggestions
        $scope.suggestedZipCodes = [];
    }
    
    $(document).ready(function() 
    {
        //Fetches zip code of user's location
        var xml = new XMLHttpRequest();
        xml.open("GET", "http://ip-api.com/json", false);
        xml.send();

        $scope.userZip = JSON.parse(xml.responseText).zip;
    });
}  