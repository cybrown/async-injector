(function () {
    'use strict';

    var getArgNames = function (func) {
        var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
        var FN_ARG_SPLIT = /,/;
        var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
        var matches = func.toString().replace(STRIP_COMMENTS, '').match(FN_ARGS)[1];
        return matches === '' ? [] : matches.split(FN_ARG_SPLIT).map(function (str) {return str.trim();});
    };

    var assert = function (condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    };

    var assertEach = function (array, func, message) {
        array.forEach(function (v) {
            if (!func(v)) {
                throw new Error(message);
            }
        });
    };

    var assertInjectable = function (injectable) {
        if (typeof injectable === 'function') {

        } else if (Array.isArray(injectable)) {
            assert(typeof injectable[injectable.length - 1] === 'function', 'Last element of array must be a function');
            assertEach(injectable.slice(0, injectable.length - 1), function (it) {return typeof it === 'string';}, 'Dependency name must be a string');
        } else {
            assert(false, 'Injectable must be a function or an array');
        }
    };

    var injectableToFunction = function (injectable) {
        return typeof injectable === 'function' ? injectable : injectable[injectable.length - 1];
    };

    var injectableToDependencies = function (injectable) {
        return typeof injectable === 'function' ? getArgNames(injectable) : injectable.slice(0, injectable.length - 1);
    };

    var AsyncInjector = function (Promise) {
        this.Promise = Promise;
        this._factories = {};
        this._cache = {};
    };

    AsyncInjector.prototype.config = function (hash) {
        var _this = this;
        Object.keys(hash).forEach(function (key) {
            _this.value(key, hash[key]);
        });
        return this;
    };

    AsyncInjector.prototype.value = function (name, value) {
        return this.factory(name, function () {
            return value;
        });
    };

    AsyncInjector.prototype.factory = function (name, injectable) {
        assert(typeof name === 'string', 'Name should be a string');
        assertInjectable(injectable);
        assert(!this._factories.hasOwnProperty(name), 'Dependency ' + name + ' already defined.');
        this._factories[name] = {
            factory: injectableToFunction(injectable),
            dependencies: injectableToDependencies(injectable)
        };
        return this;
    };

    AsyncInjector.prototype.inject = function (injectable) {
        assertInjectable(injectable);
        var _this = this;
        return this.Promise.all(injectableToDependencies(injectable).map(function (depName) {
            assert(_this._factories.hasOwnProperty(depName), 'Dependency ' + depName + ' does not exists.');
            if (!_this._cache.hasOwnProperty(depName)) {
                _this._cache[depName] = _this.inject(_this._factories[depName].dependencies.concat(_this._factories[depName].factory));
            }
            return _this._cache[depName];
        })).spread(injectableToFunction(injectable));
    };

    if (module && module.exports) {
        module.exports = AsyncInjector;
    } else if (window) {
        window.AsyncInjector = AsyncInjector;
    }

})();
