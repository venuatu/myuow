"use strict";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
var config = require('./config'),
    restify = require('restify'),
    db = require('./database.js');

var server = restify.createServer();
server.use(restify.bodyParser());
restify.CORS.ALLOW_HEADERS.push('accept');
restify.CORS.ALLOW_HEADERS.push('x-requested-with');
server.use(restify.CORS());
server.use(restify.fullResponse());
server.use(restify.gzipResponse());
server.use(restify.queryParser());

function getParamNames(func) {// http://stackoverflow.com/a/9924463
  var fnStr = func.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '')
  var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(/([^\s,]+)/g)
  if(result === null)
     result = []
  return result
}

var modules = {
    config: config,
    server: server,
    db: db,
    solsCerts: config.solsCerts,
    sessCrypto: require('./sesscrypto'),
    foreach: function (array, func) {// mainly for NodeLists
        return Array.prototype.forEach.call(array, func);
    },
    oforeach: function (array, func) {// for objects
        for (var key in array) {
            if (array.hasOwnProperty(key)) {
                func(array[key], key);
            }
        }
        return array;
    },
    slice: function (array) {
        return Array.prototype.slice.apply(array, Array.prototype.slice.call(arguments, 1));
    },
};

// Register routes
require('fs').readdirSync('routes').forEach(function (v) {
    var route = require('./routes/' + v);
    if (typeof route === 'function') {
        var args = getParamNames(route);
        console.log(v, '->', JSON.stringify(args));
        args.forEach(function (v, k) {
            if (!modules[v]) {
                modules[v] = require(v);
            }
            args[k] = modules[v];
        });
        route.apply(null, args);
    }
})

server.listen(config.port, config.address,  function() {
    console.log('%s listening at %s', server.name, server.url);
});
