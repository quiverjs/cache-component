import { error } from 'quiver-core/error'
import { reject, resolve, async } from 'quiver-core/promise'
import { reuseStream, reuseStreamable } from 'quiver-core/stream-util'

import { 
  handleableBuilder, streamHandlerBuilder, handlerBundle 
} from 'quiver-core/component'

import {
  makeCacheFilter, makeCacheInvalidationFilter
} from './cache-filter.js'

let inMemoryStreamable = async(function*(streamable) {
  streamable = yield reuseStreamable(streamable)

  if(!streamable.offMemory) return streamable

  streamable.toStream = yield reuseStream(
    yield streamable.toStream()).toStream

  streamable.offMemory = false

  return streamable
})

export let memoryCacheStoreBundle = handlerBundle(
config => {
  let cacheStore = { }

  let getCacheEntry = args => {
    let { cacheId } = args

    if(cacheStore[cacheId]) {
      let streamable = cacheStore[cacheId]

      if(!streamable.isClosed) return streamable

      cacheStore[cacheId] = null
    }

    return reject(error(404, 'not found'))
  }

  let setCacheEntry = async(
  function*(args, streamable) {
    let { cacheId } = args

    streamable = yield inMemoryStreamable(streamable)
    cacheStore[cacheId] = streamable
  })

  let removeCacheEntry = args => {
    let { cacheId } = args

    cacheStore[cacheId] = null
  }

  return { 
    getCacheEntry, setCacheEntry, removeCacheEntry
  }
})
.simpleHandler('getCacheEntry', 'void', 'streamable')
.simpleHandler('setCacheEntry', 'streamable', 'void')
.simpleHandler('removeCacheEntry', 'void', 'void')

let memoryCacheComponents = memoryCacheStoreBundle
  .toHandlerComponents()

let forkTable = {}

export let memoryCacheFilter = makeCacheFilter(forkTable)
  .implement(memoryCacheComponents)

export let memoryCacheInvalidationFilter = 
  makeCacheInvalidationFilter(forkTable)
  .implement(memoryCacheComponents)

export let makeMemoryCacheStoreBundle = 
  memoryCacheStoreBundle.factory()

export let makeMemoryCacheFilter = memoryCacheFilter.factory()

export let makeMemoryCacheInvalidationFilter = 
  memoryCacheInvalidationFilter.factory()

export let makeMemoryCacheFilters = (forkTable={}) => ({
  cacheFilter: 
    makeMemoryCacheFilter(forkTable),
    
  cacheInvalidationFilter: 
    makeMemoryCacheInvalidationFilter(forkTable)
})