'use strict'

var async = require('async')
var should = require('should')
var copyObject = require('quiver-copy').copyObject
var moduleLib = require('quiver-module')
var configLib = require('quiver-config')
var componentLib = require('quiver-component')
var simpleHandlerLib = require('quiver-simple-handler')

var cacheComponent = require('../lib/cache-component')

var quiverComponents = moduleLib.loadComponentsFromQuiverModule(
  cacheComponent.quiverModule)

var testHandleableBuilder = function(config, callback) {
  var counter = 0
  var resultTable = { }

  var testHandler = function(args, callback) {
    var itemId = args.itemId

    resultTable[itemId] = counter++
    callback(null, ''+resultTable[itemId])
  }

  var cacheIdHandler = function(args, callback) {
    callback(null, args.itemId)
  }

  var handleable = {
    toStreamHandler: function() {
      return simpleHandlerLib.simpleHandlerToStreamHandler(
        'void', 'text', testHandler)
    },
    toCacheIdHandler: function() {
      return simpleHandlerLib.simpleHandlerToStreamHandler(
        'void', 'text', cacheIdHandler)
    }
  }

  callback(null, handleable)
}

quiverComponents.push({
  name: 'test handler',
  type: 'handleable',
  middlewares: [
    'quiver memory cache filter'
  ],
  handlerBuilder: testHandleableBuilder
})

describe('cache component test', function() {
  var componentConfig

  before(function(callback) {
    componentLib.installComponents(quiverComponents, function(err, config) {
      if(err) return callback(err)

      componentConfig = config
      callback()
    })
  })

  it('memory cache filter test', function(callback) {
    var config = copyObject(componentConfig)

    configLib.loadSimpleHandler(config, 'test handler', 'void', 'json',
    function(err, handler) {
      if(err) return callback(err)
      
      var testResult = function(itemId, expected) {
        return function(callback) {
          handler({ itemId: itemId }, function(err, result) {
            if(err) return callback(err)
            
            should.equal(result, expected)
            callback()
          })
        }
      }

      async.series([
        testResult('foo', '0'),
        testResult('foo', '0'),
        testResult('bar', '1'),
        testResult('foo', '0'),
        testResult('baz', '2'),
        testResult('bar', '1'),
      ], callback)
    })
  })
})