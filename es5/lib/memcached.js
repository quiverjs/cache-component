"use strict";
Object.defineProperties(exports, {
  createMemcached: {get: function() {
      return createMemcached;
    }},
  memcachedStoreBundle: {get: function() {
      return memcachedStoreBundle;
    }},
  abstractMemcachedCacheFilter: {get: function() {
      return abstractMemcachedCacheFilter;
    }},
  abstractMemcachedCacheInvalidationFilter: {get: function() {
      return abstractMemcachedCacheInvalidationFilter;
    }},
  makeMemcachedFilters: {get: function() {
      return makeMemcachedFilters;
    }},
  __esModule: {value: true}
});
var $__quiver_45_error__,
    $__quiver_45_promise__,
    $__quiver_45_stream_45_util__,
    $__quiver_45_component__,
    $__cache_45_filter_46_js__,
    $__memcached__;
var error = ($__quiver_45_error__ = require("quiver-error"), $__quiver_45_error__ && $__quiver_45_error__.__esModule && $__quiver_45_error__ || {default: $__quiver_45_error__}).error;
var $__1 = ($__quiver_45_promise__ = require("quiver-promise"), $__quiver_45_promise__ && $__quiver_45_promise__.__esModule && $__quiver_45_promise__ || {default: $__quiver_45_promise__}),
    promisify = $__1.promisify,
    async = $__1.async,
    reject = $__1.reject;
var $__2 = ($__quiver_45_stream_45_util__ = require("quiver-stream-util"), $__quiver_45_stream_45_util__ && $__quiver_45_stream_45_util__.__esModule && $__quiver_45_stream_45_util__ || {default: $__quiver_45_stream_45_util__}),
    streamableToBuffer = $__2.streamableToBuffer,
    bufferToStreamable = $__2.bufferToStreamable;
var handlerBundle = ($__quiver_45_component__ = require("quiver-component"), $__quiver_45_component__ && $__quiver_45_component__.__esModule && $__quiver_45_component__ || {default: $__quiver_45_component__}).handlerBundle;
var $__4 = ($__cache_45_filter_46_js__ = require("./cache-filter.js"), $__cache_45_filter_46_js__ && $__cache_45_filter_46_js__.__esModule && $__cache_45_filter_46_js__ || {default: $__cache_45_filter_46_js__}),
    abstractCacheFilter = $__4.abstractCacheFilter,
    abstractCacheInvalidationFilter = $__4.abstractCacheInvalidationFilter;
var Memcached = ($__memcached__ = require("memcached"), $__memcached__ && $__memcached__.__esModule && $__memcached__ || {default: $__memcached__}).default;
var promisifyMethod = (function(object, method) {
  return promisify((function() {
    var $__9;
    for (var args = [],
        $__6 = 0; $__6 < arguments.length; $__6++)
      args[$__6] = arguments[$__6];
    return ($__9 = object)[method].apply($__9, $traceurRuntime.spread(args));
  }));
});
var promisifyMethods = (function(object, methods) {
  return methods.reduce((function(result, method) {
    result[method] = promisifyMethod(object, method);
    return result;
  }), {});
});
var createMemcached = (function(servers, options) {
  var memcached = new Memcached(servers, options);
  return promisifyMethods(memcached, ['get', 'set', 'replace', 'del']);
});
var memcachedStoreBundle = handlerBundle((function(config) {
  var $__8;
  var $__7 = config,
      memcachedServers = $__7.memcachedServers,
      memcachedOptions = $__7.memcachedOptions,
      cacheExpiry = ($__8 = $__7.cacheExpiry) === void 0 ? 300 : $__8;
  var memcached = createMemcached(memcachedServers, memcachedOptions);
  var getCacheEntry = (function(args) {
    var cacheId = args.cacheId;
    return memcached.get(cacheId).then((function(data) {
      return data ? bufferToStreamable(data) : reject(error(404, 'not found'));
    }));
  });
  var setCacheEntry = async($traceurRuntime.initGeneratorFunction(function $__10(args, streamable) {
    var cacheId,
        buffer;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            cacheId = args.cacheId;
            $ctx.state = 10;
            break;
          case 10:
            $ctx.state = 2;
            return streamableToBuffer(streamable);
          case 2:
            buffer = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            $ctx.state = 6;
            return memcached.set(cacheId, buffer, cacheExpiry);
          case 6:
            $ctx.maybeThrow();
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__10, this);
  }));
  var removeCacheEntry = (function(args) {
    var cacheId = args.cacheId;
    return memcached.del(cacheId);
  });
  return {
    getCacheEntry: getCacheEntry,
    setCacheEntry: setCacheEntry,
    removeCacheEntry: removeCacheEntry
  };
})).simpleHandler('getCacheEntry', 'void', 'streamable').simpleHandler('setCacheEntry', 'streamable', 'void').simpleHandler('removeCacheEntry', 'void', 'void');
var cacheComponents = memcachedStoreBundle.handlerComponents;
var abstractMemcachedCacheFilter = abstractCacheFilter.implement(cacheComponents);
var abstractMemcachedCacheInvalidationFilter = abstractCacheInvalidationFilter.implement(cacheComponents);
var makeMemcachedFilters = (function(implMap) {
  var privateTable = {};
  return {
    cacheFilter: abstractMemcachedCacheFilter.implement(implMap, privateTable).concretize(),
    cacheInvalidationFilter: abstractMemcachedCacheInvalidationFilter.implement(implMap, privateTable).concretize()
  };
});
