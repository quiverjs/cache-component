import { error } from 'quiver-error'
import { promisify, async, reject } from 'quiver-promise'

import { 
  streamableToBuffer, 
  bufferToStreamable 
} from 'quiver-stream-util'

import {
  handlerBundle
} from 'quiver-component'

import { 
  abstractCacheFilter, 
  abstractCacheInvalidationFilter 
} from './cache-filter.js'

import Memcached from 'memcached'

var promisifyMethod = (object, method) =>
  promisify((...args) =>
    object[method](...args))

var promisifyMethods = (object, methods) =>
  methods.reduce((result, method) => {
    result[method] = promisifyMethod(object, method)
    return result
  }, { })

export var createMemcached = (servers, options) => {
  var memcached = new Memcached(
    servers, options)

  return promisifyMethods(memcached, 
    ['get', 'set', 'replace', 'del'])
}

export var memcachedStoreBundle = handlerBundle(
config => {
  var { 
    memcachedServers, memcachedOptions,
    cacheExpiry=300
  } = config

  var memcached = createMemcached(
    memcachedServers, memcachedOptions)

  var getCacheEntry = args => {
    var { cacheId } = args

    return memcached.get(cacheId).then(
      data => {
        return data ?
          bufferToStreamable(data) :
          reject(error(404, 'not found'))
      })
  }

  var setCacheEntry = async(function*(args, streamable) {
    var { cacheId } = args

    var buffer = yield streamableToBuffer(streamable)

    yield memcached.set(cacheId, buffer, cacheExpiry)
  })

  var removeCacheEntry = args => {
    var { cacheId } = args

    return memcached.del(cacheId)
  }

  return { 
    getCacheEntry, setCacheEntry, removeCacheEntry
  }
})
.simpleHandler('getCacheEntry', 'void', 'streamable')
.simpleHandler('setCacheEntry', 'streamable', 'void')
.simpleHandler('removeCacheEntry', 'void', 'void')

var cacheComponents = memcachedStoreBundle.handlerComponents

export var abstractMemcachedCacheFilter = abstractCacheFilter
  .implement(cacheComponents)

export var abstractMemcachedCacheInvalidationFilter =
  abstractCacheInvalidationFilter
  .implement(cacheComponents)

export var makeMemcachedFilters = (implMap) => {
  var privateTable = { }

  return {
    cacheFilter: 
      abstractMemcachedCacheFilter
        .implement(implMap, privateTable)
        .concretize(), 
        
    cacheInvalidationFilter:
      abstractMemcachedCacheInvalidationFilter
        .implement(implMap, privateTable)
        .concretize()
  }
}