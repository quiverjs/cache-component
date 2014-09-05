"use strict";
var $__traceur_64_0_46_0_46_58__,
    $__quiver_45_promise__,
    $__quiver_45_component__,
    $__child_95_process__,
    $___46__46__47_lib_47_cache_45_component_46_js__,
    $___46__46__47_lib_47_memcached_46_js__;
($__traceur_64_0_46_0_46_58__ = require("traceur"), $__traceur_64_0_46_0_46_58__ && $__traceur_64_0_46_0_46_58__.__esModule && $__traceur_64_0_46_0_46_58__ || {default: $__traceur_64_0_46_0_46_58__});
var $__0 = ($__quiver_45_promise__ = require("quiver-promise"), $__quiver_45_promise__ && $__quiver_45_promise__.__esModule && $__quiver_45_promise__ || {default: $__quiver_45_promise__}),
    async = $__0.async,
    timeout = $__0.timeout;
var $__1 = ($__quiver_45_component__ = require("quiver-component"), $__quiver_45_component__ && $__quiver_45_component__.__esModule && $__quiver_45_component__ || {default: $__quiver_45_component__}),
    simpleHandler = $__1.simpleHandler,
    simpleHandlerBuilder = $__1.simpleHandlerBuilder,
    handlerBundle = $__1.handlerBundle;
var childProcess = ($__child_95_process__ = require("child_process"), $__child_95_process__ && $__child_95_process__.__esModule && $__child_95_process__ || {default: $__child_95_process__}).default;
var spawn = childProcess.spawn;
var $__3 = ($___46__46__47_lib_47_cache_45_component_46_js__ = require("../lib/cache-component.js"), $___46__46__47_lib_47_cache_45_component_46_js__ && $___46__46__47_lib_47_cache_45_component_46_js__.__esModule && $___46__46__47_lib_47_cache_45_component_46_js__ || {default: $___46__46__47_lib_47_cache_45_component_46_js__}),
    makeMemoryCacheFilters = $__3.makeMemoryCacheFilters,
    makeMemcachedFilters = $__3.makeMemcachedFilters;
var createMemcached = ($___46__46__47_lib_47_memcached_46_js__ = require("../lib/memcached.js"), $___46__46__47_lib_47_memcached_46_js__ && $___46__46__47_lib_47_memcached_46_js__.__esModule && $___46__46__47_lib_47_memcached_46_js__ || {default: $___46__46__47_lib_47_memcached_46_js__}).createMemcached;
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
      var id = args.id;
      var count = table[id] || 0;
      count++;
      table[id] = count;
      return id + '-' + count;
    });
    var reset = (function(args) {
      var $__6;
      var $__5 = args,
          id = $__5.id,
          count = ($__6 = $__5.count) === void 0 ? 0 : $__6;
      table[id] = count;
    });
    return {
      increment: increment,
      reset: reset
    };
  })).simpleHandler('increment', 'void', 'text').simpleHandler('reset', 'void', 'void');
  var $__6 = counterBundle.handlerComponents,
      increment = $__6.increment,
      reset = $__6.reset;
  it('sanity test', async($traceurRuntime.initGeneratorFunction(function $__7() {
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
    }, $__7, this);
  })));
  it('memory cache test', async($traceurRuntime.initGeneratorFunction(function $__8() {
    var $__6,
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
            $__6 = makeMemoryCacheFilters({getCacheId: getCacheId}), cacheFilter = $__6.cacheFilter, cacheInvalidationFilter = $__6.cacheInvalidationFilter;
            $__6 = counterBundle.makePrivate().handlerComponents, increment = $__6.increment, reset = $__6.reset;
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
    }, $__8, this);
  })));
  it.only('memcached test', async($traceurRuntime.initGeneratorFunction(function $__9() {
    var server,
        $__6,
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
            $__6 = makeMemcachedFilters({getCacheId: getCacheId}), cacheFilter = $__6.cacheFilter, cacheInvalidationFilter = $__6.cacheInvalidationFilter;
            $__6 = counterBundle.makePrivate().handlerComponents, increment = $__6.increment, reset = $__6.reset;
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
    }, $__9, this);
  })));
}));
