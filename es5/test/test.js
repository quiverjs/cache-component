"use strict";
require('traceur');
var async = $traceurRuntime.assertObject(require('quiver-promise')).async;
var $__0 = $traceurRuntime.assertObject(require('quiver-component')),
    simpleHandler = $__0.simpleHandler,
    simpleHandlerBuilder = $__0.simpleHandlerBuilder,
    handlerBundle = $__0.handlerBundle;
var makeMemoryCacheFilters = $traceurRuntime.assertObject(require('../lib/cache-component.js')).makeMemoryCacheFilters;
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var should = chai.should();
var expect = chai.expect;
describe('cache filter test', (function() {
  var getCacheId = simpleHandler((function(args) {
    return args.id;
  }), 'void', 'text');
  var counterBundle = handlerBundle((function(config) {
    var table = {};
    var increment = (function(args) {
      var id = $traceurRuntime.assertObject(args).id;
      var count = table[id] || 0;
      count++;
      table[id] = count;
      return id + '-' + count;
    });
    var reset = (function(args) {
      var $__1;
      var $__0 = $traceurRuntime.assertObject(args),
          id = $__0.id,
          count = ($__1 = $__0.count) === void 0 ? 0 : $__1;
      table[id] = count;
    });
    return {
      increment: increment,
      reset: reset
    };
  })).simpleHandler('increment', 'void', 'text').simpleHandler('reset', 'void', 'void');
  var $__0 = $traceurRuntime.assertObject(counterBundle.handlerComponents),
      increment = $__0.increment,
      reset = $__0.reset;
  it('sanity test', async($traceurRuntime.initGeneratorFunction(function $__2() {
    var config,
        counterHandler,
        resetHandler;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            config = {};
            $ctx.state = 34;
            break;
          case 34:
            $ctx.state = 2;
            return increment.loadHandler(config);
          case 2:
            counterHandler = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            $ctx.state = 6;
            return reset.loadHandler(config);
          case 6:
            resetHandler = $ctx.sent;
            $ctx.state = 8;
            break;
          case 8:
            $ctx.state = 10;
            return counterHandler({id: 'foo'}).should.eventually.equal('foo-1');
          case 10:
            $ctx.maybeThrow();
            $ctx.state = 12;
            break;
          case 12:
            $ctx.state = 14;
            return counterHandler({id: 'foo'}).should.eventually.equal('foo-2');
          case 14:
            $ctx.maybeThrow();
            $ctx.state = 16;
            break;
          case 16:
            $ctx.state = 18;
            return counterHandler({id: 'bar'}).should.eventually.equal('bar-1');
          case 18:
            $ctx.maybeThrow();
            $ctx.state = 20;
            break;
          case 20:
            $ctx.state = 22;
            return resetHandler({
              id: 'foo',
              count: 5
            });
          case 22:
            $ctx.maybeThrow();
            $ctx.state = 24;
            break;
          case 24:
            $ctx.state = 26;
            return counterHandler({id: 'foo'}).should.eventually.equal('foo-6');
          case 26:
            $ctx.maybeThrow();
            $ctx.state = 28;
            break;
          case 28:
            $ctx.state = 30;
            return counterHandler({id: 'bar'}).should.eventually.equal('bar-2');
          case 30:
            $ctx.maybeThrow();
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__2, this);
  })));
  it.only('memory cache test', async($traceurRuntime.initGeneratorFunction(function $__3() {
    var $__0,
        cacheFilter,
        cacheInvalidationFilter,
        increment,
        reset,
        config,
        counterHandler,
        resetHandler;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            $__0 = $traceurRuntime.assertObject(makeMemoryCacheFilters({getCacheId: getCacheId})), cacheFilter = $__0.cacheFilter, cacheInvalidationFilter = $__0.cacheInvalidationFilter;
            $__0 = $traceurRuntime.assertObject(counterBundle.makePrivate().handlerComponents), increment = $__0.increment, reset = $__0.reset;
            increment.addMiddleware(cacheFilter);
            reset.addMiddleware(cacheInvalidationFilter);
            config = {};
            $ctx.state = 38;
            break;
          case 38:
            $ctx.state = 2;
            return increment.loadHandler(config);
          case 2:
            counterHandler = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            $ctx.state = 6;
            return reset.loadHandler(config);
          case 6:
            resetHandler = $ctx.sent;
            $ctx.state = 8;
            break;
          case 8:
            $ctx.state = 10;
            return counterHandler({id: 'foo'}).should.eventually.equal('foo-1');
          case 10:
            $ctx.maybeThrow();
            $ctx.state = 12;
            break;
          case 12:
            $ctx.state = 14;
            return counterHandler({id: 'foo'}).should.eventually.equal('foo-1');
          case 14:
            $ctx.maybeThrow();
            $ctx.state = 16;
            break;
          case 16:
            $ctx.state = 18;
            return counterHandler({id: 'bar'}).should.eventually.equal('bar-1');
          case 18:
            $ctx.maybeThrow();
            $ctx.state = 20;
            break;
          case 20:
            $ctx.state = 22;
            return counterHandler({id: 'bar'}).should.eventually.equal('bar-1');
          case 22:
            $ctx.maybeThrow();
            $ctx.state = 24;
            break;
          case 24:
            $ctx.state = 26;
            return resetHandler({
              id: 'foo',
              count: 5
            });
          case 26:
            $ctx.maybeThrow();
            $ctx.state = 28;
            break;
          case 28:
            $ctx.state = 30;
            return counterHandler({id: 'foo'}).should.eventually.equal('foo-6');
          case 30:
            $ctx.maybeThrow();
            $ctx.state = 32;
            break;
          case 32:
            $ctx.state = 34;
            return counterHandler({id: 'bar'}).should.eventually.equal('bar-1');
          case 34:
            $ctx.maybeThrow();
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__3, this);
  })));
}));
