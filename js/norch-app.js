'use strict';

angular
  .module('norchSearchUI', [
    'ngRoute',
    'ngSanitize',
    'ui.bootstrap',
    'infinite-scroll'
  ])
  .controller('instantSearchCtrl',
    function ($scope, $window, $http, limitToFilter) {
      $scope.suggestions = function (suggestion) {
        return $http.get("matcher?beginsWith=" + suggestion)
          .then(function (response) {
            return limitToFilter(response.data, 15);
          });
      };
      $scope.onSelect = function ($item) {
        $window.location = '#/search?q=' + $item;
      };
    })
  .controller('tabCtrl', function ($scope, $location) {
    $scope.isActive = function (route) {
      return route === $location.path();
    };
  })
  .controller('docCtrl', function ($scope, $http) {
    $http.get('README.md').success(function (data) {
      $scope.readmeHTML = markdown.toHTML(data);
    });
  })
  .controller('aboutCtrl', function ($scope, $http, $sce) {
    $http.get('package.json').success(function (data) {
      $scope.packageJSON = JSON.stringify(data, null, 2);
      $scope.trustPackageJSON = function () {
        return $sce.trustAsHtml($scope.packageJSON);
      };
    });
  })
  .controller('searchCtrl', function ($scope, Norch) {
    $scope.norch = new Norch();
  })
  .controller('addCtrl', function ($scope, $http) {
    $scope.jsonString = '';
    $scope.msg = '';
    $scope.err = '';
    var json = '';
    $scope.index = function () {
      try {
        json = JSON.parse($scope.jsonString);
      } catch (e) {
        $scope.err = 'Invalid JSON';
        $scope.msg = '';
        return;
      }
      $http.post('/indexer', {document: json})
        .success(function () {
          $scope.msg = 'Success!';
          $scope.err = '';
        })
        .error(function (err) {
          $scope.err = err;
          $scope.msg = '';
        });
    };

  })
  .factory('Norch', function ($http, $location) {
    var Norch = function() {
      this.activeFilters = {};
      this.busy = false;
      this.facets = {};
      this.items = [];
      this.offset = 0;
      this.pagesize = 20;
      this.totalHits = 0;
    };

    Norch.prototype.nextPage = function() {
      this.q = $location.search().q;
      if (this.busy) return;
      this.busy = true;
      if (this.offset > this.totalHits) {
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
      $http.get(url).success(function(data) {
        var filterQueryString = '';
        var navs = {};
        var filter = {};
        if (data.query.filter) filter = data.query.filter;

        for (var i in data.facets) {
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
          }
        }
		if (data.query.filter) {
          this.activeFilters = data.query.filter
            .reduce(function (prev, curr, idx, arr) {
              var thisActiveFilter = {};
              thisActiveFilter['filterName'] = idx;
              thisActiveFilter['filterValue'] = data.query.filter[idx][0];
              var replacer = '&filter[' + idx + '][]=' + data.query.filter[i][0];
              thisActiveFilter['filterURL'] = '#/' + url.replace(replacer, '');
              return thisActiveFilter;
            }, []);
		} else {
		  this.activeFilters = [];
		}
        this.facets = navs;
        this.items = this.items.concat(data.hits);
        this.offset = this.offset + 20;
        this.busy = false;
        this.totalHits = data.totalHits;
      }.bind(this));
    };
    return Norch;
  })
  .config(function($routeProvider) {
      $routeProvider
        .when('/about', {templateUrl: '/partials/about.html'})
        .when('/add', {
          templateUrl: '/partials/add.html',
          controller: 'addCtrl'
        })
        .when('/docs', {
          templateUrl: '/partials/docs.html',
          controller: 'docCtrl'
        })
        .when('/delete', {templateUrl: '/partials/delete.html'})
        .when('/search', {templateUrl: '/partials/search.html'})
        .otherwise({redirectTo: '/about'});
  });


