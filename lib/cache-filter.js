import { copy } from 'quiver-object'
import { async } from 'quiver-promise'
import { reuseStreamable } from 'quiver-stream-util'
import { 
  abstractComponent, streamFilter, protocol 
} from 'quiver-component'

var cacheProtocol = protocol('cacheProtocol')
  .simpleHandler('getCacheId', 'void', 'text')
  .simpleHandler('getCacheEntry', 'void', 'streamable')
  .simpleHandler('setCacheEntry', 'streamable', 'void')

export var abstractCacheFilter = abstractComponent(
'cacheProtocol', cacheProtocol,
streamFilter((config, handler) => {
  var { cacheProtocol } = config

  var {
    getCacheId, getCacheEntry, setCacheEntry
  } = cacheProtocol

  return async(function*(args, inputStreamable) {
    try {
      var cacheId = yield getCacheId(copy(args))

    } catch(err) {
      return handler(args, inputStreamable)
    }

    try {
      var cachedResult = yield getCacheEntry({cacheId})
      return cachedResult

    } catch(err) {
      if(err.errorCode != 404) {
        return handler(args, inputStreamable)
      }
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
}, {
  name: 'Quiver Cache Filter'
}))