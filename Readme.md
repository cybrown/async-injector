AsyncInjector [![Build Status](https://travis-ci.org/cybrown/injectorme.png?branch=master)](https://travis-ci.org/cybrown/injectorme)
======
Simple asynchronous dependency container and injector.

Define your components in functions, return them asynchronously, and inject them in other components.

No configuration file required, component definition based on anonymous functions as factories.

Inspired by requirejs, and angularjs dependency injection.

## Installation

    $ npm install async-injector

## Quick start

In this example, a function is a component to authenticate a user, and the default admin credentials are stored as value dependencies.

```js
var AsyncInjector = require('../index');
var Q = require('q');

var injector = new AsyncInjector(Q);

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
    return Q.promise(function (resolve, reject) {
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
```

## Features

  * AngularJS like component definition (with function decompilation)
  * Components creation can be asynchronous (by returning a promise)
  * Contains simple values for configuration purpose

## Future

  * Add injector chain
  * Add a scope concept (inject values depending on the current session, request etc...).

## LICENCE
(The MIT License)

Copyright (c) 2009-2013 Cy Brown <cy.brown59@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.