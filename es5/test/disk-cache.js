"use strict";
require('traceur');
var joinPath = $traceurRuntime.assertObject(require('path')).join;
var $__0 = $traceurRuntime.assertObject(require('quiver-promise')),
    async = $__0.async,
    promisify = $__0.promisify,
    timeout = $__0.timeout;
var $__0 = $traceurRuntime.assertObject(require('quiver-component')),
    simpleHandler = $__0.simpleHandler,
    simpleHandlerBuilder = $__0.simpleHandlerBuilder,
    handlerBundle = $__0.handlerBundle,
    transformFilter = $__0.transformFilter;
var makeDiskCacheFilters = $traceurRuntime.assertObject(require('../lib/disk-cache.js')).makeDiskCacheFilters;
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var should = chai.should();
var expect = chai.expect;
var fs = require('fs');
var cacheDir = 'temp';
describe('disk cache filter test', (function() {
  var getCacheId = simpleHandler((function(args) {
    return args.id;
  }), 'void', 'text');
  var uppercase = simpleHandler((function(args, text) {
    return text.toUpperCase();
  }), 'text', 'text');
  var greet = simpleHandler((function(args) {
    var id = $traceurRuntime.assertObject(args).id;
    return 'Hello, ' + id;
  }), 'void', 'text').addMiddleware(transformFilter(uppercase, 'out'));
  it('sanity test', async($traceurRuntime.initGeneratorFunction(function $__1() {
    var handler;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            $ctx.state = 2;
            return greet.loadHandler({});
          case 2:
            handler = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            $ctx.state = 6;
            return handler({id: 'foo'}).should.eventually.equal('HELLO, FOO');
          case 6:
            $ctx.maybeThrow();
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__1, this);
  })));
  it('basic test', async($traceurRuntime.initGeneratorFunction(function $__2() {
    var $__0,
        cacheFilter,
        cacheInvalidationFilter,
        cachedGreet,
        config,
        handler,
        cacheFile;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            $__0 = $traceurRuntime.assertObject(makeDiskCacheFilters({getCacheId: getCacheId})), cacheFilter = $__0.cacheFilter, cacheInvalidationFilter = $__0.cacheInvalidationFilter;
            cachedGreet = greet.makePrivate().addMiddleware(cacheFilter);
            config = {cacheDir: cacheDir};
            $ctx.state = 14;
            break;
          case 14:
            $ctx.state = 2;
            return cachedGreet.loadHandler(config);
          case 2:
            handler = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            cacheFile = joinPath(cacheDir, 'foo');
            fs.existsSync(cacheFile).should.equal(false);
            $ctx.state = 16;
            break;
          case 16:
            $ctx.state = 6;
            return handler({id: 'foo'}).should.eventually.equal('HELLO, FOO');
          case 6:
            $ctx.maybeThrow();
            $ctx.state = 8;
            break;
          case 8:
            $ctx.state = 10;
            return timeout(100);
          case 10:
            $ctx.maybeThrow();
            $ctx.state = 12;
            break;
          case 12:
            fs.readFileSync(cacheFile).toString().should.equal('HELLO, FOO');
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__2, this);
  })));
}));
