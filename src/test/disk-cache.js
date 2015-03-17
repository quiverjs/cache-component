import { async, promisify, timeout } from 'quiver-core/promise'

import { 
  simpleHandler, simpleHandlerBuilder,
  handlerBundle, transformFilter
} from 'quiver-core/component'

import pathLib from 'path'
const { join: joinPath } = pathLib

import fs from 'fs'
const { existsSync, readFileSync } = fs

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

import { diskCacheFilters } from '../lib/cache-component.js'

chai.use(chaiAsPromised)
const should = chai.should()
const expect = chai.expect

const cacheDir = 'temp'

describe('disk cache filter test', () => {
  const getCacheId = simpleHandler(
    args => args.id, 'void', 'text')

  const uppercase = simpleHandler(
    (args, text) => text.toUpperCase(),
    'text', 'text')

  const greet = simpleHandler(
  args => {
    const { id } = args
    return 'Hello, ' + id
  }, 'void', 'text')
  .addMiddleware(transformFilter(uppercase, 'out'))

  it('sanity test', async(function*() {
    const handler = yield greet.loadHandler({ })
    
    yield handler({ id: 'foo' })
      .should.eventually.equal('HELLO, FOO')
  }))

  it('basic test', async(function*() {
    const {
      cacheFilter, cacheInvalidationFilter 
    } = diskCacheFilters()

    cacheFilter.implement({ getCacheId })

    const cachedGreet = greet.fork()
      .middleware(cacheFilter)

    const config = { cacheDir }

    const handler = yield cachedGreet.loadHandler(config)

    const cacheFile = joinPath(cacheDir, 'foo')

    existsSync(cacheFile).should.equal(false)

    yield handler({ id: 'foo' })
      .should.eventually.equal('HELLO, FOO')

    yield timeout(100)

    readFileSync(cacheFile).toString()
      .should.equal('HELLO, FOO')
  }))
})