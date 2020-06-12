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

lab.test('owner-orbit', async () => {
  var si = await seneca_instance().ready()
  var address = 'bob@example.com'
  var res

  si.message('sys:mail,hook:render,code:foo,owner:o01', async function(msg) {
    return { html: `Owner01 ${msg.content.foo}` }
  }).message('sys:mail,hook:render,code:foo,owner:o02', async function(msg) {
    return { html: `Owner02 ${msg.content.foo}` }
  })

  res = await si.post('sys:mail,send:mail', {
    code: 'foo',
    owner: 'o01',
    orbit: 'zed',
    to: address,
    content: {
      foo: 'FOO'
    }
  })

  expect(res.msg.code).equals('foo')
  expect(res.msg.owner).equals('o01')
  expect(res.msg.orbit).equals('zed')
  expect(res.template).equals('foo~o01~zed')
  expect(res.sent.message).includes('Owner01 FOO')

  
  res = await si.post('sys:mail,send:mail', {
    code: 'foo',
    owner: 'o02',
    to: address,
    content: {
      foo: 'FOO'
    }
  })

  expect(res.msg.code).equals('foo')
  expect(res.msg.owner).equals('o02')
  expect(res.msg.orbit).not.exists()
  expect(res.template).equals('foo~o02')
  expect(res.sent.message).includes('Owner02 FOO')
})

function seneca_instance(seneca_options, plugin_options) {
  return Seneca(seneca_options, { legacy: { transport: false } })
    .test()
    .use('promisify')
    .use(Plugin, plugin_options)
}
