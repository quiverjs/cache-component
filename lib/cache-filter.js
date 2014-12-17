import { copy } from 'quiver-object'
import { async } from 'quiver-promise'
import { reuseStreamable } from 'quiver-stream-util'

import { 
  abstractHandler, streamFilter, 
  argsBuilderFilter, simpleHandlerLoader
} from 'quiver-component'

var getCacheId = abstractHandler('getCacheId')
  .setLoader(simpleHandlerLoader('void', 'text'))

var getCacheEntry = abstractHandler('getCacheEntry')
  .setLoader(simpleHandlerLoader('void', 'streamable'))

var setCacheEntry = abstractHandler('setCacheEntry')
  .setLoader(simpleHandlerLoader('streamable', 'void'))

var removeCacheEntry = abstractHandler('removeCacheEntry')
  .setLoader(simpleHandlerLoader('void', 'void'))

var _cacheId = Symbol('cacheId')

var cacheIdFilter = argsBuilderFilter(
config => {
  var { getCacheId } = config

  return async(function*(args) {
    args[_cacheId] = yield getCacheId(copy(args))

    return args
  })
})
.inputHandlers({ getCacheId })

export var cacheFilter = streamFilter(
(config, handler) => {
  var {
    getCacheId, getCacheEntry, setCacheEntry
  } = config

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
      yield setCacheEntry({cacheId}, resultStreamable)
    } catch(err) {
      console.log('set cache error:', err)
      // ignore
    }
    
    return resultStreamable
  })
})
.middleware(cacheIdFilter)
.inputHandlers({
  getCacheEntry, setCacheEntry
})

export var cacheInvalidationFilter = argsBuilderFilter(
(config) => {
  var { removeCacheEntry } = config

  return async(function*(args) {
    var cacheId = args[_cacheId]

    yield removeCacheEntry({ cacheId })

    args[_cacheId] = null

    return args
  })
})
.middleware(cacheIdFilter)
.inputHandlers({ removeCacheEntry })

export var makeCacheFilter = cacheFilter.factory()

export var makeCacheInvalidationFilter = 
  cacheInvalidationFilter.factory()

export var makeCacheFilters = (forkTable={}) => ({
  cacheFilter: 
    makeCacheFilter(forkTable),

  cacheInvalidationFilter: 
    makeCacheInvalidationFilter(forkTable)
})