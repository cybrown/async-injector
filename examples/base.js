var AsyncInjector = require('../index');
var Q = require('q');

var injector = new AsyncInjector(Q);

injector.factory('add', function () {
    return function (a, b) {
        return a + b;
    };
});

injector.factory('async_add', function () {
    return Q.promise(function (resolve, reject) {
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
