/*
  By Sean Lewis, copyright 2017
*/
var saveInterval = 50000;

var app = angular.module('ClickerGame', ['ngStorage', 'ngAnimate']);

  app.controller('BuildingManager', function (
    $scope, $http, $interval, $localStorage
  ) {
    $scope.pixels = $localStorage.pixels || 0;
    $scope.currentPanel = "";

    $scope.debugMode = false;
    
    /* == Stats ============================================================ */
    $scope.currentVersion = "0.2"; // Current version of the game
    $scope.lastSave = $localStorage.lastSave || "";
    $scope.totalPixels = $localStorage.totalPixels || 0;


    /* == End ============================================================== */

    $scope.deleteSaveFile = function () {
      var confirmed = confirm("Do you really want to reset your save file?");
      if(confirmed) {
        $scope.lastSave = new Date();
        $scope.pixels = 0;
        $scope.totalPixels = 0;
        $http.get("data/buildings.txt").then(function (response) {
          $scope.buildings = response.data;
        });
  
        $http.get("data/upgrades.txt").then(function (response) {
          $scope.upgrades = response.data;
        });
        $localStorage.clear();
        $localStorage.$reset();
        $scope.save();
      }
    }; // deleteSaveFile

    // Variables for clicker upgrades
    $scope.clickerMultiplier = 1;
    $scope.pitsMultiplier = 1;
    
    // Function which pushes a message to the user
    $scope.message = function(text, icon) {
      var elm;
      if(icon == "") {
        elm = '<div id="popup" class="rightBox"><h2>'+text+'</h2></div>';
      } else {
        elm = '<div id="popup" class="rightBox"><h2><i class="' +
          icon + '"></i> ' + text + '</h2></div>';
      } // if
      $(elm).appendTo('main').delay(2000).queue(function(){$(this).remove();});
    }; // message

    $scope.checkedIcon = function(boolean) {
      if(boolean) return 'fa fa-check-circle-o';
      else        return 'fa fa-circle-o';
    }; // checkedIcon

    $scope.changeView = function(where) {
      $scope.currentPanel = ($scope.currentPanel == where) ? "" : where;
      console.log($scope.currentPanel);
    }; // changeView

    $scope.increment = function () {
      $scope.pixels += 1 * $scope.clickerMultiplier;
      $scope.totalPixels += 1 * $scope.clickerMultiplier;
    }; // increment

    $scope.checkUpgradePrice = function(upgrade) {
      return ($scope.pixels >= upgrade.price) ? true : false;
    };

    $scope.upgradeBuy = function(upgrade) {
      upgrade.bought = 1;
      $scope.pixels -= upgrade.price;
    }; // upgradeBuy

    $scope.buy = function (building) {
      $scope.pixels -= price(building);
      building.total++;
    }; // buy

    $scope.canAfford = function(building) {
      return ($scope.pixels >= $scope.calculate(building)) ? true : false;
    }; // canAfford

    $scope.calculate = function(building){return price(building);};

    /* === Functions for managing data over sessions ========================*/
    $scope.save = function() {
      $localStorage.lastSave = ($scope.lastSave = new Date());
      $localStorage.pixels = $scope.pixels;
      $localStorage.totalPixels = $scope.totalPixels;
      $localStorage.buildings = $scope.buildings;
      $localStorage.upgrades = $scope.upgrades;
      $scope.message("Game has been saved.", "fa fa-floppy-o");
    }; // save

    $http.get("data/buildings.txt").then(function (response) {
      $scope.buildings = (response.data.length>$localStorage.buildings.length)?
        response.data : $localStorage.buildings;
    });
    
    $http.get("data/menu.txt").then(function (response) {
      $scope.menuItems = response.data;
    });

    $http.get("data/upgrades.txt").then(function (response) {
      $scope.upgrades = (response.data.length > $localStorage.upgrades.length) ?
        response.data: $localStorage.upgrades;
    });

    $scope.resetMultipliers = function() {
      $scope.clickerMultiplier = 1;
      $scope.pitsMultiplier = 1;
    }; //resetMultipliers

    $scope.addPixels = function(building, multiplier) {
      $scope.pixels += building.total * building.increment * multiplier;
      $scope.totalPixels += building.total * building.increment * multiplier;
    };

    // Save after a fixed number of milliseconds, determined by saveInterval
    $interval(function() { $scope.save(); }, saveInterval);

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
      } else if (type.price / 2 <= scope.totalPixels && 
                 type.bought != 1 && type.debug != 1) {
        out.push(type);
      }
    });
    return out;
  };
});

app.filter('numberSize', function() {
  return function(input) {
    var output = 0;
    if (input >= 1e12) output = (input / 1e12).toFixed(2) + "T";
    else if (input >= 1e9) output = (input / 1e9).toFixed(2) + "B";
    else if (input >= 1e6) output = (input / 1e6).toFixed(2) + "M";
    else if (input >= 1e3) output = (input / 1e3).toFixed(2) + "K";
    else output = input;
    return output;
  };
}); // numberSize filter



// Calculates the price
function price(building) {
  return building.price * Math.pow(2, building.total);
} // price