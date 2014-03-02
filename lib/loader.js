'use strict'

var error = require('quiver-error').error
var configLib = require('quiver-config')
var simpleHandlerLib = require('quiver-simple-handler')

var getCacheIdHandler = function(config, handleable, callback) {
  if(config.cacheIdExtractor) {
    callback(null, config.cacheIdExtractor)
  
  } else if(config.cacheIdHandlerName) {
    configLib.loadSimpleHandler(config, 
      config.cacheIdHandlerName, 'void', 'text', callback)
  
  } else if(handleable.toCacheIdHandler) {
    callback(null, simpleHandlerLib.streamHandlerToSimpleHandler(
      'void', 'text', handleable.toCacheIdHandler()))
  
  } else {
    callback(error(400, 'no cache id handler available'))
  }
}

module.exports = {
  getCacheIdHandler: getCacheIdHandler
}