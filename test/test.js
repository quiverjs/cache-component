import 'traceur'

import { async } from 'quiver-promise'
import { 
  simpleHandler, simpleHandlerBuilder,
  handlerBundle
} from 'quiver-component'

import { makeMemoryCacheFilters } from '../lib/cache-component.js'

var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
var should = chai.should()
var expect = chai.expect

describe('cache filter test', () => {
  var getCacheId = simpleHandler(args => args.id, 'void', 'text')

  var counterBundle = handlerBundle(
  config => {
    var table = { }

    var increment = args => {
      var { id } = args

      var count = table[id] || 0
      count++

      table[id] = count
      return id + '-' + count
    }

    var reset = args => {
      var { id, count=0 } = args

      table[id] = count
    }

    return { 
      increment, reset
    }
  })
  .simpleHandler('increment', 'void', 'text')
  .simpleHandler('reset', 'void', 'void')

  var { increment, reset } = counterBundle.handlerComponents

  it('sanity test', async(function*() {
    var config = { }

    var counterHandler = yield increment.loadHandler(config)
    var resetHandler = yield reset.loadHandler(config)

    yield counterHandler({id: 'foo'})
      .should.eventually.equal('foo-1')

    yield counterHandler({id: 'foo'})
      .should.eventually.equal('foo-2')

    yield counterHandler({id: 'bar'})
      .should.eventually.equal('bar-1')

    yield resetHandler({
      id: 'foo',
      count: 5
    })

    yield counterHandler({id: 'foo'})
      .should.eventually.equal('foo-6')

    yield counterHandler({id: 'bar'})
      .should.eventually.equal('bar-2')
  }))

  it.only('memory cache test', async(function*() {
    var {
      cacheFilter, cacheInvalidationFilter 
    } = makeMemoryCacheFilters({getCacheId})

    var { increment, reset } = counterBundle.makePrivate()
      .handlerComponents

    increment.addMiddleware(cacheFilter)
    reset.addMiddleware(cacheInvalidationFilter)

    var config = { }

    var counterHandler = yield increment.loadHandler(config)
    var resetHandler = yield reset.loadHandler(config)

    yield counterHandler({id: 'foo'})
      .should.eventually.equal('foo-1')

    yield counterHandler({id: 'foo'})
      .should.eventually.equal('foo-1')

    yield counterHandler({id: 'bar'})
      .should.eventually.equal('bar-1')

    yield counterHandler({id: 'bar'})
      .should.eventually.equal('bar-1')

    yield resetHandler({
      id: 'foo',
      count: 5
    })

    yield counterHandler({id: 'foo'})
      .should.eventually.equal('foo-6')

    yield counterHandler({id: 'bar'})
      .should.eventually.equal('bar-1')
  }))
})