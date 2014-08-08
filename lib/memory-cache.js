import { error } from 'quiver-error'
import { reject, resolve, async } from 'quiver-promise'
import { simpleToStreamHandler } from 'quiver-simple-handler'
import { reuseStream, reuseStreamable } from 'quiver-stream-util'

import { 
  handleableBuilder, streamHandlerBuilder,
  partialImplement, handlerBundle 
} from 'quiver-component'

import { makeCacheFilters } from './cache-filter.js'

var inMemoryStreamable = async(function*(streamable) {
  streamable = yield reuseStreamable(streamable)

  if(!streamable.offMemory) return streamable

  var newStreamable = yield reuseStream(
    yield streamable.toStream())

  streamable.toStream = newStreamable.toStream
  streamable.offMemory = false

  return streamable
})

export var memoryCacheStoreBundle = handlerBundle(
config => {
  var cacheStore = { }

  var getCacheEntry = args => {
    var { cacheId } = args

    if(cacheStore[cacheId])
      return cacheStore[cacheId]

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

var { 
  getCacheEntry, setCacheEntry, removeCacheEntry
} = memoryCacheStoreBundle.handlerComponents

export { 
  getCacheEntry, setCacheEntry, removeCacheEntry
}

export var makeMemoryCacheFilters = partialImplement(
  makeCacheFilters, { 
    getCacheEntry, setCacheEntry, 
    removeCacheEntry 
  })