import { error } from 'quiver-error'
import { reject, resolve, async } from 'quiver-promise'
import { simpleToStreamHandler } from 'quiver-simple-handler'
import { reuseStream, reuseStreamable } from 'quiver-stream-util'

import { 
  handleableBuilder, streamHandlerBuilder, handlerBundle 
} from 'quiver-component'

import { 
  abstractCacheFilter, 
  abstractCacheInvalidationFilter 
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

var cacheComponents = memoryCacheStoreBundle.handlerComponents

var abstractMemoryCacheFilter = 
  abstractCacheFilter
  .implement(cacheComponents)

var abstractMemoryCacheInvalidationFilter =
  abstractCacheInvalidationFilter
  .implement(cacheComponents)

export var makeMemoryCacheFilters = (implMap) => {
  var privateTable = { }

  return {
    cacheFilter: 
      abstractMemoryCacheFilter
        .implement(implMap, privateTable)
        .concretize(), 
        
    cacheInvalidationFilter:
      abstractMemoryCacheInvalidationFilter
        .implement(implMap, privateTable)
        .concretize()
  }
}