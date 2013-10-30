var app = angular.module('forageSearchUI', ['ngRoute', 'ngSanitize', 'ui.bootstrap']);

//Controllers
app.controller('instantSearchCtrl', function($scope, $http, limitToFilter) {
  $scope.$watch('searchString', function () {
    $http.get('search?q=' + $scope.searchString).success(function (data) {
      var docs = data.hits;
      $scope.results = docs;
    }).error(function () {});
  });
  $scope.suggestions = function(suggestion) {
    return $http.get("matcher?beginsWith=" + suggestion).then(function(response){
      return limitToFilter(response.data, 15);
    });
  };
});
app.controller('tabCtrl', function($scope, $location) {
  $scope.isActive = function(route) {
    return route === $location.path();
  }
});
app.controller('aboutCtrl', function($scope, $http) {
  $http.get('README.md').success(function (data) {
    $scope.readmeHTML = markdown.toHTML(data);
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

