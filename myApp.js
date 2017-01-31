/// <reference path="D:\Sohel.Rana\Personal\Project\WebApiToken\SinglePageApp\Scripts/angular.js" />


var myApp = angular.module('myApp', ['ngRoute']);

//config routing
myApp.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/', {
            redirectTo: '/Home'
        }).when('/Home', {
            templateUrl: '/Template/Home.html',
            controller: 'HomeController'
        }).when('/Authenticate', {
            templateUrl: '/Template/Authenticate.html',
            controller: 'AuthenticationController'
        }).when('/Authorize', {
            templateUrl: '/Template/Authorize.html',
            controller: 'AuthorizeController'
        }).when('/Login', {
            templateUrl: '/Template/Login.html',
            controller: 'LoginController'
        }).when('/Unauthorize', {
            templateUrl: '/Template/Unauthorize.html',
            controller: 'UnauthorizeController'
        })
}])
//global veriable for store service base path.
myApp.constant('serviceBasePath', 'http://localhost:56734')

//controller
myApp.controller('HomeController', ['$scope', 'dataService', function ($scope, dataService) {
    $scope.data = "";
    dataService.getAnonymousData().then(function (data) {
        $scope.data = data;
    })
}])
myApp.controller('AuthenticationController', ['$scope', 'dataService', function ($scope, dataService) {
    $scope.data = "";
    dataService.getAuthenticateData().then(function (data) {
        $scope.data = data;
    })
}])
myApp.controller('AuthorizeController', ['$scope', 'dataService', function ($scope, dataService) {
    $scope.data = "";
    dataService.getAuthorizeData().then(function (data) {
        $scope.data = data;
    })
}])
myApp.controller('LoginController', ['$scope', 'accountService', '$location', function ($scope, accountService, $location) {
    $scope.account = {
        username: '',
        password:''
    };
    $scope.message = '';
    $scope.login = function () {
        accountService.login($scope.account).then(function (data) {
            $location.path('/Home');
        }, function (error) {
            $scope.message = error.error_description;
        })
    }
}])
myApp.controller('UnauthorizeController', ['$scope', function ($scope) {
    $scope.data = "You are not authorize!";
}])


//services
myApp.factory('dataService', ['$http', 'serviceBasePath', function ($http, serviceBasePath) {
    var fac = {};
    fac.getAnonymousData = function () {
        return $http.get(serviceBasePath + '/api/data/forall').then(function (response) {
            return response.data;
        })
    }
    fac.getAuthenticateData = function () {
        return $http.get(serviceBasePath + '/api/data/authenticate').then(function (response) {
            return response.data;
        })
    }
    fac.getAuthorizeData = function () {
        return $http.get(serviceBasePath + '/api/data/authorize').then(function (response) {
            return response.data;
        })
    }

    return fac;
}])

myApp.factory('userService', function () {
    var fac = {};
    fac.currentUser = null;
    fac.setCurrentUser = function (user) {
        fac.currentUser = user;
        sessionStorage.user = angular.toJson(user);
    }
    fac.getCurrentUser = function (user) {
        fac.currentUser = angular.fromJson(sessionStorage.user);
        return fac.currentUser;
    }
    return fac;
})

myApp.factory('accountService', ['$http', '$q', 'serviceBasePath','userService', function ($http, $q, serviceBasePath,userService) {

    var fac = {};
    fac.login = function (user) {
        var obj = { 'username': user.username, 'password': user.password, 'grant_type': 'password' };

        Object.toparams = function ObjectToParams(obj) {
            var p = [];
            for (var key in obj) {
                p.push(key + '=' + encodeURIComponent(obj[key]));
            }
            return p.join('&');
        };
        var defer = $q.defer();
        $http({
            method: 'post',
            url: serviceBasePath + "/token",
            data: Object.toparams(obj),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(function (response) {
            userService.setCurrentUser(response.data);
            defer.resolve(response.data);
        }, function (error) {
            defer.reject(error.data);
        })
        return defer.promise;
    }

    fac.logout = function () {
        userService.currentUser = null;
        userService.setCurrentUser(userService.currentUser);
    }
    return fac;
}])
//http interceptor
myApp.config(['$httpProvider', function ($httpProvider) {
    var interceptar = function (userService, $q, $location) {
        return {
            request: function (config) {
                var currentUser = userService.getCurrentUser();
                if (currentUser != null) {
                    config.headers['Authorization'] = 'Bearer ' + currentUser.access_token;
                }
                return config;
            },
            responseError: function (rejection) {
                if (rejection.status === 401) {
                    $location.path('/Login');
                    return $q.reject(rejection);
                }
                if (rejection.status === 403) {
                    $location.path('/Unauthorize');
                    return $q.reject(rejection);
                }
                return $q.reject(rejection);
            }
        }
    }
    var params = ['userService', '$q', '$location'];
    interceptar.$inject = params;
    $httpProvider.interceptors.push(interceptar);
}])
