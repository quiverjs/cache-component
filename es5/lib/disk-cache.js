"use strict";
Object.defineProperties(exports, {
  diskCacheStoreBundle: {get: function() {
      return diskCacheStoreBundle;
    }},
  diskCacheFilter: {get: function() {
      return diskCacheFilter;
    }},
  diskCacheInvalidationFilter: {get: function() {
      return diskCacheInvalidationFilter;
    }},
  makeDiskCacheFilter: {get: function() {
      return makeDiskCacheFilter;
    }},
  makeDiskCacheInvalidationFilter: {get: function() {
      return makeDiskCacheInvalidationFilter;
    }},
  makeDiskCacheFilters: {get: function() {
      return makeDiskCacheFilters;
    }},
  __esModule: {value: true}
});
var $__quiver_45_stream_45_util__,
    $__quiver_45_promise__,
    $__quiver_45_file_45_component__,
    $__quiver_45_file_45_stream__,
    $__path__,
    $__fs__,
    $__cache_45_filter_46_js__,
    $__quiver_45_component__;
var pipeStream = ($__quiver_45_stream_45_util__ = require("quiver-stream-util"), $__quiver_45_stream_45_util__ && $__quiver_45_stream_45_util__.__esModule && $__quiver_45_stream_45_util__ || {default: $__quiver_45_stream_45_util__}).pipeStream;
var $__1 = ($__quiver_45_promise__ = require("quiver-promise"), $__quiver_45_promise__ && $__quiver_45_promise__.__esModule && $__quiver_45_promise__ || {default: $__quiver_45_promise__}),
    async = $__1.async,
    promisify = $__1.promisify,
    reject = $__1.reject;
var fileStatsHandler = ($__quiver_45_file_45_component__ = require("quiver-file-component"), $__quiver_45_file_45_component__ && $__quiver_45_file_45_component__.__esModule && $__quiver_45_file_45_component__ || {default: $__quiver_45_file_45_component__}).fileStatsHandler;
var $__3 = ($__quiver_45_file_45_stream__ = require("quiver-file-stream"), $__quiver_45_file_45_stream__ && $__quiver_45_file_45_stream__.__esModule && $__quiver_45_file_45_stream__ || {default: $__quiver_45_file_45_stream__}),
    fileStreamable = $__3.fileStreamable,
    fileWriteStream = $__3.fileWriteStream;
var pathLib = ($__path__ = require("path"), $__path__ && $__path__.__esModule && $__path__ || {default: $__path__}).default;
var joinPath = pathLib.join;
var fs = ($__fs__ = require("fs"), $__fs__ && $__fs__.__esModule && $__fs__ || {default: $__fs__}).default;
var $__9 = fs,
    rename = $__9.rename,
    symlink = $__9.symlink,
    unlink = $__9.unlink;
var $__6 = ($__cache_45_filter_46_js__ = require("./cache-filter.js"), $__cache_45_filter_46_js__ && $__cache_45_filter_46_js__.__esModule && $__cache_45_filter_46_js__ || {default: $__cache_45_filter_46_js__}),
    makeCacheFilter = $__6.makeCacheFilter,
    makeCacheInvalidationFilter = $__6.makeCacheInvalidationFilter;
var $__7 = ($__quiver_45_component__ = require("quiver-component"), $__quiver_45_component__ && $__quiver_45_component__.__esModule && $__quiver_45_component__ || {default: $__quiver_45_component__}),
    handlerBundle = $__7.handlerBundle,
    argsBuilderFilter = $__7.argsBuilderFilter,
    configAliasMiddleware = $__7.configAliasMiddleware,
    inputHandlerMiddleware = $__7.inputHandlerMiddleware;
var moveFile = promisify(rename);
var linkFile = promisify(symlink);
var removeFile = promisify(unlink);
var cacheFileStatsHandler = fileStatsHandler().configAlias({dirPath: 'cacheDir'});
var cachePathFilter = argsBuilderFilter((function(config) {
  var cacheDir = config.cacheDir;
  return (function(args) {
    var cacheId = args.cacheId;
    args.cachePath = joinPath(cacheDir, cacheId);
    return args;
  });
}));
var diskCacheStoreBundle = handlerBundle((function(config) {
  var $__10 = config,
      cacheDir = $__10.cacheDir,
      getFileStats = $__10.getFileStats;
  var getCacheEntry = async($traceurRuntime.initGeneratorFunction(function $__12(args) {
    var $__11,
        cacheId,
        cachePath,
        fileStats,
        streamable;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            $__11 = args, cacheId = $__11.cacheId, cachePath = $__11.cachePath;
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
    }, $__12, this);
  }));
  var setCacheEntry = async($traceurRuntime.initGeneratorFunction(function $__13(args, streamable) {
    var cachePath,
        filePath,
        readStream,
        writeStream;
    return $traceurRuntime.createGeneratorInstance(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            cachePath = args.cachePath;
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
    }, $__13, this);
  }));
  var removeCacheEntry = (function(args) {
    var cachePath = args.cachePath;
    return removeFile(cachePath);
  });
  return {
    getCacheEntry: getCacheEntry,
    setCacheEntry: setCacheEntry,
    removeCacheEntry: removeCacheEntry
  };
})).simpleHandler('getCacheEntry', 'void', 'streamable').simpleHandler('setCacheEntry', 'streamable', 'void').simpleHandler('removeCacheEntry', 'void', 'void').middleware(cachePathFilter).inputHandler(cacheFileStatsHandler, 'getFileStats');
var diskCacheComponents = diskCacheStoreBundle.toHandlerComponents();
var forkTable = {};
var diskCacheFilter = makeCacheFilter(forkTable).implement(diskCacheComponents);
var diskCacheInvalidationFilter = makeCacheInvalidationFilter(forkTable).implement(diskCacheComponents);
var makeDiskCacheFilter = diskCacheFilter.factory();
var makeDiskCacheInvalidationFilter = diskCacheInvalidationFilter.factory();
var makeDiskCacheFilters = (function() {
  var forkTable = arguments[0] !== (void 0) ? arguments[0] : {};
  return ({
    cacheFilter: makeDiskCacheFilter(forkTable),
    cacheInvalidationFilter: makeDiskCacheInvalidationFilter(forkTable)
  });
});
