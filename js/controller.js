var app = angular.module('ClickerGame', []);

  app.controller('BuildingManager', function ($scope, $http, $interval) {
    $scope.pixels = 0;
    $scope.currentPanel = "";

    $scope.debugMode = false;
    
    /* == Stats ============================================================ */
    $scope.totalPixels = 0;

    /* == End ============================================================== */

    // Variables for clicker upgrades
    $scope.clickerMultiplier = 1;
    $scope.pitsMultiplier = 1;
    
    $scope.checkedIcon = function(boolean) {
      if(boolean) return 'fa fa-check-circle-o';
      else        return 'fa fa-circle-o';
    } // checkedIcon

    $scope.changeView = function(where) {
      $scope.currentPanel = ($scope.currentPanel == where) ? "" : where;
      console.log($scope.currentPanel);
    } // changeView

    $scope.increment = function () {
      $scope.pixels += 1 * $scope.clickerMultiplier;
      $scope.totalPixels += 1 * $scope.clickerMultiplier;
    } // increment

    $scope.checkUpgradePrice = function(upgrade) {
      return ($scope.pixels >= upgrade.price) ? true : false;
    }

    $scope.upgradeBuy = function(upgrade) {
      upgrade.bought = 1;
      $scope.pixels -= upgrade.price;
    } // upgradeBuy

    $scope.buy = function (building) {
      $scope.pixels -= price(building);
      building.total++;
    } // buy

    $scope.canAfford = function(building) {
      return ($scope.pixels >= $scope.calculate(building)) ? true : false;
    } // canAfford

    $scope.calculate = function(building){return price(building);}

    $http.get("data/buildings.txt").then(function (response) {
        $scope.buildings = response.data;
      });
    
    $http.get("data/menu.txt").then(function (response) {
      $scope.menuItems = response.data;
    });

    $http.get("data/upgrades.txt").then(function (response) {
      $scope.upgrades = response.data;
    });

    $scope.resetMultipliers = function() {
      $scope.clickerMultiplier = 1;
      $scope.pitsMultiplier = 1;
    } //resetMultipliers

    $scope.addPixels = function(building, multiplier) {
      $scope.pixels += building.total * building.increment * multiplier;
      $scope.totalPixels += building.total * building.increment * multiplier;
    }
    
    // Every second, check buildings and update details
    $interval(function() { 
      // Loop through array of bought buildings
      angular.forEach($scope.buildings, function(building) {
        switch(building.type) {
          case 'clicker':
            $scope.addPixels(building,$scope.clickerMultiplier);
            break;
          case 'pits':
            $scope.addPixels(building,$scope.pitsMultiplier);
            break;
          default:
            $scope.addPixels(building,1);
            break;
        } // switch
      });

      // Reset upgrade values;
      $scope.resetMultipliers();

      // Loop through array of purchased upgrades
      angular.forEach($scope.upgrades, function (upgrade) {
        if(upgrade.bought == 1) {
          // The upgrade has been bought so work out multipliers
          switch(upgrade.type) {
            case 'clicker':
              $scope.clickerMultiplier *= upgrade.multiplier;
              break;
            case 'pits':
              $scope.pitsMultiplier *= upgrade.multiplier;
              break;
          } // switch
        } // if
      });
    },1000);
  });

// Filter for checking if the building should be displayed depending on the
// current number of pixels
app.filter('canAfford', function () {
  return function (input,scope,type) {
    var out = [];
    angular.forEach(input, function (type) {
      if (type.debug == 1 && scope.debugMode && type.bought != 1) {
        out.push(type);
      } else if (type.price / 2 <= scope.totalPixels && type.bought != 1 
              && type.debug != 1) {
        out.push(type);
      }
    });
    return out;
  }
});

// Calculates the price
function price(building) {
  return building.price * Math.pow(2, building.total);
} // price