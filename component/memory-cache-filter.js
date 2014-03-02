'use strict'

var error = require('quiver-error').error
var configLib = require('quiver-config')
var copyObject = require('quiver-copy').copyObject
var handleableLib = require('quiver-handleable')
var streamConvert = require('quiver-stream-convert')

var loader = require('../lib/loader')

var memoryCacheFilter = function(config, handleable, callback) {
  var cacheExpiry = config.cacheExpiry
  var optionalCache = config.optionalCache

  if(!handleable.toStreamHandler) return callback(error(400,
    'handleable is not of type stream handler'))

  var handler = handleable.toStreamHandler()

  var cacheMap = { }

  var setCacheExpire = function(cacheId) {
    if(!cacheExpiry) return

    setTimeout(function() {
      cacheMap[cacheId] = null
    }, cacheExpiry)
  }

  loader.getCacheIdHandler(config, handleable, function(err, cacheIdHandler) {
    if(err) return callback(err)

    var filteredStreamHandler = function(args, inputStreamable, callback) {
      cacheIdHandler(copyObject(args), function(err, cacheId) {
        if(err && optionalCache) return handler(args, inputStreamable, callback)
        if(err) return callback(err)
        
        if(cacheMap[cacheId]) return callback(null, cacheMap[cacheId])

        handler(args, inputStreamable, function(err, resultStreamable) {
          if(err) return callback(err)
          
          streamConvert.createReusableStreamable(resultStreamable,
          function(err, resultStreamable) {
            if(err) return callback(err)
            
            cacheMap[cacheId] = resultStreamable
            setCacheExpire(cacheId)

            callback(null, resultStreamable)
          })
        })
      })
    }

    var filteredHandleable = {
      toStreamHandler: function() {
        return filteredStreamHandler
      }
    }

    filteredHandleable = handleableLib.extendHandleable(
      handleable, filteredHandleable)

    callback(null, filteredHandleable)
  })
}

var quiverComponents = [
  {
    name: 'quiver memory cache filter',
    type: 'handleable filter',
    filter: memoryCacheFilter
  }
]

module.exports = {
  quiverComponents: quiverComponents
}