
{ EventEmitter } = require 'events'
Driver = require './driver'
Pool = require './pool'
debug = require('debug')('easydbi')
Promise = require 'bluebird'
Errorlet = require 'errorlet'
Schema = require 'schemalet'

class DBI
  @drivers = {}
  @pools = {}
  # this register the type...
  @register: (type, driver) ->
    @drivers[type] = driver
    @
  @getType: (type) ->
    if @drivers.hasOwnProperty(type)
      @drivers[type]
    else
      Errorlet.raise {error: 'EASYDBI.unknown_dbi_driver_type', type: type}
  @hasType: (type) ->
    @drivers.hasOwnProperty type
  @hasSetup: (key) ->
    @pools.hasOwnProperty key
  @setup: (key, {type, options, pool}) ->
    debug 'DBI.setup', key, type, options, pool
    if @pools.hasOwnProperty(key)
      Errorlet.raise {error: 'EASYDBI.setup:duplicate_setup', key: key, keys: Object.keys(@pools)}
    driver = @getType type
    if driver.pool and pool
      @pools[key] = new driver.pool key, type, driver, options, pool
    else if pool
      @pools[key] = new Pool key, type, driver, options, pool
    else
      @pools[key] = new Pool.NoPool key, type, driver, options, pool
    @
  @tearDown: (key) -> # this should only be called if all connections disconnected.
    delete @pools[key]
  @getPool: (key) ->
    if @pools.hasOwnProperty(key)
      @pools[key]
    else
      Errorlet.raise {error: 'EASYDBI.unknown_driver_spec', key: key}
  @connect: Schema.makeFunction {
      async: true,
      params: [
        { type: 'string' }
      ],
      returns: Driver
    },
    (key, cb) ->
      debug 'DBI.connect', key
      try
        pool = @getPool key
        pool.connect cb
      catch e
        cb e
  @connectAsync: @connect
#  @connectAsync: Promise.promisify(@connect)
  @load: (key, module) ->
    for call, options of module
      @prepare key, call, options
    @
  @prepare: (key, call, options) ->
    pool= @getPool key
    pool.prepare call, options
    @

module.exports = DBI
