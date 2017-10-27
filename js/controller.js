  angular.module('ClickerGame', [])
    .controller('Clicker', ['$scope', function ($scope) {
      $scope.pixels = 0;
    }]);