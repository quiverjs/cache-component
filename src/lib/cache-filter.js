import { copy } from 'quiver/object'
import { async } from 'quiver/promise'
import { reuseStreamable } from 'quiver/stream-util'

import { 
  abstractHandler, streamFilter, 
  argsBuilderFilter, simpleHandlerLoader
} from 'quiver/component'

const getCacheId = abstractHandler('getCacheId')
  .setLoader(simpleHandlerLoader('void', 'text'))

const getCacheEntry = abstractHandler('getCacheEntry')
  .setLoader(simpleHandlerLoader('void', 'streamable'))

const setCacheEntry = abstractHandler('setCacheEntry')
  .setLoader(simpleHandlerLoader('streamable', 'void'))

const removeCacheEntry = abstractHandler('removeCacheEntry')
  .setLoader(simpleHandlerLoader('void', 'void'))

const _cacheId = Symbol('cacheId')

const cacheIdFilter = argsBuilderFilter(
config => {
  const { getCacheId } = config

  return async(function*(args) {
    args[_cacheId] = yield getCacheId(copy(args))

    return args
  })
})
.inputHandlers({ getCacheId })

export const cacheFilter = streamFilter(
(config, handler) => {
  const {
    getCacheId, getCacheEntry, setCacheEntry
  } = config

  return async(function*(args, inputStreamable) {
    const cacheId = args[_cacheId]

    try {
      const cachedResult = yield getCacheEntry({cacheId})
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

export const cacheInvalidationFilter = argsBuilderFilter(
(config) => {
  const { removeCacheEntry } = config

  return async(function*(args) {
    const cacheId = args[_cacheId]

    yield removeCacheEntry({ cacheId })

    args[_cacheId] = null

    return args
  })
})
.middleware(cacheIdFilter)
.inputHandlers({ removeCacheEntry })

export const makeCacheFilter = cacheFilter.factory()

export const makeCacheInvalidationFilter = 
  cacheInvalidationFilter.factory()

export const makeCacheFilters = (forkTable={}) => ({
  cacheFilter: 
    makeCacheFilter(forkTable),

  cacheInvalidationFilter: 
    makeCacheInvalidationFilter(forkTable)
})