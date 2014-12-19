"use strict";
Object.defineProperties(exports, {
  cacheFilter: {get: function() {
      return cacheFilter;
    }},
  cacheInvalidationFilter: {get: function() {
      return cacheInvalidationFilter;
    }},
  makeCacheFilter: {get: function() {
      return makeCacheFilter;
    }},
  makeCacheInvalidationFilter: {get: function() {
      return makeCacheInvalidationFilter;
    }},
  makeCacheFilters: {get: function() {
      return makeCacheFilters;
    }},
  __esModule: {value: true}
});
var $__quiver_45_core_47_object__,
    $__quiver_45_core_47_promise__,
    $__quiver_45_core_47_stream_45_util__,
    $__quiver_45_core_47_component__;
var copy = ($__quiver_45_core_47_object__ = require("quiver-core/object"), $__quiver_45_core_47_object__ && $__quiver_45_core_47_object__.__esModule && $__quiver_45_core_47_object__ || {default: $__quiver_45_core_47_object__}).copy;
var async = ($__quiver_45_core_47_promise__ = require("quiver-core/promise"), $__quiver_45_core_47_promise__ && $__quiver_45_core_47_promise__.__esModule && $__quiver_45_core_47_promise__ || {default: $__quiver_45_core_47_promise__}).async;
var reuseStreamable = ($__quiver_45_core_47_stream_45_util__ = require("quiver-core/stream-util"), $__quiver_45_core_47_stream_45_util__ && $__quiver_45_core_47_stream_45_util__.__esModule && $__quiver_45_core_47_stream_45_util__ || {default: $__quiver_45_core_47_stream_45_util__}).reuseStreamable;
var $__3 = ($__quiver_45_core_47_component__ = require("quiver-core/component"), $__quiver_45_core_47_component__ && $__quiver_45_core_47_component__.__esModule && $__quiver_45_core_47_component__ || {default: $__quiver_45_core_47_component__}),
    abstractHandler = $__3.abstractHandler,
    streamFilter = $__3.streamFilter,
    argsBuilderFilter = $__3.argsBuilderFilter,
    simpleHandlerLoader = $__3.simpleHandlerLoader;
var getCacheId = abstractHandler('getCacheId').setLoader(simpleHandlerLoader('void', 'text'));
var getCacheEntry = abstractHandler('getCacheEntry').setLoader(simpleHandlerLoader('void', 'streamable'));
var setCacheEntry = abstractHandler('setCacheEntry').setLoader(simpleHandlerLoader('streamable', 'void'));
var removeCacheEntry = abstractHandler('removeCacheEntry').setLoader(simpleHandlerLoader('void', 'void'));
var _cacheId = Symbol('cacheId');
var cacheIdFilter = argsBuilderFilter((function(config) {
  var getCacheId = config.getCacheId;
  return async($traceurRuntime.initGeneratorFunction(function $__5(args) {
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            $ctx.state = 2;
            return getCacheId(copy(args));
          case 2:
            args[_cacheId] = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            $ctx.returnValue = args;
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__5, this);
  }));
})).inputHandlers({getCacheId: getCacheId});
var cacheFilter = streamFilter((function(config, handler) {
  var $__4 = config,
      getCacheId = $__4.getCacheId,
      getCacheEntry = $__4.getCacheEntry,
      setCacheEntry = $__4.setCacheEntry;
  return async($traceurRuntime.initGeneratorFunction(function $__5(args, inputStreamable) {
    var cacheId,
        cachedResult,
        resultStreamable,
        err;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            cacheId = args[_cacheId];
            $ctx.state = 40;
            break;
          case 40:
            $ctx.pushTry(7, null);
            $ctx.state = 10;
            break;
          case 10:
            $ctx.state = 2;
            return getCacheEntry({cacheId: cacheId});
          case 2:
            cachedResult = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            $ctx.returnValue = cachedResult;
            $ctx.state = -2;
            break;
          case 6:
            $ctx.popTry();
            $ctx.state = 12;
            break;
          case 7:
            $ctx.popTry();
            err = $ctx.storedException;
            $ctx.state = 13;
            break;
          case 13:
            if (err.errorCode != 404)
              throw err;
            $ctx.state = 12;
            break;
          case 12:
            $ctx.state = 17;
            return handler(args, inputStreamable);
          case 17:
            resultStreamable = $ctx.sent;
            $ctx.state = 19;
            break;
          case 19:
            $ctx.state = 21;
            return reuseStreamable(resultStreamable);
          case 21:
            resultStreamable = $ctx.sent;
            $ctx.state = 23;
            break;
          case 23:
            $ctx.pushTry(28, null);
            $ctx.state = 31;
            break;
          case 31:
            $ctx.state = 25;
            return setCacheEntry({cacheId: cacheId}, resultStreamable);
          case 25:
            $ctx.maybeThrow();
            $ctx.state = 27;
            break;
          case 27:
            $ctx.popTry();
            $ctx.state = 33;
            break;
          case 28:
            $ctx.popTry();
            err = $ctx.storedException;
            $ctx.state = 34;
            break;
          case 34:
            console.log('set cache error:', err);
            $ctx.state = 33;
            break;
          case 33:
            $ctx.returnValue = resultStreamable;
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__5, this);
  }));
})).middleware(cacheIdFilter).inputHandlers({
  getCacheEntry: getCacheEntry,
  setCacheEntry: setCacheEntry
});
var cacheInvalidationFilter = argsBuilderFilter((function(config) {
  var removeCacheEntry = config.removeCacheEntry;
  return async($traceurRuntime.initGeneratorFunction(function $__5(args) {
    var cacheId;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            cacheId = args[_cacheId];
            $ctx.state = 8;
            break;
          case 8:
            $ctx.state = 2;
            return removeCacheEntry({cacheId: cacheId});
          case 2:
            $ctx.maybeThrow();
            $ctx.state = 4;
            break;
          case 4:
            args[_cacheId] = null;
            $ctx.state = 10;
            break;
          case 10:
            $ctx.returnValue = args;
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__5, this);
  }));
})).middleware(cacheIdFilter).inputHandlers({removeCacheEntry: removeCacheEntry});
var makeCacheFilter = cacheFilter.factory();
var makeCacheInvalidationFilter = cacheInvalidationFilter.factory();
var makeCacheFilters = (function() {
  var forkTable = arguments[0] !== (void 0) ? arguments[0] : {};
  return ({
    cacheFilter: makeCacheFilter(forkTable),
    cacheInvalidationFilter: makeCacheInvalidationFilter(forkTable)
  });
});
