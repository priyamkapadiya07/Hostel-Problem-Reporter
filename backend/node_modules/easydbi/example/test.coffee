module.exports = 
  createTest: {exec: 'create table test_t (c1 int, c2 int)'}
  insertTest: {exec: 'insert into test_t values ($c1, $c2)'}
  selectTest: (args, cb) ->
    @query 'select * from test_t', args, cb
