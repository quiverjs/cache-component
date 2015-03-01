import 'quiver-core/traceur'

import { async, promisify, timeout } from 'quiver-core/promise'

import { 
  simpleHandler, simpleHandlerBuilder,
  handlerBundle, transformFilter
} from 'quiver-core/component'

import pathLib from 'path'
let { join: joinPath } = pathLib

import fs from 'fs'
let { existsSync, readFileSync } = fs

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

import { diskCacheFilters } from '../lib/cache-component.js'

chai.use(chaiAsPromised)
let should = chai.should()
let expect = chai.expect

let cacheDir = 'temp'

describe('disk cache filter test', () => {
  let getCacheId = simpleHandler(
    args => args.id, 'void', 'text')

  let uppercase = simpleHandler(
    (args, text) => text.toUpperCase(),
    'text', 'text')

  let greet = simpleHandler(
  args => {
    let { id } = args
    return 'Hello, ' + id
  }, 'void', 'text')
  .addMiddleware(transformFilter(uppercase, 'out'))

  it('sanity test', async(function*() {
    let handler = yield greet.loadHandler({ })
    
    yield handler({ id: 'foo' })
      .should.eventually.equal('HELLO, FOO')
  }))

  it('basic test', async(function*() {
    let {
      cacheFilter, cacheInvalidationFilter 
    } = diskCacheFilters()

    cacheFilter.implement({ getCacheId })

    let cachedGreet = greet.fork()
      .middleware(cacheFilter)

    let config = { cacheDir }

    let handler = yield cachedGreet.loadHandler(config)

    let cacheFile = joinPath(cacheDir, 'foo')

    existsSync(cacheFile).should.equal(false)

    yield handler({ id: 'foo' })
      .should.eventually.equal('HELLO, FOO')

    yield timeout(100)

    readFileSync(cacheFile).toString()
      .should.equal('HELLO, FOO')
  }))
})