"use strict";
Object.defineProperties(exports, {
  memcachedStoreBundle: {get: function() {
      return memcachedStoreBundle;
    }},
  abstractMemcachedCacheFilter: {get: function() {
      return abstractMemcachedCacheFilter;
    }},
  abstractMemcachedCacheInvalidationFilter: {get: function() {
      return abstractMemcachedCacheInvalidationFilter;
    }},
  makeMemcachedCacheFilters: {get: function() {
      return makeMemcachedCacheFilters;
    }},
  __esModule: {value: true}
});
var $__1 = $traceurRuntime.assertObject(require('quiver-promise')),
    promisify = $__1.promisify,
    async = $__1.async;
var streamableToBuffer = $traceurRuntime.assertObject(require('quiver-stream-util')).streamableToBuffer;
var handlerBundle = $traceurRuntime.assertObject(require('quiver-component')).handlerBundle;
var $__1 = $traceurRuntime.assertObject(require('./cache-filter.js')),
    abstractCacheFilter = $__1.abstractCacheFilter,
    abstractCacheInvalidationFilter = $__1.abstractCacheInvalidationFilter;
var Memcached = require('memcached');
var promisifyMethod = (function(object, method) {
  return promisify((function() {
    var $__2;
    for (var args = [],
        $__0 = 0; $__0 < arguments.length; $__0++)
      args[$__0] = arguments[$__0];
    return ($__2 = object)[method].apply($__2, $traceurRuntime.toObject(args));
  }));
});
var promisifyMethods = (function(object, methods) {
  return methods.reduce((function(result, method) {
    result[method] = promisifyMethod(object, method);
    return result;
  }), {});
});
var createMemcached = (function(servers, options) {
  var memcached = new Memcached(memcachedServers, memcachedOptions);
  return promisifyMethods(memcached, ['get', 'set', 'replace']);
});
var memcachedStoreBundle = handlerBundle((function(config) {
  var $__1 = $traceurRuntime.assertObject(config),
      memcachedServers = $__1.memcachedServers,
      memcachedOptions = $__1.memcachedOptions;
  var memcached = createMemcached(memcachedServers, memcachedOptions);
  var getCacheEntry = (function(args) {
    var cacheId = $traceurRuntime.assertObject(args).cacheId;
    return memcached.get(cacheId).then((function(data) {
      return data[cacheId];
    }), (function(err) {
      return reject(error(404, 'not found'));
    }));
  });
  var setCacheEntry = async($traceurRuntime.initGeneratorFunction(function $__3(args, streamable) {
    var cacheId,
        buffer;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            cacheId = $traceurRuntime.assertObject(args).cacheId;
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
            return memcached.set(cacheId, buffer);
          case 6:
            $ctx.maybeThrow();
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__3, this);
  }));
  var removeCacheEntry = (function(args) {
    var cacheId = $traceurRuntime.assertObject(args).cacheId;
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
var makeMemcachedCacheFilters = (function(implMap) {
  var privateTable = {};
  return {
    cacheFilter: abstractMemcachedCacheFilter.implement(implMap, privateTable).concretize(),
    cacheInvalidationFilter: abstractMemcachedCacheInvalidationFilter.implement(implMap, privateTable).concretize()
  };
});
