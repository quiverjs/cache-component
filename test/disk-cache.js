import 'traceur'

import { join as joinPath } from 'path'
import { async, promisify, timeout } from 'quiver-promise'
import { 
  simpleHandler, simpleHandlerBuilder,
  handlerBundle, transformFilter
} from 'quiver-component'

import { makeDiskCacheFilters } from '../lib/disk-cache.js'

var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
var should = chai.should()
var expect = chai.expect

var fs = require('fs')

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
    } = makeDiskCacheFilters({getCacheId})

    var cachedGreet = greet.makePrivate()
      .addMiddleware(cacheFilter)

    var config = { cacheDir }

    var handler = yield cachedGreet.loadHandler(config)

    var cacheFile = joinPath(cacheDir, 'foo')

    fs.existsSync(cacheFile).should.equal(false)

    yield handler({ id: 'foo' })
      .should.eventually.equal('HELLO, FOO')

    yield timeout(100)

    fs.readFileSync(cacheFile).toString()
      .should.equal('HELLO, FOO')
  }))
})