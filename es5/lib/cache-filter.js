"use strict";
Object.defineProperties(exports, {
  abstractCacheFilter: {get: function() {
      return abstractCacheFilter;
    }},
  __esModule: {value: true}
});
var copy = $traceurRuntime.assertObject(require('quiver-object')).copy;
var async = $traceurRuntime.assertObject(require('quiver-promise')).async;
var reuseStreamable = $traceurRuntime.assertObject(require('quiver-stream-util')).reuseStreamable;
var $__0 = $traceurRuntime.assertObject(require('quiver-component')),
    abstractComponent = $__0.abstractComponent,
    streamFilter = $__0.streamFilter,
    protocol = $__0.protocol;
var cacheProtocol = protocol('cacheProtocol').simpleHandler('getCacheId', 'void', 'text').simpleHandler('getCacheEntry', 'void', 'streamable').simpleHandler('setCacheEntry', 'streamable', 'void');
var abstractCacheFilter = abstractComponent('cacheProtocol', cacheProtocol, streamFilter((function(config, handler) {
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
            $ctx.pushTry(7, null);
            $ctx.state = 10;
            break;
          case 10:
            $ctx.state = 2;
            return getCacheId(copy(args));
          case 2:
            cacheId = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            $ctx.popTry();
            $ctx.state = 12;
            break;
          case 7:
            $ctx.popTry();
            err = $ctx.storedException;
            $ctx.state = 5;
            break;
          case 5:
            $ctx.returnValue = handler(args, inputStreamable);
            $ctx.state = -2;
            break;
          case 12:
            $ctx.pushTry(23, null);
            $ctx.state = 26;
            break;
          case 26:
            $ctx.state = 15;
            return getCacheEntry({cacheId: cacheId});
          case 15:
            cachedResult = $ctx.sent;
            $ctx.state = 17;
            break;
          case 17:
            $ctx.returnValue = cachedResult;
            $ctx.state = -2;
            break;
          case 19:
            $ctx.popTry();
            $ctx.state = 28;
            break;
          case 23:
            $ctx.popTry();
            err = $ctx.storedException;
            $ctx.state = 22;
            break;
          case 22:
            $ctx.state = (err.errorCode != 404) ? 20 : 28;
            break;
          case 20:
            $ctx.returnValue = handler(args, inputStreamable);
            $ctx.state = -2;
            break;
          case 28:
            $ctx.state = 31;
            return handler(args, inputStreamable);
          case 31:
            resultStreamable = $ctx.sent;
            $ctx.state = 33;
            break;
          case 33:
            $ctx.state = 35;
            return reuseStreamable(resultStreamable);
          case 35:
            resultStreamable = $ctx.sent;
            $ctx.state = 37;
            break;
          case 37:
            try {
              setCacheEntry({cacheId: cacheId}, resultStreamable);
            } catch (err) {}
            $ctx.state = 41;
            break;
          case 41:
            $ctx.returnValue = resultStreamable;
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__1, this);
  }));
}), {name: 'Quiver Cache Filter'}));
