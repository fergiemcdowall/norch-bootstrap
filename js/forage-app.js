var app = angular.module('forageSearchUI', ['ngRoute',
                                            'ngSanitize',
                                            'ui.bootstrap',
                                            'infinite-scroll']);

//Controllers
app.controller('instantSearchCtrl', function($scope, $http, limitToFilter) {
  $scope.suggestions = function(suggestion) {
    return $http.get("matcher?beginsWith=" + suggestion).then(function(response){
      return limitToFilter(response.data, 15);
    });
  };
  $scope.onSelect = function ($item) {
    window.location = '#/search?q=' + $item
  };
});
app.controller('tabCtrl', function($scope, $location) {
  $scope.isActive = function(route) {
    return route === $location.path();
  }
});
app.controller('docCtrl', function($scope, $http) {
  $http.get('README.md').success(function (data) {
    $scope.readmeHTML = markdown.toHTML(data);
  }).error(function () {});
});
app.controller('aboutCtrl', function($scope, $http, $sce) {
  $http.get('package.json').success(function (data) {
    console.log(data);
    $scope.packageJSON = JSON.stringify(data, null, 2);
    //silly hack to get angular to render package.json in a div
    $scope.trustPackageJSON = function() {    
      return $sce.trustAsHtml($scope.packageJSON);
    };
  }).error(function () {});
});
app.controller('searchCtrl', function($scope, Forage) {
  $scope.forage = new Forage();
});

// constructor function to encapsulate HTTP and pagination logic
app.factory('Forage', function($http, $location) {
  var Forage = function() {
    this.activeFilters = {};
    this.busy = false;
    this.facets = {};
    this.items = [];
    this.offset = 0;
    this.pagesize = 20;
    this.totalHits = 0;
//    this.teaser = 'body';
  };

  Forage.prototype.nextPage = function() {
    this.q = $location.search()['q'];
    if (this.busy) return;
    this.busy = true;
    if ((this.offset) > this.totalHits) {
      this.busy = false;
      return;
    }
    var url = 'search?q=' + this.q + '&offset=' + this.offset +
      '&pagesize=' + this.pagesize;
    var possibleFilters = ['places', 'topics', 'organisations'];
    for (var i = 0; i < possibleFilters.length; i++) {
      if ($location.search()['filter[' + possibleFilters[i] + '][]']) {
        url += '&filter[' + possibleFilters[i] + '][]=' +
        $location.search()['filter[' + possibleFilters[i] + '][]'];
      }
    }
    if ($location.search()['facets']) {
      url += '&facets=' + $location.search()['facets'];
    }
    url += '&teaser=body';
    console.log(url);
    $http.get(url).success(function(data) {
      console.log(url);
      var filterQueryString = '';
      var navs = {};
      var filter = {}
      if (data.query.filter) filter = data.query.filter;

      for (var i in data.facets) {
        //TODO deal with multiple values per filter
        if (!filter[i]) {
          var thisFacetCat = data.facets[i];
          for (var k = 0; k < thisFacetCat.length; k++) {
            var nav = {};
            nav['label'] = thisFacetCat[k].key;
            nav['count'] = thisFacetCat[k].value;
            nav['url'] = ('#/' + url + '&filter[' +
                          i + '][]=' + thisFacetCat[k].key);
            if (!navs[i]) navs[i] = [];
            navs[i].push(nav);
          }

/*
          for (var k in data.facets[i]) {
            var nav = {};
            nav['label'] = k;
            nav['count'] = data.facets[i][k];
            nav['url'] = ('#/' + url + '&filter[' +
                          i + '][]=' + k);
            if (!navs[i]) navs[i] = [];
            navs[i].push(nav);
          }
*/
        }
      }

//      console.log(navs);
      var activeFilters = [];
      for (var i in data.query.filter) {
        var thisActiveFilter = {};
        thisActiveFilter['filterName'] = i;
        thisActiveFilter['filterValue'] = data.query.filter[i][0];
        thisActiveFilter['filterURL'] = 
          '#/' + url.replace('&filter[' + i + '][]=' + data.query.filter[i][0], '');
        activeFilters.push(thisActiveFilter);
      }
      this.activeFilters = activeFilters;
      this.facets = navs;
      this.items = this.items.concat(data.hits);
      this.offset = this.offset + 20;
      this.busy = false;
      this.totalHits = data.totalHits;
    }.bind(this));
  };
  return Forage;
});


//Routes
app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/about', {templateUrl: '/partials/about.html'}).
      when('/add', {templateUrl: '/partials/add.html'}).
      when('/docs', {templateUrl: '/partials/docs.html'}).
      when('/delete', {templateUrl: '/partials/delete.html'}).
      when('/querybuilder', {templateUrl: '/partials/querybuilder.html'}).
      when('/search', {templateUrl: '/partials/search.html'}).
      otherwise({redirectTo: '/about'});
  }]);


