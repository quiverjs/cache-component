"use strict";
require('traceur');
var spawn = $traceurRuntime.assertObject(require('child_process')).spawn;
var $__0 = $traceurRuntime.assertObject(require('quiver-promise')),
    async = $__0.async,
    timeout = $__0.timeout;
var $__0 = $traceurRuntime.assertObject(require('quiver-component')),
    simpleHandler = $__0.simpleHandler,
    simpleHandlerBuilder = $__0.simpleHandlerBuilder,
    handlerBundle = $__0.handlerBundle;
var $__0 = $traceurRuntime.assertObject(require('../lib/cache-component.js')),
    makeMemoryCacheFilters = $__0.makeMemoryCacheFilters,
    makeMemcachedFilters = $__0.makeMemcachedFilters;
var createMemcached = $traceurRuntime.assertObject(require('../lib/memcached.js')).createMemcached;
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var should = chai.should();
var expect = chai.expect;
var memcachedPort = '11213';
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
  it('memory cache test', async($traceurRuntime.initGeneratorFunction(function $__3() {
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
  it.only('memcached test', async($traceurRuntime.initGeneratorFunction(function $__4() {
    var server,
        $__0,
        cacheFilter,
        cacheInvalidationFilter,
        increment,
        reset,
        memcachedServers,
        memcached,
        config,
        counterHandler,
        resetHandler,
        counterHandler2;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            server = spawn('memcached', ['-p', memcachedPort], {stdio: 'ignore'});
            server.on('exit', (function(code) {
              code = code | 0;
              if (code != 0)
                throw new Error('failed to start memcached test server');
            }));
            $__0 = $traceurRuntime.assertObject(makeMemcachedFilters({getCacheId: getCacheId})), cacheFilter = $__0.cacheFilter, cacheInvalidationFilter = $__0.cacheInvalidationFilter;
            $__0 = $traceurRuntime.assertObject(counterBundle.makePrivate().handlerComponents), increment = $__0.increment, reset = $__0.reset;
            increment.addMiddleware(cacheFilter);
            reset.addMiddleware(cacheInvalidationFilter);
            memcachedServers = '127.0.0.1:' + memcachedPort;
            memcached = createMemcached(memcachedServers);
            config = {memcachedServers: memcachedServers};
            $ctx.state = 58;
            break;
          case 58:
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
            return timeout(100);
          case 14:
            $ctx.maybeThrow();
            $ctx.state = 16;
            break;
          case 16:
            $ctx.state = 18;
            return counterHandler({id: 'foo'}).should.eventually.equal('foo-1');
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
            return timeout(100);
          case 26:
            $ctx.maybeThrow();
            $ctx.state = 28;
            break;
          case 28:
            $ctx.state = 30;
            return counterHandler({id: 'bar'}).should.eventually.equal('bar-1');
          case 30:
            $ctx.maybeThrow();
            $ctx.state = 32;
            break;
          case 32:
            $ctx.state = 34;
            return resetHandler({
              id: 'foo',
              count: 5
            });
          case 34:
            $ctx.maybeThrow();
            $ctx.state = 36;
            break;
          case 36:
            $ctx.state = 38;
            return counterHandler({id: 'foo'}).should.eventually.equal('foo-6');
          case 38:
            $ctx.maybeThrow();
            $ctx.state = 40;
            break;
          case 40:
            $ctx.state = 42;
            return counterHandler({id: 'bar'}).should.eventually.equal('bar-1');
          case 42:
            $ctx.maybeThrow();
            $ctx.state = 44;
            break;
          case 44:
            $ctx.state = 46;
            return increment.loadHandler(config);
          case 46:
            counterHandler2 = $ctx.sent;
            $ctx.state = 48;
            break;
          case 48:
            $ctx.state = 50;
            return counterHandler2({id: 'foo'}).should.eventually.equal('foo-6');
          case 50:
            $ctx.maybeThrow();
            $ctx.state = 52;
            break;
          case 52:
            $ctx.state = 54;
            return counterHandler2({id: 'bar'}).should.eventually.equal('bar-1');
          case 54:
            $ctx.maybeThrow();
            $ctx.state = 56;
            break;
          case 56:
            server.kill();
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__4, this);
  })));
}));
