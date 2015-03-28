import { error } from 'quiver/error'
import { promisify, async, reject } from 'quiver/promise'

import { 
  streamableToBuffer, 
  bufferToStreamable 
} from 'quiver/stream-util'

import {
  handlerBundle
} from 'quiver/component'

import { 
  makeCacheFilter, makeCacheInvalidationFilter
} from './cache-filter.js'

import Memcached from 'memcached'

const promisifyMethod = (object, method) =>
  promisify((...args) =>
    object[method](...args))

const promisifyMethods = (object, methods) =>
  methods.reduce((result, method) => {
    result[method] = promisifyMethod(object, method)
    return result
  }, { })

export const createMemcached = (servers, options) => {
  const memcached = new Memcached(
    servers, options)

  return promisifyMethods(memcached, 
    ['get', 'set', 'replace', 'del'])
}

export const memcachedStoreBundle = handlerBundle(
config => {
  const { 
    memcachedServers, memcachedOptions,
    cacheExpiry=300
  } = config

  const memcached = createMemcached(
    memcachedServers, memcachedOptions)

  const getCacheEntry = args => {
    const { cacheId } = args

    return memcached.get(cacheId).then(
      data => {
        return data ?
          bufferToStreamable(data) :
          reject(error(404, 'not found'))
      })
  }

  const setCacheEntry = async(function*(args, streamable) {
    const { cacheId } = args

    const buffer = yield streamableToBuffer(streamable)

    yield memcached.set(cacheId, buffer, cacheExpiry)
  })

  const removeCacheEntry = args => {
    const { cacheId } = args

    return memcached.del(cacheId)
  }

  return { 
    getCacheEntry, setCacheEntry, removeCacheEntry
  }
})
.simpleHandler('getCacheEntry', 'void', 'streamable')
.simpleHandler('setCacheEntry', 'streamable', 'void')
.simpleHandler('removeCacheEntry', 'void', 'void')

const memcachedComponents = memcachedStoreBundle
  .toHandlerComponents()

const forkTable = {}

export const memcachedFilter = 
  makeCacheFilter(forkTable)
  .implement(memcachedComponents)

export const memcachedInvalidationFilter =
  makeCacheInvalidationFilter(forkTable)
  .implement(memcachedComponents)

export const makeMemcachedFilter = memcachedFilter.factory()

export const makeMemcachedInvalidationFilter =
  memcachedInvalidationFilter.factory()

export const makeMemcachedFilters = (forkTable={}) => ({
  cacheFilter: 
    makeMemcachedFilter(forkTable),
    
  cacheInvalidationFilter: 
    makeMemcachedInvalidationFilter(forkTable)
})