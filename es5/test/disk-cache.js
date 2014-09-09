"use strict";
var $__traceur_64_0_46_0_46_58__,
    $__quiver_45_promise__,
    $__quiver_45_component__,
    $__path__,
    $__fs__,
    $__chai__,
    $__chai_45_as_45_promised__,
    $___46__46__47_lib_47_cache_45_component_46_js__;
($__traceur_64_0_46_0_46_58__ = require("traceur"), $__traceur_64_0_46_0_46_58__ && $__traceur_64_0_46_0_46_58__.__esModule && $__traceur_64_0_46_0_46_58__ || {default: $__traceur_64_0_46_0_46_58__});
var $__0 = ($__quiver_45_promise__ = require("quiver-promise"), $__quiver_45_promise__ && $__quiver_45_promise__.__esModule && $__quiver_45_promise__ || {default: $__quiver_45_promise__}),
    async = $__0.async,
    promisify = $__0.promisify,
    timeout = $__0.timeout;
var $__1 = ($__quiver_45_component__ = require("quiver-component"), $__quiver_45_component__ && $__quiver_45_component__.__esModule && $__quiver_45_component__ || {default: $__quiver_45_component__}),
    simpleHandler = $__1.simpleHandler,
    simpleHandlerBuilder = $__1.simpleHandlerBuilder,
    handlerBundle = $__1.handlerBundle,
    transformFilter = $__1.transformFilter;
var pathLib = ($__path__ = require("path"), $__path__ && $__path__.__esModule && $__path__ || {default: $__path__}).default;
var joinPath = pathLib.join;
var fs = ($__fs__ = require("fs"), $__fs__ && $__fs__.__esModule && $__fs__ || {default: $__fs__}).default;
var $__7 = fs,
    existsSync = $__7.existsSync,
    readFileSync = $__7.readFileSync;
var chai = ($__chai__ = require("chai"), $__chai__ && $__chai__.__esModule && $__chai__ || {default: $__chai__}).default;
var chaiAsPromised = ($__chai_45_as_45_promised__ = require("chai-as-promised"), $__chai_45_as_45_promised__ && $__chai_45_as_45_promised__.__esModule && $__chai_45_as_45_promised__ || {default: $__chai_45_as_45_promised__}).default;
var diskCacheFilters = ($___46__46__47_lib_47_cache_45_component_46_js__ = require("../lib/cache-component.js"), $___46__46__47_lib_47_cache_45_component_46_js__ && $___46__46__47_lib_47_cache_45_component_46_js__.__esModule && $___46__46__47_lib_47_cache_45_component_46_js__ || {default: $___46__46__47_lib_47_cache_45_component_46_js__}).diskCacheFilters;
chai.use(chaiAsPromised);
var should = chai.should();
var expect = chai.expect;
var cacheDir = 'temp';
describe('disk cache filter test', (function() {
  var getCacheId = simpleHandler((function(args) {
    return args.id;
  }), 'void', 'text');
  var uppercase = simpleHandler((function(args, text) {
    return text.toUpperCase();
  }), 'text', 'text');
  var greet = simpleHandler((function(args) {
    var id = args.id;
    return 'Hello, ' + id;
  }), 'void', 'text').addMiddleware(transformFilter(uppercase, 'out'));
  it('sanity test', async($traceurRuntime.initGeneratorFunction(function $__8() {
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
    }, $__8, this);
  })));
  it('basic test', async($traceurRuntime.initGeneratorFunction(function $__9() {
    var $__7,
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
            $__7 = diskCacheFilters({getCacheId: getCacheId}), cacheFilter = $__7.cacheFilter, cacheInvalidationFilter = $__7.cacheInvalidationFilter;
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
            existsSync(cacheFile).should.equal(false);
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
            readFileSync(cacheFile).toString().should.equal('HELLO, FOO');
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__9, this);
  })));
}));
