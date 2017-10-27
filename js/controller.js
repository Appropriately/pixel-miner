var app = angular.module('ClickerGame', []);

  app.controller('BuildingManager', function ($scope, $http, $interval) {
    $scope.pixels = 0;

    $scope.buy = function (building) {
      $scope.pixels -= building.price;
      building.total++;
    }

    $http.get("data/buildings.txt").then(function (response) {
        $scope.buildings = response.data;
      });
    
    // Every second, check buildings and update details
    $interval(function() { 
      // Loop through array of bought buildings
      angular.forEach($scope.buildings, function(building) {
        $scope.pixels += building.total * building.increment;
      });


    },1000);
  });

app.filter('canAfford', function () {
  return function (input,scope) {
    var out = [];
    angular.forEach(input, function (building) {
      if (building.price / 2 <= scope.pixels) {
        out.push(building)
      }
    });
    return out;
  }
});