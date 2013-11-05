var app = angular.module('forageSearchUI', ['ngRoute', 'ngSanitize', 'ui.bootstrap']);

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
app.controller('searchCtrl', function($scope, $http, $location) {
  var q = $location.search()['q'];
  var forageURL = 'search?q=' + q;
  var possibleFilters = ['places', 'topics', 'organisations'];
  for (var i = 0; i < possibleFilters.length; i++) {
    if ($location.search()['filter[' + possibleFilters[i] + '][]'])
    forageURL += '&filter[' + possibleFilters[i] + '][]=' +
      $location.search()['filter[' + possibleFilters[i] + '][]'];
  }
  console.log(forageURL);
  $http.get(forageURL).success(function (data) {
//    console.log(data);
    var filterQueryString = '';
    var navs = {};
    var filter = {}
    if (data.query.filter) filter = data.query.filter;
    for (var i in data.facets) {
      //TODO deal with multiple values per filter
      if (!filter[i]) {
        for (var k in data.facets[i]) {
          var nav = {};
          nav['label'] = k;
          nav['count'] = data.facets[i][k];
          nav['url'] = ('#/' + forageURL + '&filter[' +
                        i + '][]=' + k);
          if (!navs[i]) navs[i] = [];
          navs[i].push(nav);
        }
      }
    }    
    console.log(navs);
    var activeFilters = [];
    for (var i in data.query.filter) {
      var thisActiveFilter = {};
      thisActiveFilter['filterName'] = i;
      thisActiveFilter['filterValue'] = data.query.filter[i][0];
      thisActiveFilter['filterURL'] = 
        '#/' + forageURL.replace('&filter[' + i + '][]=' + data.query.filter[i][0], '');
      activeFilters.push(thisActiveFilter);
    }
    $scope.activeFilters = activeFilters;
    $scope.facets = navs;
    $scope.results = data.hits;
    $scope.query = q;
    $scope.totalHits = data.totalHits;
  }).error(function () {});
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

