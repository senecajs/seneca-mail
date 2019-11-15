/* Copyright (c) 2019 voxgig and other contributors, MIT License */
'use strict'

// const Util = require('util')

const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const expect = Code.expect

const PluginValidator = require('seneca-plugin-validator')
const Seneca = require('seneca')
const Plugin = require('..')

lab.test('validate', PluginValidator(Plugin, module))

lab.test('happy', async () => {
  var si = await seneca_instance().ready()
  var address = 'alice@example.com'
  var res

  res = await si.post('sys:mail,send:mail', {
    code: 'foo',
    to: address,
    content: {
      bar: 'BarraB'
    }
  })

  expect(res.msg.code).equals('foo')
  expect(res.sent.message).includes('BarraB')

  si.message('sys:mail,hook:render,code:foo', async function(msg) {
    return { html: `Foo ${msg.content.bar} ooF` }
  })

  res = await si.post('sys:mail,send:mail', {
    code: 'foo',
    to: address,
    content: {
      bar: 'BarraB'
    }
  })

  expect(res.sent.message).includes('Foo BarraB ooF')
})

function seneca_instance(seneca_options, plugin_options) {
  return Seneca(seneca_options, { legacy: { transport: false } })
    .test()
    .use('promisify')
    .use(Plugin, plugin_options)
}
