var Promise = require('bluebird');
var AsyncInjector = require('../index');

describe('AsyncInjector', function () {

    var injector = new AsyncInjector(Promise);

    describe ('Using API as documented', function () {

        it ('should set a factory', function () {
            injector.factory('a', function () {
                return 'A';
            });
        });

        it ('should only set an injectable object', function () {
            (function () {
                injector.factory('c', 4);
            }).should.throw();
            (function () {
                injector.factory('c', [4]);
            }).should.throw();
        });

        it ('should not set a dependency twice 1', function () {
            (function () {
                injector.factory('a', function () {

                });
            }).should.throw();
        });

        it ('should not set a dependency twice 2', function () {
            (function () {
                injector.value('b2', 1);
                injector.factory('b2', function () {});
            }).should.throw();
        });

        it ('should set multiple scalar values', function (done) {
            injector.config({
                'login': 'user',
                'password': 'userpass'
            });
            injector.inject(['login', 'password', function (login, password) {
                login.should.eql('user');
                password.should.eql('userpass');
                done();
            }]);
        });

        it ('should get dependencies from function decompilation', function (done) {
            injector.inject(function (login, password) {
                login.should.eql('user');
                password.should.eql('userpass');
                done();
            });
        });

        it ('should set a function as a value', function (done) {
            injector.value('func', function () {
                return 'a';
            });
            injector.inject(['func', function (func) {
                func.should.not.eql('a');
                func().should.eql('a');
                done();
            }]);
        });

        it ('should return undefined', function (done) {
            injector.factory('give_undef1', function () {

            });
            injector.factory('give_undef2', function (give_undef1) {
                return give_undef1;
            });
            injector.inject(function (give_undef2) {
                (give_undef2 === undefined).should.be.ok;
                done();
            });
        });

        it ('should throw if injectable is not array or function', function () {
            (function () {
                injector.inject("test");
            }).should.throw('Injectable must be a function or an array');
        });

        it ('should retrieve a component with a string', function (done) {
            injector.inject(['a', function (a) {
                (a == null).should.not.be.ok;
                a.should.eql('A');
                done();
            }]);
        });

        it ('should set a factory returning a promise', function () {
            injector.factory('apromise', function () {
                return new Promise(function (resolve, reject) {
                    resolve('apromise-value');
                });
            });
        });

        it ('should retrieve a promised component', function (done) {
            injector.inject(['apromise', function (a) {
                (a == null).should.not.be.ok;
                a.should.eql('apromise-value');
                done();
            }]);
        });

        it ('should retrieve components with an array', function (done) {
            injector.inject(['a', function (a) {
                a.should.eql('A');
                done();
            }]);
        });

        it ('should cache a dependency value', function (done) {
            injector.factory('random', [function () {
                return Math.random();
            }]);
            var r;
            injector.inject(['random', function (random) {
                r = random;
            }]);
            injector.inject(['random', function (random) {
                r.should.eql(random);
                done();
            }])
        });

        it ('should set a component with a dependency', function () {
            injector.factory('b', ['c', function (c) {
                c.should.eql('C');
                return new Promise(function (resolve, reject) {
                    resolve('B');
                });
            }]);
            injector.factory('c', function () {
                return new Promise(function (resolve, reject) {
                    resolve('C');
                });
            });
        });

        it ('should set a component with a dependency an function decompilation', function (done) {
            injector.factory('b22', ['c22', function (c22) {
                c22.should.eql('C22');
                return new Promise(function (resolve, reject) {
                    resolve('B22');
                });
            }]);
            injector.factory('c22', function () {
                return new Promise(function (resolve, reject) {
                    resolve('C22');
                });
            });
            injector.inject(['b22', function (b22) {
                b22.should.eql('B22');
                done();
            }]);
        });

        it ('should retrieve a component with a dependency', function (done) {
            injector.inject(['b2', function (b2) {
                done();
            }]);
        });

        it ('should set a component with a dependency already loaded', function () {
            injector.factory('d', ['a', function (a) {
                return new Promise(function (resolve, reject) {
                    resolve({a: a});
                });
            }]);
        });

        it ('should retrieve a component with a dependency already loaded', function (done) {
            injector.inject(['d', function (d) {
                d.a.should.eql('A');
                done();
            }]);
        });

        it ('should return two components', function (done) {
            injector.inject(['a', 'b', function (a, b) {
                a.should.eql('A');
                b.should.eql('B');
                done();
            }]);
        });

        it ('should add components', function () {
            injector.factory('e', [function () {
                return Q('E');
            }]);
        });

        it ('should add a scalar component', function () {
            injector.value('scalar', 'localhost:3000');
        });

        it ('should retrieve a scalar component', function (done) {
            injector.inject(['scalar', function (scalar) {
                scalar.should.eql('localhost:3000');
                done();
            }]);
        });

        it ('should try to load a component only once', function (done) {
            injector.factory('once', [function () {
                setTimeout(done);
                return Promise.delay(10).then(function () {

                });
            }]);
            injector.inject(['once', function () {}]);
            injector.inject(['once', function () {}]);
        });

        it ('should get a loading component', function (done) {
            injector.factory('once2', function () {
                return Promise.delay(10).then(function () {

                });
            });
            injector.inject(['once2', function () {}]);
            injector.inject(['once2', done]);
        });
    });

    describe ('#factory with wrong parameters', function () {

        it ('should accept only a string as a name, or a plain object of dependencies', function () {
            (function () {
                var NOT_A_STRING_NOR_AN_OBJECT = 1;
                injector.factory(NOT_A_STRING_NOR_AN_OBJECT, [function () {}]);
            }).should.throw();
        });

        it ('should accept only a string or array of strings as dependencies name', function () {
            (function () {
                var NOT_A_STRING = 1;
                injector.factory('aaa', [NOT_A_STRING, function () {}]);
            }).should.throw();
        });
    });

    describe ('#inject with wrong parameters', function () {

        it ('should accept only a string or an array of string as dependency name', function () {
            (function () {
                var NOT_A_STRING = 1;
                injector.inject([NOT_A_STRING, function () {}]);
            }).should.throw(/string/);
        })

        it ('should accept only a function as callback', function () {
            (function () {
                injector.inject(['a', 'not a function']);
            }).should.throw();
        })
    });

    describe ('Error handling', function () {

        it ('should reject on error', function (done) {
            injector.factory('error', [function () {
                throw new Error('a test error');
            }]);
            injector.inject(['error', function (error) {

            }]).catch(function (err) {
                done()
            });
        });

        it ('should throw an error if a component is not found', function () {
            (function () {
                injector.factory('for_not_found', ['not_found', function (not_found) {
                    throw new Error("This should not be executed");
                }]);
                injector.inject(['for_not_found', function (for_not_found) {

                }]);
            }).should.throw(/does not exists/);
        });
    });
});
