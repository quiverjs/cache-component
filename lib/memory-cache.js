import { error } from 'quiver-error'
import { reject, resolve, async } from 'quiver-promise'
import { simpleToStreamHandler } from 'quiver-simple-handler'
import { reuseStream, reuseStreamable } from 'quiver-stream-util'

import { 
  handleableBuilder, streamHandlerBuilder,
  partialImplement, inputHandlerMiddleware 
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

export var memoryCacheStore = handleableBuilder(
config => {
  var cacheStore = { }

  var getCacheEntry = simpleToStreamHandler(
  async(function*(args) {
    var { cacheId } = args

    if(cacheStore[cacheId])
      return cacheStore[cacheId]

    throw error(404, 'not found')
  }), 'void', 'streamable')

  var setCacheEntry = simpleToStreamHandler(
  async(function*(args, streamable) {
    var {cacheId} = args

    streamable = yield inMemoryStreamable(streamable)
    cacheStore[cacheId] = streamable

  }), 'streamable', 'void')

  return { getCacheEntry, setCacheEntry }
})

export var getCacheEntry = streamHandlerBuilder(
config => {
  return config.memoryCacheStore.getCacheEntry
})
.addMiddleware(inputHandlerMiddleware(
  memoryCacheStore, 'memoryCacheStore'))

export var setCacheEntry = streamHandlerBuilder(
config => {
  return config.memoryCacheStore.setCacheEntry
})
.addMiddleware(inputHandlerMiddleware(
  memoryCacheStore, 'memoryCacheStore'))

export var abstractMemoryCacheFilter = partialImplement(
  abstractCacheFilter, { getCacheEntry, setCacheEntry })