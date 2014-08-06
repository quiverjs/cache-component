"use strict";
require('traceur');
var async = $traceurRuntime.assertObject(require('quiver-promise')).async;
var $__0 = $traceurRuntime.assertObject(require('quiver-component')),
    simpleHandler = $__0.simpleHandler,
    simpleHandlerBuilder = $__0.simpleHandlerBuilder;
var abstractMemoryCacheFilter = $traceurRuntime.assertObject(require('../lib/cache-component.js')).abstractMemoryCacheFilter;
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var should = chai.should();
var expect = chai.expect;
describe('cache filter test', (function() {
  var getCacheId = simpleHandler((function(args) {
    return args.id;
  }), 'void', 'text');
  var counter = simpleHandlerBuilder((function(config) {
    var table = {};
    return (function(args) {
      var id = $traceurRuntime.assertObject(args).id;
      var count = table[id] || 0;
      count++;
      table[id] = count;
      return id + '-' + count;
    });
  }), 'void', 'text');
  it('sanity test', async($traceurRuntime.initGeneratorFunction(function $__1() {
    var handler;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            $ctx.state = 2;
            return counter.loadHandler({});
          case 2:
            handler = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            $ctx.state = 6;
            return handler({id: 'foo'}).should.eventually.equal('foo-1');
          case 6:
            $ctx.maybeThrow();
            $ctx.state = 8;
            break;
          case 8:
            $ctx.state = 10;
            return handler({id: 'foo'}).should.eventually.equal('foo-2');
          case 10:
            $ctx.maybeThrow();
            $ctx.state = 12;
            break;
          case 12:
            $ctx.state = 14;
            return handler({id: 'bar'}).should.eventually.equal('bar-1');
          case 14:
            $ctx.maybeThrow();
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__1, this);
  })));
  it('memory cache test', async($traceurRuntime.initGeneratorFunction(function $__2() {
    var cacheFilter,
        cachedCounter,
        handler;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            cacheFilter = abstractMemoryCacheFilter({getCacheId: getCacheId});
            cachedCounter = counter.makePrivate().addMiddleware(cacheFilter);
            $ctx.state = 22;
            break;
          case 22:
            $ctx.state = 2;
            return cachedCounter.loadHandler({});
          case 2:
            handler = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            $ctx.state = 6;
            return handler({id: 'foo'}).should.eventually.equal('foo-1');
          case 6:
            $ctx.maybeThrow();
            $ctx.state = 8;
            break;
          case 8:
            $ctx.state = 10;
            return handler({id: 'foo'}).should.eventually.equal('foo-1');
          case 10:
            $ctx.maybeThrow();
            $ctx.state = 12;
            break;
          case 12:
            $ctx.state = 14;
            return handler({id: 'bar'}).should.eventually.equal('bar-1');
          case 14:
            $ctx.maybeThrow();
            $ctx.state = 16;
            break;
          case 16:
            $ctx.state = 18;
            return handler({id: 'bar'}).should.eventually.equal('bar-1');
          case 18:
            $ctx.maybeThrow();
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__2, this);
  })));
}));
