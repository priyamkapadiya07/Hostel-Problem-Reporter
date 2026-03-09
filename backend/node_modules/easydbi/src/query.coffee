# a simple query normalizer.
# we can go crazy on developing a full on query system, but right now I just need to make sure that they appear uniform.
# this is needed so we can standardize on the way it will be for the different brackets... 
# the worst case is that we will need to generate the whole thing every time. 
# this should be part of the driver basically... 
# the idea is simple at this level. 
# we will take in a named object, and we will the query object normalize them into two things... one is the string, and the other is the object.
debug = require('debug')('easydbi')
Errorlet = require 'errorlet'

arrayifyOptions = 
  key: '?'
  merge: false # keep the args separate.

arrayify = (stmt, args, options = arrayifyOptions) ->
  debug 'query.arrayify', stmt, args, options
  # split the stmt.
  segments = stmt.split /(\$\w+)/g
  outputSegments = []
  outputArgs = []
  for seg in segments 
    if seg.match /^\$/
      key = seg.substring(1)
      if not args.hasOwnProperty(key)
        Errorlet.raise {error: 'EASYDBI.query.arrayify:missing_argument', key: key, args: args, stmt: stmt}
      else if options.merge 
        outputSegments.push escape(args[key])
      else if (typeof(options.key) == 'function') or (options.key instanceof Function)
        keyVal = options.key()
        outputSegments.push keyVal
        outputArgs.push args[key]
      else
        outputSegments.push options.key
        outputArgs.push args[key]
    else
      outputSegments.push seg 
  newStmt = outputSegments.join('')
  debug 'arrayify.output', newStmt, outputArgs , outputSegments
  [ newStmt , outputArgs  ]

escape = (arg) ->
  if typeof(arg) == 'string'
    "'" + arg.replace(/'/, "\\'") + "'"
  else if arg intanceof Date
    escape(arg.toString())
  else if arg instanceof Object
    Errorlet.raise {error: 'EASYDBI.query.escape:invalid_argument', arg: arg}
  else
    arg

module.exports = 
  arrayify: arrayify
