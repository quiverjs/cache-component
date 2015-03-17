import { pipeStream } from 'quiver-core/stream-util'
import { fileStatsHandler } from 'quiver-file-component'
import { async, promisify, reject } from 'quiver-core/promise'
import { fileStreamable, fileWriteStream } from 'quiver-core/file-stream'

import pathLib from 'path'
const { join: joinPath } = pathLib

import fs from 'fs'
const { rename, symlink, unlink } = fs

import { 
  makeCacheFilter, makeCacheInvalidationFilter
} from './cache-filter.js'

import {
  handlerBundle,
  argsBuilderFilter,
  configAliasMiddleware,
  inputHandlerMiddleware
} from 'quiver-core/component'

const moveFile = promisify(rename)
const linkFile = promisify(symlink)
const removeFile = promisify(unlink)

const cacheFileStatsHandler = fileStatsHandler()
  .configAlias({
    dirPath: 'cacheDir'
  })

const cachePathFilter = argsBuilderFilter(
config => {
  const { cacheDir } = config

  return args => {
    const cacheId = args.cacheId
    args.cachePath = joinPath(cacheDir, cacheId)
  }
})

export const diskCacheStoreBundle = handlerBundle(
config => {
  const { cacheDir, getFileStats } = config

  const getCacheEntry = async(function*(args) {
    const { cacheId, cachePath } = args

    const fileStats = yield getFileStats({path: cacheId})

    const streamable = yield fileStreamable(cachePath, fileStats)
    streamable.reusable = false

    return streamable
  })

  const setCacheEntry = async(function*(args, streamable) {
    const { cachePath } = args

    if(streamable.toFilePath) {
      const filePath = yield streamable.toFilePath()

      if(streamable.tempFile) {
        yield moveFile(filePath, cachePath)
        return

      } else if(streamable.reusable) {
        yield linkFile(filePath, cachePath)
        return
      }
    }

    const readStream = yield streamable.toStream()
    const writeStream = yield fileWriteStream(cachePath)
    yield pipeStream(readStream, writeStream)
  })

  const removeCacheEntry = args => {
    const { cachePath } = args

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

const diskCacheComponents = diskCacheStoreBundle
  .toHandlerComponents()

for(let key in diskCacheComponents) {
  diskCacheComponents[key].middleware(cachePathFilter)
}

const forkTable = {}

export const diskCacheFilter = makeCacheFilter(forkTable)
  .implement(diskCacheComponents)

export const diskCacheInvalidationFilter = 
  makeCacheInvalidationFilter(forkTable)
  .implement(diskCacheComponents)

export const makeDiskCacheFilter = diskCacheFilter.factory()

export const makeDiskCacheInvalidationFilter = 
  diskCacheInvalidationFilter.factory()

export const makeDiskCacheFilters = (forkTable={}) => ({
  cacheFilter: 
    makeDiskCacheFilter(forkTable),

  cacheInvalidationFilter: 
    makeDiskCacheInvalidationFilter(forkTable)
})