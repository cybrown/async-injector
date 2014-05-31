var AsyncInjector = require('../async-injector');
var Promise = require('bluebird');

var injector = new AsyncInjector(Promise);

injector.factory('add', function () {
    return function (a, b) {
        return a + b;
    };
});

injector.factory('async_add', function () {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve(function (a, b) {
                return a + b;
            });
        });
    });
});

injector.inject(['add', 'async_add', function (add, async_add) {
    console.log(add(1, 2) === async_add(1, 2));
}]);
