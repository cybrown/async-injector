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

    var AsyncInjector = function (Q) {
        this.Q = Q;
        this._factories = {};
        this._values = {};
    };

    AsyncInjector.prototype.factory = function (name, injectable) {
        assert(typeof name === 'string', 'Name should be a string');
        assert((typeof injectable === 'function') || Array.isArray(injectable), 'Factory ' + name + ' is not injectable.');
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
        return this.Q.timeout(this.inject(injectable), timeout);
    };

    AsyncInjector.prototype.inject = function (injectable) {
        assert((typeof injectable === 'function') || Array.isArray(injectable), 'Injectable must be a function or an array');
        return typeof injectable === 'function' ? this._inject(getArgNames(injectable), injectable) : this._injectArray(injectable);
    };

    AsyncInjector.prototype._injectArray = function (array) {
        assert(typeof array[array.length - 1] === 'function', 'Factory must be a function');
        assertEach(array.slice(0, array.length - 1), function (it) {return typeof it === 'string';}, 'Dependency name must be a string');
        return this._inject(array.slice(0, array.length - 1), array[array.length - 1]);
    };

    AsyncInjector.prototype._inject = function (dependencies, func) {
        var _this = this;
        return this.Q.all(dependencies.map(function (depName) {
            return _this._resolve(depName);
        })).spread(func);
    };

    AsyncInjector.prototype._addInjectableArray = function (name, array) {
        return this._addFactory(name, array[array.length - 1], array.slice(0, array.length - 1));
    };

    AsyncInjector.prototype._addFactory = function (name, factory, dependencies) {
        assert(typeof factory === 'function', 'Factory must be a function.');
        assertEach(dependencies, function (it) {return typeof it === 'string';}, 'Dependency name should be a string');
        assert(!this._factories.hasOwnProperty(name), 'Dependency ' + name + ' already defined.');
        this._factories[name] = {
            factory: factory,
            dependencies: dependencies
        };
        return this;
    };

    AsyncInjector.prototype._resolve = function (name) {
        return this._values.hasOwnProperty(name) ? this._values[name] : this._resolveFactory(name);
    };

    AsyncInjector.prototype._resolveFactory = function (name) {
        assert(this._factories.hasOwnProperty(name), 'Dependency ' + name + ' does not exists.');
        var _this = this;
        this._values[name] = this.Q.all(this._factories[name].dependencies.map(function (dependency) {
            return _this._resolve(dependency);
        })).spread(this._factories[name].factory).then(function (value) {
            if (value === undefined) {
                console.log('Factory ' + name + ' has return undefined.');
            }
            return value;
        });
        return this._values[name];
    };

    if (module && module.exports) {
        module.exports = AsyncInjector;
    } else if (window) {
        window.AsyncInjector = AsyncInjector;
    }

})();
