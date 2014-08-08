import { copy } from 'quiver-object'
import { async } from 'quiver-promise'
import { reuseStreamable } from 'quiver-stream-util'

import { 
  abstractComponent, protocol,
  streamFilter, argsBuilderFilter
} from 'quiver-component'

export var cacheStoreProtocol = protocol('cacheProtocol')
  .simpleHandler('getCacheId', 'void', 'text')
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

var makeCacheFilter = abstractComponent(
'cacheProtocol', cacheStoreProtocol,
streamFilter((config, handler) => {
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
.addMiddleware(cacheIdFilter))

var makeCacheInvalidationFilter = abstractComponent(
'cacheProtocol', cacheStoreProtocol,
argsBuilderFilter((config) => {
  var { cacheProtocol } = config
  var { removeCacheEntry } = cacheProtocol

  return async(function*(args) {
    var cacheId = args[_cacheId]

    yield removeCacheEntry({ cacheId })

    args[_cacheId] = null

    return args
  })
})
.addMiddleware(cacheIdFilter))

export var makeCacheFilters = (impl, privateTable={}) => {
  var cacheFilter = makeCacheFilter(impl, privateTable)

  var cacheInvalidationFilter = 
    makeCacheInvalidationFilter(impl, privateTable)

  return {
    cacheFilter,
    cacheInvalidationFilter
  }
}