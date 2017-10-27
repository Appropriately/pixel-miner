var app = angular.module('ClickerGame', []);

  app.controller('BuildingManager', function ($scope, $http, $interval) {
    $scope.pixels = 0;
    $scope.currentBuildings = [];

    $scope.buy = function (building) {
      console.log(building.name);
      console.log($scope.currentBuildings);
      $scope.currentBuildings.push(building);
      $scope.pixels -= building.price;
    }

    $http.get("data/buildings.txt").then(function (response) {
        $scope.buildings = response.data;
      });
    
    $interval(function() { angular.forEach($scope.currentBuildings, function(building) {
      $scope.pixels += building.increment;
    })},1000);
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