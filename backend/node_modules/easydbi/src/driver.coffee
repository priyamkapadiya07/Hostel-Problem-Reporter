{ EventEmitter } = require 'events'
Promise = require 'bluebird'
fs = Promise.promisifyAll require 'fs'
path = require 'path'
Errorlet = require 'errorlet'
_ = require 'lodash'
debug = require('debug')('easydbi')
Schema = require 'schemalet'
knex = require('knex')

QueryKey = Schema.makeSchema
  type: 'string'

QueryArgs = Schema.makeSchema
  type: 'object'
  defaultProc: () -> {} 

ResultRecord = Schema.makeSchema
  type: 'object'

ResultSet = Schema.makeSchema
  type: 'array'
  items: ResultRecord

class Driver extends EventEmitter
  @id = 0
  @pool = true
  constructor: (@key, @options) ->
    @constructor.id++
    @id = @constructor.id
  connect: Schema.makeFunction {
    params: []
    async: true
  },
  (cb) ->
    @innerConnect cb
  isConnected: Schema.makeFunction {
    params: []
    returns: { type: 'boolean' }
  },
  () ->
    @innerIsConnected()
  driverName: Schema.makeFunction {
    params: []
    returns: { type: 'string' }
  },
  () ->
    @constructor.name
  loadScript: Schema.makeFunction {
    params: [
      { type: 'string' }
      { type: 'boolean', default: false }
    ]
    async: true
  },
  (filePath, inTrans, cb) ->
    debug 'DBI.Driver.loadScript', { filePath: filePath, inTrans: inTrans }
    self = @
    fs.readFileAsync(filePath, 'utf8')
      .then (data) ->
        cmds = _.filter data.split(/\s*;\s*/), (cmd) -> cmd.trim() != ''
        if inTrans
          self.beginAsync()
            .then ->
              Promise.each cmds, (cmd) ->
                self.execAsync cmd, {}
            .then ->
              self.commitAsync()
            .catch (e) ->
              self.rollback ->
                return cb e
        else
          Promise.each cmds, (cmd) ->
            self.execAsync cmd, {}
      .then () ->
        cb null
      .catch cb
  isKnexQueryBuilder: (key) ->
    return key instanceof Object and key.client and key._statements instanceof Array
  isValidQueryType: (key) ->
    typeof(key) == 'string' or @isKnexQueryBuilder(key)
  query: (key, args, cb) ->
    if (arguments.length == 2)
      cb = args
      args = {}
    if not @isValidQueryType(key)
      return cb Errorlet.create
        error: 'invalid_query_type'
        method: 'EASYDBI.query'
        query: key
        message: 'must be string or Knex Query Builder object'
    @innerQuery key, args, (err, results) ->
      if err
        cb Errorlet.create
          error: 'queryError'
          method: 'EASYDBI.query'
          query: key
          args: args
          __inner: err
      else
        cb null, results
  queryOne: (key, args, cb) ->
    if (arguments.length == 2)
      cb = args
      args = {}
    if not @isValidQueryType(key)
      return cb Errorlet.create
        error: 'invalid_query_type'
        method: 'EASYDBI.query'
        query: key
        message: 'must be string or Knex Query Builder object'
    @query key, args, (err, rows) ->
      if err
        cb err
      if rows?.length == 0
        cb Errorlet.create
          error: 'no_rows_found'
          method: 'EASYDBI.queryOne'
          query: key
          args: args
      else if rows?.length > 0
        cb null, rows[0]
      else
        cb Errorlet.create
          error: 'unknown_result'
          method: 'EASYDBI.queryOne'
          query: key
          args: args
          result: rows
  innerExec: (key, args, cb) ->
    @innerQuery key, args, cb
  exec: (key, args, cb) ->
    if arguments.length == 2
      cb = args
      args = {}
    if not @isValidQueryType(key)
      return cb Errorlet.create
        error: 'invalid_query_type'
        method: 'EASYDBI.query'
        query: key
        message: 'must be string or Knex Query Builder object'
    @innerExec key, args, (err, rows) ->
      if err
        cb err
      else
        cb null
  begin: Schema.makeFunction {
    async: true
    params: []
  },
  (cb) ->
    @innerBegin cb
  innerBegin: (cb) ->
    @exec 'begin', cb
  commit: Schema.makeFunction {
    async: true
    params: []
  },
  (cb) ->
    @innerCommit cb
  innerCommit: (cb) ->
    @exec 'commit', cb
  rollback: Schema.makeFunction {
    async: true
    params: []
  },
  (cb) ->
    @innerRollback cb
  innerRollback: (cb) ->
    @exec 'rollback', cb
  disconnect: (cb) ->
    @innerDisconnect cb
  close: (cb) -> # same as disconnect except in pool scenario.
    @innerClose cb
  execScript: Schema.makeFunction {
    async: true
    params: [
      { type: 'string' }
    ]
  },
  (filePath, cb) ->
    self = @
    fs.readFileAsync(filePath, 'utf8')
      .then((data) ->
        queries = data.split /\w*;\w/
        return Promise.each queries, (query) ->
          console.log 'try', query
          self.execAsync query, {}
      ).then(() ->
        cb null
      ).catch(cb)

#_.each Driver.prototype, (val, key) ->
#  if typeof(val) == 'function' or val instanceof Function
#    Driver.prototype[key + 'Async'] = (args...) ->
#      @[key] args...

Promise.promisifyAll Driver.prototype

module.exports = Driver
