"use strict";
Object.defineProperties(exports, {
  memoryCacheStoreBundle: {get: function() {
      return memoryCacheStoreBundle;
    }},
  getCacheEntry: {get: function() {
      return getCacheEntry;
    }},
  setCacheEntry: {get: function() {
      return setCacheEntry;
    }},
  abstractMemoryCacheFilter: {get: function() {
      return abstractMemoryCacheFilter;
    }},
  __esModule: {value: true}
});
var error = $traceurRuntime.assertObject(require('quiver-error')).error;
var $__0 = $traceurRuntime.assertObject(require('quiver-promise')),
    reject = $__0.reject,
    resolve = $__0.resolve,
    async = $__0.async;
var simpleToStreamHandler = $traceurRuntime.assertObject(require('quiver-simple-handler')).simpleToStreamHandler;
var $__0 = $traceurRuntime.assertObject(require('quiver-stream-util')),
    reuseStream = $__0.reuseStream,
    reuseStreamable = $__0.reuseStreamable;
var $__0 = $traceurRuntime.assertObject(require('quiver-component')),
    handleableBuilder = $__0.handleableBuilder,
    streamHandlerBuilder = $__0.streamHandlerBuilder,
    partialImplement = $__0.partialImplement,
    handlerBundle = $__0.handlerBundle;
var abstractCacheFilter = $traceurRuntime.assertObject(require('./cache-filter.js')).abstractCacheFilter;
var inMemoryStreamable = async($traceurRuntime.initGeneratorFunction(function $__1(streamable) {
  var newStreamable,
      $__2,
      $__3,
      $__4,
      $__5;
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
          $__2 = streamable.toStream;
          $__3 = $__2.call(streamable);
          $ctx.state = 13;
          break;
        case 13:
          $ctx.state = 9;
          return $__3;
        case 9:
          $__4 = $ctx.sent;
          $ctx.state = 11;
          break;
        case 11:
          $__5 = reuseStream($__4);
          $ctx.state = 15;
          break;
        case 15:
          $ctx.state = 17;
          return $__5;
        case 17:
          newStreamable = $ctx.sent;
          $ctx.state = 19;
          break;
        case 19:
          streamable.toStream = newStreamable.toStream;
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
  }, $__1, this);
}));
var memoryCacheStoreBundle = handlerBundle((function(config) {
  var cacheStore = {};
  var getCacheEntry = function(args) {
    var cacheId = $traceurRuntime.assertObject(args).cacheId;
    if (cacheStore[cacheId])
      return cacheStore[cacheId];
    return reject(error(404, 'not found'));
  };
  var setCacheEntry = async($traceurRuntime.initGeneratorFunction(function $__6(args, streamable) {
    var cacheId;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            cacheId = $traceurRuntime.assertObject(args).cacheId;
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
    }, $__6, this);
  }));
  return {
    getCacheEntry: getCacheEntry,
    setCacheEntry: setCacheEntry
  };
})).simpleHandler('getCacheEntry', 'void', 'streamable').simpleHandler('setCacheEntry', 'streamable', 'void');
var $__0 = $traceurRuntime.assertObject(memoryCacheStoreBundle.handlerComponents),
    getCacheEntry = $__0.getCacheEntry,
    setCacheEntry = $__0.setCacheEntry;
;
var abstractMemoryCacheFilter = partialImplement(abstractCacheFilter, {
  getCacheEntry: getCacheEntry,
  setCacheEntry: setCacheEntry
});
