import { pipeStream } from 'quiver-stream-util'
import { async, promisify, reject } from 'quiver-promise'
import { fileStatsHandler } from 'quiver-file-component'
import { fileStreamable, fileWriteStream } from 'quiver-file-stream'

import pathLib from 'path'
var { join: joinPath } = pathLib

import fs from 'fs'
var { rename, symlink, unlink } = fs

import { 
  abstractCacheFilter, 
  abstractCacheInvalidationFilter 
} from './cache-filter.js'

import {
  handlerBundle,
  argsBuilderFilter,
  configAliasMiddleware,
  inputHandlerMiddleware
} from 'quiver-component'

var moveFile = promisify(rename)
var linkFile = promisify(symlink)
var removeFile = promisify(unlink)

var cachePathFilter = argsBuilderFilter(
config => {
  var { cacheDir } = config

  return args => {
    var cacheId = args.cacheId
    args.cachePath = joinPath(cacheDir, cacheId)

    return args
  }
})

export var diskCacheStoreBundle = handlerBundle(
config => {
  var { cacheDir, getFileStats } = config

  var getCacheEntry = async(function*(args) {
    var { cacheId, cachePath } = args

    var fileStats = yield getFileStats({path: cacheId})

    var streamable = yield fileStreamable(cachePath, fileStats)
    streamable.reusable = false

    return streamable
  })

  var setCacheEntry = async(function*(args, streamable) {
    var { cachePath } = args

    if(streamable.toFilePath) {
      var filePath = yield streamable.toFilePath()

      if(streamable.tempFile) {
        yield moveFile(filePath, cachePath)
        return

      } else if(streamable.reusable) {
        yield linkFile(filePath, cachePath)
        return
      }
    }

    var readStream = yield streamable.toStream()
    var writeStream = yield fileWriteStream(cachePath)
    yield pipeStream(readStream, writeStream)
  })

  var removeCacheEntry = args => {
    var { cachePath } = args

    return removeFile(cachePath)
  }

  return { 
    getCacheEntry, setCacheEntry, removeCacheEntry
  }
})
.simpleHandler('getCacheEntry', 'void', 'streamable')
.simpleHandler('setCacheEntry', 'streamable', 'void')
.simpleHandler('removeCacheEntry', 'void', 'void')
.addMiddleware(cachePathFilter)
.addMiddleware(inputHandlerMiddleware(
  fileStatsHandler()
    .addMiddleware(configAliasMiddleware({
      dirPath: 'cacheDir'
    })), 'getFileStats'))

var cacheComponents = diskCacheStoreBundle.handlerComponents

var abstractDiskCacheFilter = abstractCacheFilter
  .implement(cacheComponents)

var abstractDiskCacheInvalidationFilter =
  abstractCacheInvalidationFilter
  .implement(cacheComponents)

export var makeDiskCacheFilters = (implMap) => {
  var privateTable = { }

  return {
    cacheFilter: 
      abstractDiskCacheFilter
        .implement(implMap, privateTable)
        .concretize(), 
        
    cacheInvalidationFilter:
      abstractDiskCacheInvalidationFilter
        .implement(implMap, privateTable)
        .concretize()
  }
}