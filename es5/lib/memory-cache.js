"use strict";
Object.defineProperties(exports, {
  memoryCacheStore: {get: function() {
      return memoryCacheStore;
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
    inputHandlerMiddleware = $__0.inputHandlerMiddleware;
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
var memoryCacheStore = handleableBuilder((function(config) {
  var cacheStore = {};
  var getCacheEntry = simpleToStreamHandler(async($traceurRuntime.initGeneratorFunction(function $__6(args) {
    var cacheId;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            cacheId = $traceurRuntime.assertObject(args).cacheId;
            $ctx.state = 5;
            break;
          case 5:
            $ctx.state = (cacheStore[cacheId]) ? 1 : 2;
            break;
          case 1:
            $ctx.returnValue = cacheStore[cacheId];
            $ctx.state = -2;
            break;
          case 2:
            throw error(404, 'not found');
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__6, this);
  })), 'void', 'streamable');
  var setCacheEntry = simpleToStreamHandler(async($traceurRuntime.initGeneratorFunction(function $__7(args, streamable) {
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
    }, $__7, this);
  })), 'streamable', 'void');
  return {
    getCacheEntry: getCacheEntry,
    setCacheEntry: setCacheEntry
  };
}));
var getCacheEntry = streamHandlerBuilder((function(config) {
  return config.memoryCacheStore.getCacheEntry;
})).addMiddleware(inputHandlerMiddleware(memoryCacheStore, 'memoryCacheStore'));
var setCacheEntry = streamHandlerBuilder((function(config) {
  return config.memoryCacheStore.setCacheEntry;
})).addMiddleware(inputHandlerMiddleware(memoryCacheStore, 'memoryCacheStore'));
var abstractMemoryCacheFilter = partialImplement(abstractCacheFilter, {
  getCacheEntry: getCacheEntry,
  setCacheEntry: setCacheEntry
});
