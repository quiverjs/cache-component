"use strict";
Object.defineProperties(exports, {
  getCacheEntry: {get: function() {
      return getCacheEntry;
    }},
  setCacheEntry: {get: function() {
      return setCacheEntry;
    }},
  removeCacheEntry: {get: function() {
      return removeCacheEntry;
    }},
  makeDiskCacheFilters: {get: function() {
      return makeDiskCacheFilters;
    }},
  __esModule: {value: true}
});
var joinPath = $traceurRuntime.assertObject(require('path')).join;
var $__0 = $traceurRuntime.assertObject(require('fs')),
    rename = $__0.rename,
    symlink = $__0.symlink,
    unlink = $__0.unlink;
var pipeStream = $traceurRuntime.assertObject(require('quiver-stream-util')).pipeStream;
var $__0 = $traceurRuntime.assertObject(require('quiver-promise')),
    async = $__0.async,
    promisify = $__0.promisify,
    reject = $__0.reject;
var makeFileStatsHandler = $traceurRuntime.assertObject(require('quiver-file-component')).makeFileStatsHandler;
var $__0 = $traceurRuntime.assertObject(require('quiver-file-stream')),
    fileStreamable = $__0.fileStreamable,
    fileWriteStream = $__0.fileWriteStream;
var makeCacheFilters = $traceurRuntime.assertObject(require('./cache-filter.js')).makeCacheFilters;
var $__0 = $traceurRuntime.assertObject(require('quiver-component')),
    handlerBundle = $__0.handlerBundle,
    partialImplement = $__0.partialImplement,
    argsBuilderFilter = $__0.argsBuilderFilter,
    configAliasMiddleware = $__0.configAliasMiddleware,
    inputHandlerMiddleware = $__0.inputHandlerMiddleware;
var moveFile = promisify(rename);
var linkFile = promisify(symlink);
var removeFile = promisify(unlink);
var cachePathFilter = argsBuilderFilter((function(config) {
  var cacheDir = $traceurRuntime.assertObject(config).cacheDir;
  return (function(args) {
    var cacheId = args.cacheId;
    args.cachePath = joinPath(cacheDir, cacheId);
    return args;
  });
}));
var fileStatsHandler = makeFileStatsHandler().addMiddleware(configAliasMiddleware({dirPath: 'cacheDir'}));
var diskCacheStoreBundle = handlerBundle((function(config) {
  var $__0 = $traceurRuntime.assertObject(config),
      cacheDir = $__0.cacheDir,
      getFileStats = $__0.getFileStats;
  var getCacheEntry = async($traceurRuntime.initGeneratorFunction(function $__1(args) {
    var $__0,
        cacheId,
        cachePath,
        fileStats,
        streamable;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            $__0 = $traceurRuntime.assertObject(args), cacheId = $__0.cacheId, cachePath = $__0.cachePath;
            $ctx.state = 12;
            break;
          case 12:
            $ctx.state = 2;
            return getFileStats({path: cacheId});
          case 2:
            fileStats = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            $ctx.state = 6;
            return fileStreamable(cachePath, fileStats);
          case 6:
            streamable = $ctx.sent;
            $ctx.state = 8;
            break;
          case 8:
            streamable.reusable = false;
            $ctx.state = 14;
            break;
          case 14:
            $ctx.returnValue = streamable;
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__1, this);
  }));
  var setCacheEntry = async($traceurRuntime.initGeneratorFunction(function $__2(args, streamable) {
    var cachePath,
        filePath,
        readStream,
        writeStream;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            cachePath = $traceurRuntime.assertObject(args).cachePath;
            $ctx.state = 33;
            break;
          case 33:
            $ctx.state = (streamable.toFilePath) ? 1 : 10;
            break;
          case 1:
            $ctx.state = 2;
            return streamable.toFilePath();
          case 2:
            filePath = $ctx.sent;
            $ctx.state = 4;
            break;
          case 4:
            $ctx.state = (streamable.tempFile) ? 5 : 17;
            break;
          case 5:
            $ctx.state = 6;
            return moveFile(filePath, cachePath);
          case 6:
            $ctx.maybeThrow();
            $ctx.state = 8;
            break;
          case 8:
            $ctx.state = -2;
            break;
          case 17:
            $ctx.state = (streamable.reusable) ? 11 : 10;
            break;
          case 11:
            $ctx.state = 12;
            return linkFile(filePath, cachePath);
          case 12:
            $ctx.maybeThrow();
            $ctx.state = 14;
            break;
          case 14:
            $ctx.state = -2;
            break;
          case 10:
            $ctx.state = 21;
            return streamable.toStream();
          case 21:
            readStream = $ctx.sent;
            $ctx.state = 23;
            break;
          case 23:
            $ctx.state = 25;
            return fileWriteStream(cachePath);
          case 25:
            writeStream = $ctx.sent;
            $ctx.state = 27;
            break;
          case 27:
            $ctx.state = 29;
            return pipeStream(readStream, writeStream);
          case 29:
            $ctx.maybeThrow();
            $ctx.state = -2;
            break;
          default:
            return $ctx.end();
        }
    }, $__2, this);
  }));
  var removeCacheEntry = (function(args) {
    var cachePath = $traceurRuntime.assertObject(args).cachePath;
    return removeFile(cachePath);
  });
  return {
    getCacheEntry: getCacheEntry,
    setCacheEntry: setCacheEntry,
    removeCacheEntry: removeCacheEntry
  };
})).simpleHandler('getCacheEntry', 'void', 'streamable').simpleHandler('setCacheEntry', 'streamable', 'void').simpleHandler('removeCacheEntry', 'void', 'void').addMiddleware(cachePathFilter).addMiddleware(inputHandlerMiddleware(fileStatsHandler, 'getFileStats'));
var $__0 = $traceurRuntime.assertObject(diskCacheStoreBundle.handlerComponents),
    getCacheEntry = $__0.getCacheEntry,
    setCacheEntry = $__0.setCacheEntry,
    removeCacheEntry = $__0.removeCacheEntry;
;
var makeDiskCacheFilters = partialImplement(makeCacheFilters, {
  getCacheEntry: getCacheEntry,
  setCacheEntry: setCacheEntry,
  removeCacheEntry: removeCacheEntry
});
