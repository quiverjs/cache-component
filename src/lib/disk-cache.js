import { pipeStream } from 'quiver-core/stream-util'
import { fileStatsHandler } from 'quiver-file-component'
import { async, promisify, reject } from 'quiver-core/promise'
import { fileStreamable, fileWriteStream } from 'quiver-core/file-stream'

import pathLib from 'path'
let { join: joinPath } = pathLib

import fs from 'fs'
let { rename, symlink, unlink } = fs

import { 
  makeCacheFilter, makeCacheInvalidationFilter
} from './cache-filter.js'

import {
  handlerBundle,
  argsBuilderFilter,
  configAliasMiddleware,
  inputHandlerMiddleware
} from 'quiver-core/component'

let moveFile = promisify(rename)
let linkFile = promisify(symlink)
let removeFile = promisify(unlink)

let cacheFileStatsHandler = fileStatsHandler()
  .configAlias({
    dirPath: 'cacheDir'
  })

let cachePathFilter = argsBuilderFilter(
config => {
  let { cacheDir } = config

  return args => {
    let cacheId = args.cacheId
    args.cachePath = joinPath(cacheDir, cacheId)
  }
})

export let diskCacheStoreBundle = handlerBundle(
config => {
  let { cacheDir, getFileStats } = config

  let getCacheEntry = async(function*(args) {
    let { cacheId, cachePath } = args

    let fileStats = yield getFileStats({path: cacheId})

    let streamable = yield fileStreamable(cachePath, fileStats)
    streamable.reusable = false

    return streamable
  })

  let setCacheEntry = async(function*(args, streamable) {
    let { cachePath } = args

    if(streamable.toFilePath) {
      let filePath = yield streamable.toFilePath()

      if(streamable.tempFile) {
        yield moveFile(filePath, cachePath)
        return

      } else if(streamable.reusable) {
        yield linkFile(filePath, cachePath)
        return
      }
    }

    let readStream = yield streamable.toStream()
    let writeStream = yield fileWriteStream(cachePath)
    yield pipeStream(readStream, writeStream)
  })

  let removeCacheEntry = args => {
    let { cachePath } = args

    return removeFile(cachePath)
  }

  return { 
    getCacheEntry, setCacheEntry, removeCacheEntry
  }
})
.simpleHandler('getCacheEntry', 'void', 'streamable')
.simpleHandler('setCacheEntry', 'streamable', 'void')
.simpleHandler('removeCacheEntry', 'void', 'void')
.inputHandler(cacheFileStatsHandler, 'getFileStats')

let diskCacheComponents = diskCacheStoreBundle
  .toHandlerComponents()

for(let key in diskCacheComponents) {
  diskCacheComponents[key].middleware(cachePathFilter)
}

let forkTable = {}

export let diskCacheFilter = makeCacheFilter(forkTable)
  .implement(diskCacheComponents)

export let diskCacheInvalidationFilter = 
  makeCacheInvalidationFilter(forkTable)
  .implement(diskCacheComponents)

export let makeDiskCacheFilter = diskCacheFilter.factory()

export let makeDiskCacheInvalidationFilter = 
  diskCacheInvalidationFilter.factory()

export let makeDiskCacheFilters = (forkTable={}) => ({
  cacheFilter: 
    makeDiskCacheFilter(forkTable),

  cacheInvalidationFilter: 
    makeDiskCacheInvalidationFilter(forkTable)
})