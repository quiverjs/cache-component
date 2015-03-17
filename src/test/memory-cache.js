import { async, timeout } from 'quiver-core/promise'
import { 
  simpleHandler, simpleHandlerBuilder,
  handlerBundle
} from 'quiver-core/component'

import childProcess from 'child_process'
const { spawn } = childProcess

import { 
  memoryCacheFilters, 
  memcachedFilters
} from '../lib/cache-component.js'

import { createMemcached } from '../lib/memcached.js'

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
const should = chai.should()
const expect = chai.expect

const memcachedPort = '11212'

describe('cache filter test', () => {
  const getCacheId = simpleHandler(
    args => args.id, 'void', 'text')

  const counterBundle = handlerBundle(
  config => {
    const table = { }

    const increment = args => {
      const { id } = args

      let count = table[id] || 0
      count++

      table[id] = count
      return id + '-' + count
    }

    const reset = args => {
      const { id, count=0 } = args

      table[id] = count
    }

    return { 
      increment, reset
    }
  })
  .simpleHandler('increment', 'void', 'text')
  .simpleHandler('reset', 'void', 'void')

  const { increment, reset } = counterBundle.toHandlerComponents()

  it('sanity test', async(function*() {
    const config = { }

    const counterHandler = yield increment.loadHandler(config)
    const resetHandler = yield reset.loadHandler(config)

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
    const {
      cacheFilter,
      cacheInvalidationFilter
    } = memoryCacheFilters()

    cacheFilter.implement({ getCacheId })
    cacheInvalidationFilter.implement({ getCacheId })

    const { increment, reset } = counterBundle.fork()
      .toHandlerComponents()

    increment.middleware(cacheFilter)
    reset.middleware(cacheInvalidationFilter)

    const config = { }

    const counterHandler = yield increment.loadHandler(config)
    const resetHandler = yield reset.loadHandler(config)

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
    const server = spawn('memcached', ['-p', memcachedPort], {
      stdio: 'ignore'
    })

    server.on('exit', (code) => {
      code = code|0
      
      if(code != 0) throw new Error(
        'failed to start memcached test server')
    })

    const {
      cacheFilter, cacheInvalidationFilter 
    } = memcachedFilters()

    cacheFilter.implement({ getCacheId })
    cacheInvalidationFilter.implement({ getCacheId })

    const { increment, reset } = counterBundle.fork()
      .toHandlerComponents()

    increment.middleware(cacheFilter)
    reset.middleware(cacheInvalidationFilter)

    const memcachedServers = '127.0.0.1:' + memcachedPort

    const memcached = createMemcached(memcachedServers)

    const config = { 
      memcachedServers
    }

    const counterHandler = yield increment.loadHandler(config)
    const resetHandler = yield reset.loadHandler(config)

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

    const counterHandler2 = yield increment.loadHandler(config)

    yield counterHandler2({id: 'foo'})
      .should.eventually.equal('foo-6')

    yield counterHandler2({id: 'bar'})
      .should.eventually.equal('bar-1')

    server.kill()
  }))
})