import { error } from 'quiver-error'
import { reject, resolve, async } from 'quiver-promise'
import { simpleToStreamHandler } from 'quiver-simple-handler'
import { reuseStream, reuseStreamable } from 'quiver-stream-util'

import { 
  handleableBuilder, streamHandlerBuilder,
  partialImplement, handlerBundle 
} from 'quiver-component'

import { abstractCacheFilter } from './cache-filter.js'

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

  var getCacheEntry = function(args) {
    var { cacheId } = args

    if(cacheStore[cacheId])
      return cacheStore[cacheId]

    return reject(error(404, 'not found'))
  }

  var setCacheEntry = async(
  function*(args, streamable) {
    var {cacheId} = args

    streamable = yield inMemoryStreamable(streamable)
    cacheStore[cacheId] = streamable
  })

  return { getCacheEntry, setCacheEntry }
})
.simpleHandler('getCacheEntry', 'void', 'streamable')
.simpleHandler('setCacheEntry', 'streamable', 'void')

var { getCacheEntry, setCacheEntry } = 
  memoryCacheStoreBundle.handlerComponents

export { getCacheEntry, setCacheEntry }

export var abstractMemoryCacheFilter = partialImplement(
  abstractCacheFilter, { getCacheEntry, setCacheEntry })