/* Copyright (c) 2013 Richard Rodger */
"use strict";

// mocha mail.test.js

var seneca = require('seneca')
var assert = require('chai').assert

describe('mail', function () {
  it('verify default generate', function (done) {
    var si = seneca()
      .use('..')
    si.ready(function (err) {
      assert.isUndefined(err)
      var mail = si.pin({role: 'mail', cmd: '*'})

      mail.generate({code: 'foo', content: {foo: 'bar'}}, function (err, out) {
        assert.isNotNull(err)

        done()
      })
    })
  })

  it('verify template generate', function (done) {
    var si = seneca()
      .use('..', {folder: './email-templates'})
    si.ready(function (err) {
      assert.isUndefined(err)

      var mail = si.pin({role: 'mail', cmd: '*'})
      mail.generate({code: 'foo', content: {foo: 'bar'}}, function (err, out) {
        console.log(err + ':' + JSON.stringify(out))
        assert.isNull(err)
        assert.equal('<h1>Foo: bar</h1>\n', out.html)
        assert.equal('Foo: bar\n', out.text)
        done()
      })
    })
  })

  it('verify content', function (done) {
    var si = seneca()
      .use('..', {folder: './email-templates', content: {bar: {a: 1, b: 0}}})
    si.ready(function (err) {
      assert.isUndefined(err)

      var mail = si.pin({role: 'mail', cmd: '*'})

        ;
      mail.generate({code: 'bar'}, function (err, out) {
        assert.isNull(err)
        //console.dir(out)
        assert.equal('<div>a:1,b:0</div>', out.html)
        assert.equal('a:1,b:0', out.text)

        si.add({role: 'mail', hook: 'content'}, function (args, done) {
          args.content = args.content || {}
          args.content.b = 2
          this.parent(args, done)
        })

        ;
        mail.generate({code: 'bar'}, function (err, out) {
          assert.isNull(err)
          assert.equal('<div>a:1,b:2</div>', out.html)
          assert.equal('a:1,b:2', out.text)
          done()

        })
      })
    })
  })
})
