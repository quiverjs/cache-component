import { error } from 'quiver-error'
import { reject, resolve } from 'quiver-promise'
import { simpleToStreamHandler } from 'quiver-simple-handler'
import { reuseStream, reuseStreamable } from 'quiver-stream-util'

import { 
  handleableBuilder, streamHandlerBuilder,
  partialImplement, inputHandlerMiddleware 
} from 'quiver-component'

import { abstractCacheFilter } from './cache-filter.js'

var inMemoryStreamable = streamable =>
  reuseStreamable(streamable).then(streamable => {
    if(!streamable.offMemory) return resolve(streamable)

    return streamable.toStream().then(reuseStream)
    .then(newStreamable => {
      streamable.toStream = newStreamable.toStream
      streamable.offMemory = false

      return streamable
    })
  })

export var memoryCacheStore = handleableBuilder(
config => {
  var { cacheExpiry, memoryLimit } = config

  var cacheStore = { }

  var getCacheEntry = simpleToStreamHandler(
  args => {
    var {cacheId, cacheTag} = args

    if(cacheStore[cacheId]) {
      return resolve(cacheStore[cacheId])
    }

    return reject(error(404, 'not found'))

  }, 'void', 'streamable')

  var setCacheEntry = simpleToStreamHandler(
  (args, streamable) => {
    var {cacheId} = args

    return inMemoryStreamable(streamable)
    .then(streamable => {
      cacheStore[cacheId] = streamable
    })

  }, 'streamable', 'void')

  return { getCacheEntry, setCacheEntry }
})

export var getCacheEntry = streamHandlerBuilder(
config => {
  return config.memoryCacheStore.getCacheEntry
})
.addMiddleware(inputHandlerMiddleware(memoryCacheStore, 'memoryCacheStore'))

export var setCacheEntry = streamHandlerBuilder(
config => {
  return config.memoryCacheStore.setCacheEntry
})
.addMiddleware(inputHandlerMiddleware(memoryCacheStore, 'memoryCacheStore'))

export var abstractMemoryCacheFilter = partialImplement(
  abstractCacheFilter, { getCacheEntry, setCacheEntry })