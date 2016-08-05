'use strict'

var Assert = require('assert')

var Lab = require('lab')
var lab = exports.lab = Lab.script()
var suite = lab.suite
var test = lab.test
var before = lab.before

var Seneca = require('seneca')

suite('mail default generate', function() {
  var si
  before({}, function(done) {
    si = Seneca()
      .use('..')
    si.ready(function() {
      done()
    })
  })

  test('verify', function(done) {
    si.act(
      "role: 'mail', cmd: 'generate'", {
        code: 'foo',
        content: {
          foo: 'bar'
        }
      },
      function(err) {
        Assert(err)

        done()
      })
  })
})


suite('mail template generate', function() {
  var si
  before({}, function(done) {
    si = Seneca()
      .use('..', {
        folder: './test/email-templates'
      })
    si.ready(function() {
      done()
    })
  })

  test('verify', function(done) {
    si.act(
      "role: 'mail', cmd: 'generate'", {
        code: 'foo',
        content: {
          foo: 'bar'
        }
      },
      function(err, out) {
        Assert(!err)
        Assert.equal('<h1>Foo: bar</h1>', out.html)
        Assert.equal('Foo: bar', out.text)
        done()
      })
  })
})


suite('mail verify content', function() {
  var si
  before({}, function(done) {
    si = Seneca()
      .use('..', {
        folder: './test/email-templates',
        content: {
          bar: {
            a: 1,
            b: 0
          }
        }
      })
    si.ready(function() {
      done()
    })
  })

  test('verify', function(done) {
    si.act(
      "role: 'mail', cmd: 'generate'", {
        code: 'bar'
      },
      function(err, out) {
        Assert(!err)
        Assert.equal('<div>a:1,b:0</div>', out.html)
        Assert.equal('a:1,b:0', out.text)
        done()
      })
  })

  test('verify hook content', function(done) {
    si.act("role: 'mail', cmd: 'generate'", {
      code: 'bar'
    }, function(err) {
      Assert(!err)
      si.add({
        role: 'mail',
        hook: 'content'
      }, function(args, done) {
        args.content = args.content || {}
        args.content.b = 2
        this.prior(args, done)
      })

      si.act(
        "role: 'mail', cmd: 'generate'", {
          code: 'bar'
        },
        function(err, out) {
          Assert(!err)
          Assert.equal('<div>a:1,b:2</div>', out.html)
          Assert.equal('a:1,b:2', out.text)
          done()
        })
    })
  })
})


suite('mail use stub transport using short name', function() {
  var si
  before({}, function(done) {
    si = Seneca()
      .use('..', {
        folder: './test/email-templates',
        content: {
          bar: {
            a: 1,
            b: 0
          }
        },
        transport: 'stub'
      })
    si.ready(function() {
      done()
    })
  })

  test('verify', function(done) {
    si.act(
      "role: 'mail', cmd: 'send'", {
        code: 'foo',
        to: 'test@test.com',
        content: {
          foo: 'bar'
        }
      },
      function(err, out) {
        Assert(!err)
        Assert(out)
        Assert(out.details.response)

        done()
      })
  })
})
