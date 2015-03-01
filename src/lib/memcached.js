import { error } from 'quiver-core/error'
import { promisify, async, reject } from 'quiver-core/promise'

import { 
  streamableToBuffer, 
  bufferToStreamable 
} from 'quiver-core/stream-util'

import {
  handlerBundle
} from 'quiver-core/component'

import { 
  makeCacheFilter, makeCacheInvalidationFilter
} from './cache-filter.js'

import Memcached from 'memcached'

let promisifyMethod = (object, method) =>
  promisify((...args) =>
    object[method](...args))

let promisifyMethods = (object, methods) =>
  methods.reduce((result, method) => {
    result[method] = promisifyMethod(object, method)
    return result
  }, { })

export let createMemcached = (servers, options) => {
  let memcached = new Memcached(
    servers, options)

  return promisifyMethods(memcached, 
    ['get', 'set', 'replace', 'del'])
}

export let memcachedStoreBundle = handlerBundle(
config => {
  let { 
    memcachedServers, memcachedOptions,
    cacheExpiry=300
  } = config

  let memcached = createMemcached(
    memcachedServers, memcachedOptions)

  let getCacheEntry = args => {
    let { cacheId } = args

    return memcached.get(cacheId).then(
      data => {
        return data ?
          bufferToStreamable(data) :
          reject(error(404, 'not found'))
      })
  }

  let setCacheEntry = async(function*(args, streamable) {
    let { cacheId } = args

    let buffer = yield streamableToBuffer(streamable)

    yield memcached.set(cacheId, buffer, cacheExpiry)
  })

  let removeCacheEntry = args => {
    let { cacheId } = args

    return memcached.del(cacheId)
  }

  return { 
    getCacheEntry, setCacheEntry, removeCacheEntry
  }
})
.simpleHandler('getCacheEntry', 'void', 'streamable')
.simpleHandler('setCacheEntry', 'streamable', 'void')
.simpleHandler('removeCacheEntry', 'void', 'void')

let memcachedComponents = memcachedStoreBundle
  .toHandlerComponents()

let forkTable = {}

export let memcachedFilter = 
  makeCacheFilter(forkTable)
  .implement(memcachedComponents)

export let memcachedInvalidationFilter =
  makeCacheInvalidationFilter(forkTable)
  .implement(memcachedComponents)

export let makeMemcachedFilter = memcachedFilter.factory()

export let makeMemcachedInvalidationFilter =
  memcachedInvalidationFilter.factory()

export let makeMemcachedFilters = (forkTable={}) => ({
  cacheFilter: 
    makeMemcachedFilter(forkTable),
    
  cacheInvalidationFilter: 
    makeMemcachedInvalidationFilter(forkTable)
})