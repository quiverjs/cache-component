import 'quiver-core/traceur'

import { async, timeout } from 'quiver-core/promise'
import { 
  simpleHandler, simpleHandlerBuilder,
  handlerBundle
} from 'quiver-core/component'

import childProcess from 'child_process'
var { spawn } = childProcess

import { 
  memoryCacheFilters, 
  memcachedFilters
} from '../lib/cache-component.js'

import { createMemcached } from '../lib/memcached.js'

var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
var should = chai.should()
var expect = chai.expect

var memcachedPort = '11212'

describe('cache filter test', () => {
  var getCacheId = simpleHandler(
    args => args.id, 'void', 'text')

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

  var { increment, reset } = counterBundle.toHandlerComponents()

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

  it('memory cache test', async(function*() {
    var {
      cacheFilter,
      cacheInvalidationFilter
    } = memoryCacheFilters()

    cacheFilter.implement({ getCacheId })
    cacheInvalidationFilter.implement({ getCacheId })

    var { increment, reset } = counterBundle.fork()
      .toHandlerComponents()

    increment.middleware(cacheFilter)
    reset.middleware(cacheInvalidationFilter)

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

  it('memcached test', async(function*() {
    var server = spawn('memcached', ['-p', memcachedPort], {
      stdio: 'ignore'
    })

    server.on('exit', (code) => {
      code = code|0
      
      if(code != 0) throw new Error(
        'failed to start memcached test server')
    })

    var {
      cacheFilter, cacheInvalidationFilter 
    } = memcachedFilters()

    cacheFilter.implement({ getCacheId })
    cacheInvalidationFilter.implement({ getCacheId })

    var { increment, reset } = counterBundle.fork()
      .toHandlerComponents()

    increment.middleware(cacheFilter)
    reset.middleware(cacheInvalidationFilter)

    var memcachedServers = '127.0.0.1:' + memcachedPort

    var memcached = createMemcached(memcachedServers)

    var config = { 
      memcachedServers
    }

    var counterHandler = yield increment.loadHandler(config)
    var resetHandler = yield reset.loadHandler(config)

    yield counterHandler({id: 'foo'})
      .should.eventually.equal('foo-1')

    yield timeout(100)

    yield counterHandler({id: 'foo'})
      .should.eventually.equal('foo-1')

    yield counterHandler({id: 'bar'})
      .should.eventually.equal('bar-1')

    yield timeout(100)

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

    var counterHandler2 = yield increment.loadHandler(config)

    yield counterHandler2({id: 'foo'})
      .should.eventually.equal('foo-6')

    yield counterHandler2({id: 'bar'})
      .should.eventually.equal('bar-1')

    server.kill()
  }))
})