var app = angular.module('ClickerGame', []);

  app.controller('BuildingManager', function ($scope, $http, $interval) {
    $scope.pixels = 0;
    $scope.totalPixels = 0;
    
    $scope.increment = function () {
      $scope.pixels++; $scope.totalPixels++;
    }

    $scope.buy = function (building) {
      $scope.pixels -= price(building);
      building.total++;
    }

    $scope.calculate = function(building){return price(building);}

    $http.get("data/buildings.txt").then(function (response) {
        $scope.buildings = response.data;
      });
    
    // Every second, check buildings and update details
    $interval(function() { 
      // Loop through array of bought buildings
      angular.forEach($scope.buildings, function(building) {
        $scope.pixels += building.total * building.increment;
        $scope.totalPixels += building.total * building.increment;
      });
    },1000);
  });

// Filter for checking if the building should be displayed depending on the
// current number of pixels
app.filter('canAfford', function () {
  return function (input,scope) {
    var out = [];
    angular.forEach(input, function (building) {
      if (building.price / 2 <= scope.totalPixels) {
        out.push(building)
      }
    });
    return out;
  }
});

// Calculates the price
function price(building) {
  return building.price * Math.pow(2, building.total);
} // price