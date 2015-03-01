import { copy } from 'quiver-core/object'
import { async } from 'quiver-core/promise'
import { reuseStreamable } from 'quiver-core/stream-util'

import { 
  abstractHandler, streamFilter, 
  argsBuilderFilter, simpleHandlerLoader
} from 'quiver-core/component'

let getCacheId = abstractHandler('getCacheId')
  .setLoader(simpleHandlerLoader('void', 'text'))

let getCacheEntry = abstractHandler('getCacheEntry')
  .setLoader(simpleHandlerLoader('void', 'streamable'))

let setCacheEntry = abstractHandler('setCacheEntry')
  .setLoader(simpleHandlerLoader('streamable', 'void'))

let removeCacheEntry = abstractHandler('removeCacheEntry')
  .setLoader(simpleHandlerLoader('void', 'void'))

let _cacheId = Symbol('cacheId')

let cacheIdFilter = argsBuilderFilter(
config => {
  let { getCacheId } = config

  return async(function*(args) {
    args[_cacheId] = yield getCacheId(copy(args))

    return args
  })
})
.inputHandlers({ getCacheId })

export let cacheFilter = streamFilter(
(config, handler) => {
  let {
    getCacheId, getCacheEntry, setCacheEntry
  } = config

  return async(function*(args, inputStreamable) {
    let cacheId = args[_cacheId]

    try {
      let cachedResult = yield getCacheEntry({cacheId})
      return cachedResult

    } catch(err) {
      if(err.errorCode != 404) throw err
    }

    let resultStreamable = yield handler(args, inputStreamable) 
    resultStreamable = yield reuseStreamable(resultStreamable)

    try {
      yield setCacheEntry({cacheId}, resultStreamable)
    } catch(err) {
      // ignore
    }
    
    return resultStreamable
  })
})
.middleware(cacheIdFilter)
.inputHandlers({
  getCacheEntry, setCacheEntry
})

export let cacheInvalidationFilter = argsBuilderFilter(
(config) => {
  let { removeCacheEntry } = config

  return async(function*(args) {
    let cacheId = args[_cacheId]

    yield removeCacheEntry({ cacheId })

    args[_cacheId] = null

    return args
  })
})
.middleware(cacheIdFilter)
.inputHandlers({ removeCacheEntry })

export let makeCacheFilter = cacheFilter.factory()

export let makeCacheInvalidationFilter = 
  cacheInvalidationFilter.factory()

export let makeCacheFilters = (forkTable={}) => ({
  cacheFilter: 
    makeCacheFilter(forkTable),

  cacheInvalidationFilter: 
    makeCacheInvalidationFilter(forkTable)
})