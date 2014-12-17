"use strict";
Object.defineProperties(exports, {
  memoryCacheStoreBundle: {get: function() {
      return memoryCacheStoreBundle;
    }},
  memoryCacheFilter: {get: function() {
      return memoryCacheFilter;
    }},
  memoryCacheInvalidationFilter: {get: function() {
      return memoryCacheInvalidationFilter;
    }},
  makeMemoryCacheStoreBundle: {get: function() {
      return makeMemoryCacheStoreBundle;
    }},
  makeMemoryCacheFilter: {get: function() {
      return makeMemoryCacheFilter;
    }},
  makeMemoryCacheInvalidationFilter: {get: function() {
      return makeMemoryCacheInvalidationFilter;
    }},
  makeMemoryCacheFilters: {get: function() {
      return makeMemoryCacheFilters;
    }},
  __esModule: {value: true}
});
var $__quiver_45_error__,
    $__quiver_45_promise__,
    $__quiver_45_stream_45_util__,
    $__quiver_45_component__,
    $__cache_45_filter_46_js__;
var error = ($__quiver_45_error__ = require("quiver-error"), $__quiver_45_error__ && $__quiver_45_error__.__esModule && $__quiver_45_error__ || {default: $__quiver_45_error__}).error;
var $__1 = ($__quiver_45_promise__ = require("quiver-promise"), $__quiver_45_promise__ && $__quiver_45_promise__.__esModule && $__quiver_45_promise__ || {default: $__quiver_45_promise__}),
    reject = $__1.reject,
    resolve = $__1.resolve,
    async = $__1.async;
var $__2 = ($__quiver_45_stream_45_util__ = require("quiver-stream-util"), $__quiver_45_stream_45_util__ && $__quiver_45_stream_45_util__.__esModule && $__quiver_45_stream_45_util__ || {default: $__quiver_45_stream_45_util__}),
    reuseStream = $__2.reuseStream,
    reuseStreamable = $__2.reuseStreamable;
var $__3 = ($__quiver_45_component__ = require("quiver-component"), $__quiver_45_component__ && $__quiver_45_component__.__esModule && $__quiver_45_component__ || {default: $__quiver_45_component__}),
    handleableBuilder = $__3.handleableBuilder,
    streamHandlerBuilder = $__3.streamHandlerBuilder,
    handlerBundle = $__3.handlerBundle;
var $__4 = ($__cache_45_filter_46_js__ = require("./cache-filter.js"), $__cache_45_filter_46_js__ && $__cache_45_filter_46_js__.__esModule && $__cache_45_filter_46_js__ || {default: $__cache_45_filter_46_js__}),
    makeCacheFilter = $__4.makeCacheFilter,
    makeCacheInvalidationFilter = $__4.makeCacheInvalidationFilter;
var inMemoryStreamable = async($traceurRuntime.initGeneratorFunction(function $__6(streamable) {
  var $__7,
      $__8,
      $__9,
      $__10,
      $__11;
  return $traceurRuntime.createGeneratorInstance(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $ctx.state = 2;
          return reuseStreamable(streamable);
        case 2:
          streamable = $ctx.sent;
          $ctx.state = 4;
          break;
        case 4:
          $ctx.state = (!streamable.offMemory) ? 5 : 6;
          break;
        case 5:
          $ctx.returnValue = streamable;
          $ctx.state = -2;
          break;
        case 6:
          $__7 = streamable.toStream;
          $__8 = $__7.call(streamable);
          $ctx.state = 13;
          break;
        case 13:
          $ctx.state = 9;
          return $__8;
        case 9:
          $__9 = $ctx.sent;
          $ctx.state = 11;
          break;
        case 11:
          $__10 = reuseStream($__9);
          $__11 = $__10.toStream;
          $ctx.state = 15;
          break;
        case 15:
          $ctx.state = 17;
          return $__11;
        case 17:
          streamable.toStream = $ctx.sent;
          $ctx.state = 19;
          break;
        case 19:
          streamable.offMemory = false;
          $ctx.state = 23;
          break;
        case 23:
          $ctx.returnValue = streamable;
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, $__6, this);
}));
var memoryCacheStoreBundle = handlerBundle((function(config) {
  var cacheStore = {};
  var getCacheEntry = (function(args) {
    var cacheId = args.cacheId;
    if (cacheStore[cacheId]) {
      var streamable = cacheStore[cacheId];
      if (!streamable.isClosed)
        return streamable;
      cacheStore[cacheId] = null;
    }
    return reject(error(404, 'not found'));
  });
  var setCacheEntry = async($traceurRuntime.initGeneratorFunction(function $__12(args, streamable) {
    var cacheId;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            cacheId = args.cacheId;
            $ctx.state = 6;
            break;
          case 6:
            $ctx.state = 2;
            return inMemoryStreamable(streamable);
          case 2:
            streamable = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            cacheStore[cacheId] = streamable;
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__12, this);
  }));
  var removeCacheEntry = (function(args) {
    var cacheId = args.cacheId;
    cacheStore[cacheId] = null;
  });
  return {
    getCacheEntry: getCacheEntry,
    setCacheEntry: setCacheEntry,
    removeCacheEntry: removeCacheEntry
  };
})).simpleHandler('getCacheEntry', 'void', 'streamable').simpleHandler('setCacheEntry', 'streamable', 'void').simpleHandler('removeCacheEntry', 'void', 'void');
var memoryCacheComponents = memoryCacheStoreBundle.toHandlerComponents();
var forkTable = {};
var memoryCacheFilter = makeCacheFilter(forkTable).implement(memoryCacheComponents);
var memoryCacheInvalidationFilter = makeCacheInvalidationFilter(forkTable).implement(memoryCacheComponents);
var makeMemoryCacheStoreBundle = memoryCacheStoreBundle.factory();
var makeMemoryCacheFilter = memoryCacheFilter.factory();
var makeMemoryCacheInvalidationFilter = memoryCacheInvalidationFilter.factory();
var makeMemoryCacheFilters = (function() {
  var forkTable = arguments[0] !== (void 0) ? arguments[0] : {};
  return ({
    cacheFilter: makeMemoryCacheFilter(forkTable),
    cacheInvalidationFilter: makeMemoryCacheInvalidationFilter(forkTable)
  });
});
