import { async, timeout } from 'quiver-core/promise'
import { 
  simpleHandler, simpleHandlerBuilder,
  handlerBundle
} from 'quiver-core/component'

import childProcess from 'child_process'
let { spawn } = childProcess

import { 
  memoryCacheFilters, 
  memcachedFilters
} from '../lib/cache-component.js'

import { createMemcached } from '../lib/memcached.js'

let chai = require('chai')
let chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
let should = chai.should()
let expect = chai.expect

let memcachedPort = '11212'

describe('cache filter test', () => {
  let getCacheId = simpleHandler(
    args => args.id, 'void', 'text')

  let counterBundle = handlerBundle(
  config => {
    let table = { }

    let increment = args => {
      let { id } = args

      let count = table[id] || 0
      count++

      table[id] = count
      return id + '-' + count
    }

    let reset = args => {
      let { id, count=0 } = args

      table[id] = count
    }

    return { 
      increment, reset
    }
  })
  .simpleHandler('increment', 'void', 'text')
  .simpleHandler('reset', 'void', 'void')

  let { increment, reset } = counterBundle.toHandlerComponents()

  it('sanity test', async(function*() {
    let config = { }

    let counterHandler = yield increment.loadHandler(config)
    let resetHandler = yield reset.loadHandler(config)

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
    let {
      cacheFilter,
      cacheInvalidationFilter
    } = memoryCacheFilters()

    cacheFilter.implement({ getCacheId })
    cacheInvalidationFilter.implement({ getCacheId })

    let { increment, reset } = counterBundle.fork()
      .toHandlerComponents()

    increment.middleware(cacheFilter)
    reset.middleware(cacheInvalidationFilter)

    let config = { }

    let counterHandler = yield increment.loadHandler(config)
    let resetHandler = yield reset.loadHandler(config)

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
    let server = spawn('memcached', ['-p', memcachedPort], {
      stdio: 'ignore'
    })

    server.on('exit', (code) => {
      code = code|0
      
      if(code != 0) throw new Error(
        'failed to start memcached test server')
    })

    let {
      cacheFilter, cacheInvalidationFilter 
    } = memcachedFilters()

    cacheFilter.implement({ getCacheId })
    cacheInvalidationFilter.implement({ getCacheId })

    let { increment, reset } = counterBundle.fork()
      .toHandlerComponents()

    increment.middleware(cacheFilter)
    reset.middleware(cacheInvalidationFilter)

    let memcachedServers = '127.0.0.1:' + memcachedPort

    let memcached = createMemcached(memcachedServers)

    let config = { 
      memcachedServers
    }

    let counterHandler = yield increment.loadHandler(config)
    let resetHandler = yield reset.loadHandler(config)

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

    let counterHandler2 = yield increment.loadHandler(config)

    yield counterHandler2({id: 'foo'})
      .should.eventually.equal('foo-6')

    yield counterHandler2({id: 'bar'})
      .should.eventually.equal('bar-1')

    server.kill()
  }))
})