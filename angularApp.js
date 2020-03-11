var app = angular.module('hw8', ['ngMaterial', 'angular-svg-round-progressbar']);
app.controller('hw8Ctrl', HW8Controller);

function HW8Controller($scope, $http) 
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
    
    $scope.animations = true;
    
    $scope.searchModel = {
        page: "results",
        selectedItem: -1,
        selectedItemIDWishList: -1,
        pageNum: 0,
        numberOfPages: 0,
        pageJSON: null,
        itemJSON: null,
        photosJSON: null,
        similarItemsJSON: null,
        itemTab: 0,
        similarItemsShown: 5
    }
    
    $scope.userZip = "";
    
    //Checks for valid keyword and zip fields
    $scope.validKwd = function () { return ($scope.kwd.search(/[^ ]+/) != -1); }
    $scope.validZip = function () { return ($scope.zipMode && ($scope.userZip.search(/^[0-9]{5}$/) != -1)) || (!$scope.zipMode && ($scope.zip.search(/^[0-9]{5}$/) != -1)); }
    
    $scope.resetSelectedItem = function(key)
    {
        if (key == $scope.searchModel.selectedItemIDWishList)
        {
            $scope.searchModel.selectedItemIDWishList = -1;
        }
    }
    
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
        $scope.searchModel.error = false;
        $scope.searchModel.pageNum = 0;
        $scope.searchModel.itemTab = 0;
        $scope.searchModel.similarItemsShown = 5;
    }
    
    $scope.checkEmptyZip = function()
    {
        $scope.emptyZip = ($scope.zip.search(/[^ ]+/) == -1);
    }
    

    $scope.getZipAutoComplete = function()
    { 
        console.log("Search text: " + $scope.zip);
        
        return $http({
            method: 'GET',
            url: '/zipComplete',
            headers:
            {
                'Content-Type': 'application/json'
            },
            params:
            {
                Zip: $scope.zip
            },
        }).then(function(res) 
        { 
            console.log(res.data);
            
            var zips = [];
            
            for (var i = 0; i < res.data.length; i++)
            {
                zips.push(res.data[i].postalCode);
            }
            
            return zips;
        });
    }
    
    $scope.getSortedList = function()
    {
        var list = $scope.searchModel.similarItemsJSON.item.slice();
        console.log(list);
        
        var sortFn = $("#ordering").val();
        var ad = $("#ad").val();
        
        switch(sortFn)
        {
            case 'name': list.sort(function(a,b) { return (b.title).localeCompare(a.title); }); break;
            case 'left': list.sort(function(a,b) { return Number(b.timeLeft.substring(1,b.timeLeft.indexOf('D'))) - Number(a.timeLeft.substring(1,a.timeLeft.indexOf('D'))); }); break;
            case 'price': list.sort(function(a,b) { return Number(b.buyItNowPrice.__value__) - Number(a.buyItNowPrice.__value__); }); break;
            case 'cost': list.sort(function(a,b) { return Number(b.shippingCost.__value__) - Number(a.shippingCost.__value__); }); break;
        }
        
        if (ad == 'ascending') { list.reverse(); }
        
        return list;
    }
    
    $scope.loadProducts = function()
    {
        $scope.animations = false;
        
        $scope.loading = true;
        $scope.pill = "results";
        $scope.searched = false;
        $scope.searchModel.page = "results";
        
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
                $scope.searchModel.pageNum = 0;
                
                $scope.animations = true;
                
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
                
                $scope.searchModel.selectedItem = index; 
                $scope.searchModel.itemJSON = json; 
                $scope.searchModel.page = "item";
                $scope.searchModel.itemTab = 0;
                $scope.similarItemsShown = 5;

                console.log(json);
                
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
                SearchTerm: item.title[0].replace(/[^\x00-\x7F]/g, "")
            },
            success: function(json)
            {
                $scope.searchModel.photosJSON = json;
                console.log(json);
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
                $scope.searchModel.similarItemsJSON = JSON.parse(json).getSimilarItemsResponse.itemRecommendations;
                
                console.log($scope.searchModel.similarItemsJSON);
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
            localStorage.setItem(item.itemId, JSON.stringify(item));
            $scope.local = localStorage;
        }
        else
        {
            if (item.itemId==$scope.searchModel.selectedItemIDWishList)
            {
                $scope.searchModel.selectedItemIDWishList = -1;
            }
            
            localStorage.removeItem(item.itemId);
            $scope.local = localStorage;
        }
    }
    
    $scope.removeItem = function(key)
    {   
        if ($scope.pill == 'wish-list' && $scope.searchModel.page == "item")
        {
            $scope.searchModel.page = 'results';
            $scope.searchModel.selectedItemIDWishList = -1;
        }
        
        localStorage.removeItem(key);
        $scope.local = localStorage;
    }
    
    $scope.getCostOfStorage = function()
    {
        var cost = 0.0;
        
        for(const [k,v] of Object.entries($scope.local))
        {
            var json = JSON.parse(v);
            cost += Number(json.sellingStatus[0].currentPrice[0].__value__);
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

        //true - User Location; false - Other Zip Code
        $scope.zipMode = true;

        //Whether data is currently being fetched
        $scope.loading = false;

        $scope.searched = false;

        $scope.pill = "results";

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
        
        //Model variables for keyword and zip fields
        $scope.kwd = "";
        $scope.zip = "";

        $scope.emptyKwd = false;
        $scope.emptyZip = false;
    }
    
    $(document).ready(function() 
    {
        $("body").tooltip({ selector: '[data-toggle=tooltip]'});

        //Fetches zip code of user's location
        var xml = new XMLHttpRequest();
        xml.open("GET", "http://ip-api.com/json", false);
        xml.send();

        $scope.userZip = JSON.parse(xml.responseText).zip;
    });
}  