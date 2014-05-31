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

    var AsyncInjector = function (Promise) {
        this.Promise = Promise;
        this._factories = {};
        this._cache = {};
    };

    AsyncInjector.prototype.factory = function (name, injectable) {
        assert(typeof name === 'string', 'Name should be a string');
        assertInjectable(injectable);
        assert(!this._factories.hasOwnProperty(name), 'Dependency ' + name + ' already defined.');
        return typeof injectable === 'function' ? this._addFactory(name, injectable, getArgNames(injectable)) : this._addInjectableArray(name, injectable);
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

    AsyncInjector.prototype.injectTimeout = function (timeout, injectable) {
        return this.inject(injectable).timeout(timeout);
    };

    AsyncInjector.prototype.inject = function (injectable) {
        assertInjectable(injectable);
        return typeof injectable === 'function' ? this._inject(getArgNames(injectable), injectable) : this._injectArray(injectable);
    };

    AsyncInjector.prototype._injectArray = function (array) {
        return this._inject(array.slice(0, array.length - 1), array[array.length - 1]);
    };

    AsyncInjector.prototype._inject = function (dependencies, func) {
        var _this = this;
        return this.Promise.all(dependencies.map(function (depName) {
            return _this._resolve(depName);
        })).spread(func);
    };

    AsyncInjector.prototype._addInjectableArray = function (name, array) {
        return this._addFactory(name, array[array.length - 1], array.slice(0, array.length - 1));
    };

    AsyncInjector.prototype._addFactory = function (name, factory, dependencies) {
        this._factories[name] = {
            factory: factory,
            dependencies: dependencies
        };
        return this;
    };

    AsyncInjector.prototype._resolve = function (name) {
        return this._cache.hasOwnProperty(name) ? this._cache[name] : this._resolveFactory(name);
    };

    AsyncInjector.prototype._resolveFactory = function (name) {
        assert(this._factories.hasOwnProperty(name), 'Dependency ' + name + ' does not exists.');
        var _this = this;
        this._cache[name] = this.Promise.all(this._factories[name].dependencies.map(function (dependency) {
            return _this._resolve(dependency);
        })).spread(this._factories[name].factory);
        return this._cache[name];
    };

    if (module && module.exports) {
        module.exports = AsyncInjector;
    } else if (window) {
        window.AsyncInjector = AsyncInjector;
    }

})();
