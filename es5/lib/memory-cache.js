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
    resolve = $__0.resolve;
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
var inMemoryStreamable = (function(streamable) {
  return reuseStreamable(streamable).then((function(streamable) {
    if (!streamable.offMemory)
      return resolve(streamable);
    return streamable.toStream().then(reuseStream).then((function(newStreamable) {
      streamable.toStream = newStreamable.toStream;
      streamable.offMemory = false;
      return streamable;
    }));
  }));
});
var memoryCacheStore = handleableBuilder((function(config) {
  var $__0 = $traceurRuntime.assertObject(config),
      cacheExpiry = $__0.cacheExpiry,
      memoryLimit = $__0.memoryLimit;
  var cacheStore = {};
  var getCacheEntry = simpleToStreamHandler((function(args) {
    var $__0 = $traceurRuntime.assertObject(args),
        cacheId = $__0.cacheId,
        cacheTag = $__0.cacheTag;
    if (cacheStore[cacheId]) {
      return resolve(cacheStore[cacheId]);
    }
    return reject(error(404, 'not found'));
  }), 'void', 'streamable');
  var setCacheEntry = simpleToStreamHandler((function(args, streamable) {
    var cacheId = $traceurRuntime.assertObject(args).cacheId;
    return inMemoryStreamable(streamable).then((function(streamable) {
      cacheStore[cacheId] = streamable;
    }));
  }), 'streamable', 'void');
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
