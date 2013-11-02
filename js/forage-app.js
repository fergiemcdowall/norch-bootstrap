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
  $http.get('search?q=' + $location.search()['q']).success(function (data) {
    var docs = data.hits;
    $scope.results = docs;
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

