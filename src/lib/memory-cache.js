import { error } from 'quiver/error'
import { reject, resolve, async } from 'quiver/promise'
import { reuseStream, reuseStreamable } from 'quiver/stream-util'

import { 
  handleableBuilder, streamHandlerBuilder, handlerBundle 
} from 'quiver/component'

import {
  makeCacheFilter, makeCacheInvalidationFilter
} from './cache-filter.js'

const inMemoryStreamable = async(function*(streamable) {
  streamable = yield reuseStreamable(streamable)

  if(!streamable.offMemory) return streamable

  streamable.toStream = yield reuseStream(
    yield streamable.toStream()).toStream

  streamable.offMemory = false

  return streamable
})

export const memoryCacheStoreBundle = handlerBundle(
config => {
  const cacheStore = { }

  const getCacheEntry = args => {
    const { cacheId } = args

    if(cacheStore[cacheId]) {
      const streamable = cacheStore[cacheId]

      if(!streamable.isClosed) return streamable

      cacheStore[cacheId] = null
    }

    return reject(error(404, 'not found'))
  }

  const setCacheEntry = async(
  function*(args, streamable) {
    const { cacheId } = args

    streamable = yield inMemoryStreamable(streamable)
    cacheStore[cacheId] = streamable
  })

  const removeCacheEntry = args => {
    const { cacheId } = args

    cacheStore[cacheId] = null
  }

  return { 
    getCacheEntry, setCacheEntry, removeCacheEntry
  }
})
.simpleHandler('getCacheEntry', 'void', 'streamable')
.simpleHandler('setCacheEntry', 'streamable', 'void')
.simpleHandler('removeCacheEntry', 'void', 'void')

const memoryCacheComponents = memoryCacheStoreBundle
  .toHandlerComponents()

const forkTable = {}

export const memoryCacheFilter = makeCacheFilter(forkTable)
  .implement(memoryCacheComponents)

export const memoryCacheInvalidationFilter = 
  makeCacheInvalidationFilter(forkTable)
  .implement(memoryCacheComponents)

export const makeMemoryCacheStoreBundle = 
  memoryCacheStoreBundle.factory()

export const makeMemoryCacheFilter = memoryCacheFilter.factory()

export const makeMemoryCacheInvalidationFilter = 
  memoryCacheInvalidationFilter.factory()

export const makeMemoryCacheFilters = (forkTable={}) => ({
  cacheFilter: 
    makeMemoryCacheFilter(forkTable),
    
  cacheInvalidationFilter: 
    makeMemoryCacheInvalidationFilter(forkTable)
})