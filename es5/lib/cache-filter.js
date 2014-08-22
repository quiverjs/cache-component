"use strict";
Object.defineProperties(exports, {
  cacheStoreProtocol: {get: function() {
      return cacheStoreProtocol;
    }},
  abstractCacheFilter: {get: function() {
      return abstractCacheFilter;
    }},
  abstractCacheInvalidationFilter: {get: function() {
      return abstractCacheInvalidationFilter;
    }},
  __esModule: {value: true}
});
var copy = $traceurRuntime.assertObject(require('quiver-object')).copy;
var async = $traceurRuntime.assertObject(require('quiver-promise')).async;
var reuseStreamable = $traceurRuntime.assertObject(require('quiver-stream-util')).reuseStreamable;
var $__0 = $traceurRuntime.assertObject(require('quiver-component')),
    abstractComponent = $__0.abstractComponent,
    protocol = $__0.protocol,
    streamFilter = $__0.streamFilter,
    argsBuilderFilter = $__0.argsBuilderFilter;
var cacheIdProtocol = protocol('cache id protocol').simpleHandler('getCacheId', 'void', 'text');
var cacheStoreProtocol = protocol('cacheProtocol').subprotocol(cacheIdProtocol).simpleHandler('getCacheEntry', 'void', 'streamable').simpleHandler('setCacheEntry', 'streamable', 'void').simpleHandler('removeCacheEntry', 'void', 'void');
var _cacheId = Symbol('cacheId');
var cacheIdFilter = argsBuilderFilter((function(config) {
  var cacheProtocol = $traceurRuntime.assertObject(config).cacheProtocol;
  var getCacheId = $traceurRuntime.assertObject(cacheProtocol).getCacheId;
  return async($traceurRuntime.initGeneratorFunction(function $__1(args) {
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
    }, $__1, this);
  }));
}));
var cacheFilter = streamFilter((function(config, handler) {
  var cacheProtocol = $traceurRuntime.assertObject(config).cacheProtocol;
  var $__0 = $traceurRuntime.assertObject(cacheProtocol),
      getCacheId = $__0.getCacheId,
      getCacheEntry = $__0.getCacheEntry,
      setCacheEntry = $__0.setCacheEntry;
  return async($traceurRuntime.initGeneratorFunction(function $__1(args, inputStreamable) {
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
    }, $__1, this);
  }));
})).addMiddleware(cacheIdFilter);
var cacheInvalidationFilter = argsBuilderFilter((function(config) {
  var cacheProtocol = $traceurRuntime.assertObject(config).cacheProtocol;
  var removeCacheEntry = $traceurRuntime.assertObject(cacheProtocol).removeCacheEntry;
  return async($traceurRuntime.initGeneratorFunction(function $__1(args) {
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
    }, $__1, this);
  }));
})).addMiddleware(cacheIdFilter);
var abstractCacheFilter = abstractComponent('cacheProtocol', cacheStoreProtocol, cacheFilter);
var abstractCacheInvalidationFilter = abstractComponent('cacheProtocol', cacheStoreProtocol, cacheInvalidationFilter);
