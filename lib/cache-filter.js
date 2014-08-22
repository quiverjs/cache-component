import { copy } from 'quiver-object'
import { async } from 'quiver-promise'
import { reuseStreamable } from 'quiver-stream-util'

import { 
  abstractComponent, protocol,
  streamFilter, argsBuilderFilter
} from 'quiver-component'

var cacheIdProtocol = protocol('cache id protocol')
  .simpleHandler('getCacheId', 'void', 'text')

export var cacheStoreProtocol = protocol('cacheProtocol')
  .subprotocol(cacheIdProtocol)
  .simpleHandler('getCacheEntry', 'void', 'streamable')
  .simpleHandler('setCacheEntry', 'streamable', 'void')
  .simpleHandler('removeCacheEntry', 'void', 'void')

var _cacheId = Symbol('cacheId')

var cacheIdFilter = argsBuilderFilter(
config => {
  var { cacheProtocol } = config
  var { getCacheId } = cacheProtocol

  return async(function*(args) {
    args[_cacheId] = yield getCacheId(copy(args))

    return args
  })
})

var cacheFilter = streamFilter(
(config, handler) => {
  var { cacheProtocol } = config

  var {
    getCacheId, getCacheEntry, setCacheEntry
  } = cacheProtocol

  return async(function*(args, inputStreamable) {
    var cacheId = args[_cacheId]

    try {
      var cachedResult = yield getCacheEntry({cacheId})
      return cachedResult

    } catch(err) {
      if(err.errorCode != 404) throw err
    }

    var resultStreamable = yield handler(args, inputStreamable) 
    resultStreamable = yield reuseStreamable(resultStreamable)

    try {
      setCacheEntry({cacheId}, resultStreamable)
    } catch(err) {
      // ignore
    }
    
    return resultStreamable
  })
})
.addMiddleware(cacheIdFilter)

var cacheInvalidationFilter = argsBuilderFilter(
(config) => {
  var { cacheProtocol } = config
  var { removeCacheEntry } = cacheProtocol

  return async(function*(args) {
    var cacheId = args[_cacheId]

    yield removeCacheEntry({ cacheId })

    args[_cacheId] = null

    return args
  })
})
.addMiddleware(cacheIdFilter)

export var abstractCacheFilter = abstractComponent(
  'cacheProtocol', 
  cacheStoreProtocol,
  cacheFilter)

export var abstractCacheInvalidationFilter = abstractComponent(
  'cacheProtocol', cacheStoreProtocol,
  cacheInvalidationFilter)