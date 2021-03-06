angular.module('smoothie-directive', [])
    .directive('smoothieGrid', function() {
        return {
            template: '<canvas ng-transclude></canvas>',
            replace: true,
            transclude: true,
            restrict: 'E',

            scope: {
                background: '@',
                lineColor:  '@',
                lineWidth:  '@',
                labelColor: '@',
                labelPrecision: '@',
                minValue: '@',
                maxValue: '@'
            },

            controller: function($scope, $element) {
                this.canvas = $element[0];

                var smoothieOptions = {
                  grid: {
                    strokeStyle: $scope.lineColor || 'transparent',
                    fillStyle: $scope.background || 'transparent'
                  },
                  labels: {
                    fillStyle: $scope.labelColor || 'transparent',
                    precision: $scope.labelPrecision || 2
                  }
                };

                if (typeof $scope.minValue !== 'undefined' &&
                    $scope.minValue !== null) {
                    smoothieOptions.minValue = $scope.minValue;
                }

                if (typeof $scope.maxValue !== 'undefined' &&
                    $scope.maxValue !== null) {
                    smoothieOptions.maxValue = $scope.maxValue;
                }

                this.smoothie = new SmoothieChart(smoothieOptions);
            }
        };
    })

    .directive('timeSeries', function($interval) {
        return {
            restrict: 'E',
            require: '^smoothieGrid',

            scope: {
                rate:  '@',
                color: '@',
                width: '@',
                fill:  '@',
                callback: '&'
            },

            controller: function($scope, $element) {
                $scope.rate = $scope.rate || 1000;
                $scope.line = new TimeSeries();
                $scope.callback = $scope.callback ? $scope.callback : function() { return false; };
            },

            link: function(scope, element, attrs, controller) {
                controller.smoothie.streamTo(controller.canvas, scope.rate);

                controller.smoothie.addTimeSeries(scope.line, {
                    strokeStyle: scope.color || 'green',
                    fillStyle: scope.fill,
                    lineWidth: scope.width || 2
                });

                var updateInterval = $interval(function() {
                    var point = scope.callback();
                    scope.line.append(point[0], point[1]);
                }, scope.rate);

                element.on('$destroy', function() {
                   $interval.cancel(updateInterval);
                });
            }
        };
    });
