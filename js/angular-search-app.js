var app = angular.module('forageSearchUI', ['ngRoute', 'ui.bootstrap']);

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


//Routes
app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/indexer', {
        templateUrl: '/partials/indexer.html',
        controller: 'instantSearchCtrl'
      }).
      when('/about', {
        templateUrl: '/partials/about.html'
      }).
      when('/search', {
        templateUrl: '/partials/search.html'
      }).
      otherwise({
        redirectTo: '/search'
      });
  }]);

