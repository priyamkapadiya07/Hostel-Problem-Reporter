Driver = require './driver'

{ EventEmitter } = require 'events'
_ = require 'lodash'
debug = require('debug')('easydbi')
Promise = require 'bluebird'
Errorlet = require 'errorlet'
_.contains = _.includes

class NoPool
  constructor: (@key, @type, driver, @connOptions, @options) ->
    self = @
    debug 'Easydbi.NoPool.ctor', @key, @type, @connOptions, @options
    @driver = class noPoolDriver extends driver
      @id = 0
  connect: (cb) ->
    debug 'Easydbi.NoPool.connect', @key, @connOptions
    conn = new @driver @key, @connOptions
    conn.connect cb
  prepare: (call, options) ->
    proc =
      if (options instanceof Function) or typeof(options) == 'function'
        options
      else if options?.query
        (args, cb) ->
          @query options.query, args, cb
      else if options?.exec
        (args, cb) ->
          @exec options.exec, args, cb
      else
        Errorlet.raise {error: 'EASYDBI.prepare:invalid_prepare_option', call: call, options: options}
    @driver.prototype[call] = proc
    Promise.promisifyAll @driver.prototype

NoPool.prototype.connectAsync = Promise.promisify(NoPool.prototype.connect)

# we will have 
class Pool extends EventEmitter
  @NoPool = NoPool
  @defaultOptions:
    min: 0
    max: 20
  constructor: (@key, @type, driver, @connOptions, @options) ->
    @options = _.extend {}, @constructor.defaultOptions, @options or {}
    self = @
    debug 'Easydbi.Pool.ctor', @key, @type
    @driver = class poolDriver extends driver
      @id = 0
      disconnect: (cb) ->
        try 
          self.makeAvailable @
          cb()
        catch e
          cb e
    @total = [] # everything is managed here...
    @avail = [] # we keep track of what's currently available.
  connect: (cb) ->
    debug 'Pool.connect', @options, @total.length, @avail.length
    connectMe = (db) ->
      if db.isConnected()
        cb null, db
      else
        db.connect cb
    if @avail.length > 0
      db = @avail.shift()
      connectMe db
    else
      @once 'available', connectMe
      if @total.length < @options.max
        db = new @driver @key, @connOptions
        @total.push db
        @makeAvailable db
  prepare: (call, options) ->
    proc =
      if (options instanceof Function) or typeof(options) == 'function'
        options
      else if options?.query
        (args, cb) ->
          @query options.query, args, cb
      else if options?.exec
        (args, cb) ->
          @exec options.exec, args, cb
      else
        Errorlet.raise {error: 'EASYDBI.prepare:invalid_prepare_option', call: call, options: options}
    @driver.prototype[call] = proc
    Promise.promisifyAll @driver.prototype
  makeAvailable: (db) ->
    if not _.contains @avail, db
      @avail.push db
    @emit 'available', db

Pool.prototype.connectAsync = Promise.promisify(Pool.prototype.connect)

module.exports = Pool
