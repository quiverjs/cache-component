import 'traceur'

import { async } from 'quiver-promise'
import { simpleHandler, simpleHandlerBuilder } from 'quiver-component'

import { abstractMemoryCacheFilter } from '../lib/cache-component.js'

var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
var should = chai.should()
var expect = chai.expect

describe('cache filter test', () => {
  var getCacheId = simpleHandler(args => args.id, 'void', 'text')

  var counter = simpleHandlerBuilder(
  config => {
    var table = { }

    return args => {
      var { id } = args

      var count = table[id] || 0
      count++

      table[id] = count
      return id + '-' + count
    }
  }, 'void', 'text')

  it('sanity test', async(function*() {
    var handler = yield counter.loadHandler({})

    yield handler({id: 'foo'})
      .should.eventually.equal('foo-1')

    yield handler({id: 'foo'})
      .should.eventually.equal('foo-2')

    yield handler({id: 'bar'})
      .should.eventually.equal('bar-1')
  }))

  it('memory cache test', async(function*() {
    var cacheFilter = abstractMemoryCacheFilter({getCacheId})

    var cachedCounter = counter.makePrivate()
      .addMiddleware(cacheFilter)

    var handler = yield cachedCounter.loadHandler({})

    yield handler({id: 'foo'})
      .should.eventually.equal('foo-1')

    yield handler({id: 'foo'})
      .should.eventually.equal('foo-1')

    yield handler({id: 'bar'})
      .should.eventually.equal('bar-1')

    yield handler({id: 'bar'})
      .should.eventually.equal('bar-1')
  }))
})