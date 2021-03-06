var AsyncInjector = require('../async-injector');
var Promise = require('bluebird');

var injector = new AsyncInjector(Promise);

// Set configuration values
injector.config({
    adminLogin: 'admin',
    adminPassword: 'admin'
});

// Set the function to authenticate, using configuration values, equivalent to define
injector.factory('authenticate', function (adminLogin, adminPassword) {
    var authenticate = function (login, password, cb) {
        if (login === adminLogin && password === adminPassword) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    };
    return new Promise(function (resolve, reject) {
        resolve(authenticate);
    });
});

// Use the authenticate function in application code
injector.inject(['authenticate', function (authenticate) {
    authenticate('foo', 'bar', function (err, isAuthenticated) {
        console.log('Is authenticated:', isAuthenticated);
    });
    authenticate('admin', 'admin', function (err, isAuthenticated) {
        console.log('Is authenticated:', isAuthenticated);
    });
}]);
