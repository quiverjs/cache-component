import { promisify, async } from 'quiver-promise'
import { streamableToBuffer } from 'quiver-stream-util'

import {
  handlerBundle
} from 'quiver-component'

import { 
  abstractCacheFilter, 
  abstractCacheInvalidationFilter 
} from './cache-filter.js'

var Memcached = require('memcached')

var promisifyMethod = (object, method) =>
  promisify((...args) =>
    object[method](...args))

var promisifyMethods = (object, methods) =>
  methods.reduce((result, method) => {
    result[method] = promisifyMethod(object, method)
    return result
  }, { })

var createMemcached = (servers, options) => {
  var memcached = new Memcached(
    memcachedServers, memcachedOptions)

  return promisifyMethods(memcached, 
    ['get', 'set', 'replace'])
}

export var memcachedStoreBundle = handlerBundle(
config => {
  var { 
    memcachedServers, memcachedOptions
  } = config

  var memcached = createMemcached(
    memcachedServers, memcachedOptions)

  var getCacheEntry = args => {
    var { cacheId } = args

    return memcached.get(cacheId).then(
      data => data[cacheId],
      err => reject(error(404, 'not found')))
  }

  var setCacheEntry = async(function*(args, streamable) {
    var { cacheId } = args

    var buffer = yield streamableToBuffer(streamable)

    yield memcached.set(cacheId, buffer)
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

export var makeMemcachedCacheFilters = (implMap) => {
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