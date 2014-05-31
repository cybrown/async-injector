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
        if (Array.isArray(injectable)) {
            assert(typeof injectable[injectable.length - 1] === 'function', 'Last element of array must be a function');
            assertEach(injectable.slice(0, injectable.length - 1), function (it) {return typeof it === 'string';}, 'Dependency name must be a string');
        } else if (typeof injectable !== 'function') {
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
        this.log = function (str) {
            console.log('[AsyncInjector] ' + str);
        };
        this.info = function (str) {
            console.info('[AsyncInjector] ' + str);
        };
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
        var start = Date.now();
        assertInjectable(injectable);
        var _this = this;
        _this.log('Starting...');
        return this._inject(injectableToDependencies(injectable), injectableToFunction(injectable)).then(function (data) {
            _this.log('Started in ' + (Date.now() - start) + 'ms');
            return data;
        });
    };

    AsyncInjector.prototype._inject = function (dependencies, func) {
        var _this = this;
        return this.Promise.all(dependencies.map(function (depName) {
            assert(_this._factories.hasOwnProperty(depName), 'Dependency ' + depName + ' does not exists.');
            if (!_this._cache.hasOwnProperty(depName)) {
                _this._cache[depName] = _this._inject(_this._factories[depName].dependencies, _this._factories[depName].factory);
            }
            _this.info('Loading ' + depName);
            _this._factories[depName].startTime = Date.now();
            return _this._cache[depName].then(function (value) {
                if (!_this._factories[depName].endTime) {
                    _this._factories[depName].endTime = Date.now();
                    _this.info('Loaded ' + depName + ' in ' + (_this._factories[depName].endTime - _this._factories[depName].startTime) + 'ms');
                }
                return value;
            });
        })).spread(func);
    };

    if (module && module.exports) {
        module.exports = AsyncInjector;
    } else if (window) {
        window.AsyncInjector = AsyncInjector;
    }

})();
