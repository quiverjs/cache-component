import { error } from 'quiver-core/error'
import { reject, resolve, async } from 'quiver-core/promise'
import { reuseStream, reuseStreamable } from 'quiver-core/stream-util'

import { 
  handleableBuilder, streamHandlerBuilder, handlerBundle 
} from 'quiver-core/component'

import {
  makeCacheFilter, makeCacheInvalidationFilter
} from './cache-filter.js'

var inMemoryStreamable = async(function*(streamable) {
  streamable = yield reuseStreamable(streamable)

  if(!streamable.offMemory) return streamable

  streamable.toStream = yield reuseStream(
    yield streamable.toStream()).toStream

  streamable.offMemory = false

  return streamable
})

export var memoryCacheStoreBundle = handlerBundle(
config => {
  var cacheStore = { }

  var getCacheEntry = args => {
    var { cacheId } = args

    if(cacheStore[cacheId]) {
      var streamable = cacheStore[cacheId]

      if(!streamable.isClosed) return streamable

      cacheStore[cacheId] = null
    }

    return reject(error(404, 'not found'))
  }

  var setCacheEntry = async(
  function*(args, streamable) {
    var { cacheId } = args

    streamable = yield inMemoryStreamable(streamable)
    cacheStore[cacheId] = streamable
  })

  var removeCacheEntry = args => {
    var { cacheId } = args

    cacheStore[cacheId] = null
  }

  return { 
    getCacheEntry, setCacheEntry, removeCacheEntry
  }
})
.simpleHandler('getCacheEntry', 'void', 'streamable')
.simpleHandler('setCacheEntry', 'streamable', 'void')
.simpleHandler('removeCacheEntry', 'void', 'void')

var memoryCacheComponents = memoryCacheStoreBundle
  .toHandlerComponents()

var forkTable = {}

export var memoryCacheFilter = makeCacheFilter(forkTable)
  .implement(memoryCacheComponents)

export var memoryCacheInvalidationFilter = 
  makeCacheInvalidationFilter(forkTable)
  .implement(memoryCacheComponents)

export var makeMemoryCacheStoreBundle = 
  memoryCacheStoreBundle.factory()

export var makeMemoryCacheFilter = memoryCacheFilter.factory()

export var makeMemoryCacheInvalidationFilter = 
  memoryCacheInvalidationFilter.factory()

export var makeMemoryCacheFilters = (forkTable={}) => ({
  cacheFilter: 
    makeMemoryCacheFilter(forkTable),
    
  cacheInvalidationFilter: 
    makeMemoryCacheInvalidationFilter(forkTable)
})