angular.module('dialog', ['ui.bootstrap']).
    factory('$dialog', function ($rootScope, $modal) {

        var module = {};

        // alert dialog
        module.alert = function (data) {
            if (!data) return false;
            var options = {
                backdrop: true,
                backdropClick: true,
                templateUrl: 'static/partials/alertDialogPartial.html',
                controller: 'AlertDialogController',
                resolve: {
                    args: function () {
                        return {
                            data: angular.copy(data)
                        }
                    }
                }
            };
            module.openDialog(options);
        };

        // generic dialog
        $rootScope.dialogs = [];
        module.openDialog = function (options) {
            if (!options) return false;

            $.each($rootScope.dialogs, function (i, dialog) {
                dialog.close();
            });
            $rootScope.dialogs = [];

            $modal.open(options);
        };

        return module;
    });

angular.module('snugurl', ['ngRoute', 'dialog', 'ngClipboard', 'knalli.angular-vertxbus'])
	.config(function($routeProvider) {
		$routeProvider
			.when('/', { controller:SnugCtrl, templateUrl:'static/partials/view.html', reloadOnSearch: false})
			.otherwise({ redirectTo: '/' });
    })
    .config(['ngClipProvider', function(ngClipProvider) {
        ngClipProvider.setPath("static/bower_components/zeroclipboard/dist/ZeroClipboard.swf");
    }]);

function SnugCtrl($scope, $dialog, $route, $location, vertxEventBusService) {
    var eb = vertxEventBusService;
    $scope.longurl = "";
    $scope.shorturl = "";

    $scope.shorten = function () {
        console.log("shorten", $scope.longurl, eb);
        eb.send("snugurl.set", { url: $scope.longurl }) //send
            .then(function (result) {
                if (result.status == 200) {
                    $scope.shorturl = result.value;
                } else {
                    $dialog.alert(result);
                }
            }).then(null, function () {
                $dialog.alert({ status: 500, message: 'Oops!' });
            });
    };
}

function AlertDialogController($rootScope, $scope, $modalInstance, args) {
    $rootScope.dialogs.push($scope);

    $scope.title = 'Success !';
    if (args.data.status != 100) $scope.title = 'Oops !';

    $scope.data = args.data;

    $scope.close = function (result) {
        $rootScope.dialogs = _.without($rootScope.dialogs, $scope);
        $modalInstance.close(result);
        if(args.callback) {
            args.callback(result);
        }
    };
}
