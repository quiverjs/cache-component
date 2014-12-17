import 'traceur'

import { async, promisify, timeout } from 'quiver-promise'

import { 
  simpleHandler, simpleHandlerBuilder,
  handlerBundle, transformFilter
} from 'quiver-component'

import pathLib from 'path'
var { join: joinPath } = pathLib

import fs from 'fs'
var { existsSync, readFileSync } = fs

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

import { diskCacheFilters } from '../lib/cache-component.js'

chai.use(chaiAsPromised)
var should = chai.should()
var expect = chai.expect

var cacheDir = 'temp'

describe('disk cache filter test', () => {
  var getCacheId = simpleHandler(
    args => args.id, 'void', 'text')

  var uppercase = simpleHandler(
    (args, text) => text.toUpperCase(),
    'text', 'text')

  var greet = simpleHandler(
  args => {
    var { id } = args
    return 'Hello, ' + id
  }, 'void', 'text')
  .addMiddleware(transformFilter(uppercase, 'out'))

  it('sanity test', async(function*() {
    var handler = yield greet.loadHandler({ })
    
    yield handler({ id: 'foo' })
      .should.eventually.equal('HELLO, FOO')
  }))

  it('basic test', async(function*() {
    var {
      cacheFilter, cacheInvalidationFilter 
    } = diskCacheFilters()

    cacheFilter.implement({ getCacheId })

    var cachedGreet = greet.fork()
      .middleware(cacheFilter)

    var config = { cacheDir }

    var handler = yield cachedGreet.loadHandler(config)

    var cacheFile = joinPath(cacheDir, 'foo')

    existsSync(cacheFile).should.equal(false)

    yield handler({ id: 'foo' })
      .should.eventually.equal('HELLO, FOO')

    yield timeout(100)

    readFileSync(cacheFile).toString()
      .should.equal('HELLO, FOO')
  }))
})