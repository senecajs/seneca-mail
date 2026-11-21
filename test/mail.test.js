/* Copyright (c) 2019 voxgig and other contributors, MIT License */
'use strict'

const { test } = require('node:test')
const assert = require('node:assert/strict')

const PluginValidator = require('seneca-plugin-validator')
const Seneca = require('seneca')
const Plugin = require('..')

test('validate', PluginValidator(Plugin, module))

test('happy', async () => {
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

  assert.equal(res.msg.code, 'foo')
  assert.ok(res.sent.message.includes('BarraB'))

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

  assert.ok(res.sent.message.includes('Foo BarraB ooF'))

  await si.close()
})

test('owner-orbit', async () => {
  var si = await seneca_instance(
    { legacy: false },
    {
      history: false,
      logmail: false
    }
  ).ready()
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

  assert.equal(res.msg.code, 'foo')
  assert.equal(res.msg.owner, 'o01')
  assert.equal(res.msg.orbit, 'zed')
  assert.equal(res.template, 'foo~o01~zed')
  assert.ok(res.sent.message.includes('Owner01 FOO'))

  res = await si.post('sys:mail,send:mail', {
    code: 'foo',
    owner: 'o02',
    to: address,
    content: {
      foo: 'FOO'
    }
  })

  assert.equal(res.msg.code, 'foo')
  assert.equal(res.msg.owner, 'o02')
  assert.ok(null == res.msg.orbit)
  assert.equal(res.template, 'foo~o02')
  assert.ok(res.sent.message.includes('Owner02 FOO'))

  await si.close()
})

test('history', async () => {
  var si = await seneca_instance(
    {},
    {
      logmail: false,
      makehist: ({ template, msg }) => ({ tmpl: template, who: msg.to })
    }
  ).ready()

  var res = await si.post('sys:mail,send:mail', {
    code: 'foo',
    to: 'carol@example.com',
    content: { bar: 'BarraB' }
  })

  // The history entity is saved without waiting.
  var list = []
  for (var i = 0; i < 50 && 0 === list.length; i++) {
    await new Promise(r => setTimeout(r, 20))
    list = await si.entity('sys/mailhist').list$()
  }

  assert.equal(list.length, 1)
  assert.equal(list[0].mid, res.mid)
  assert.equal(list[0].template, 'foo')
  assert.equal(list[0].tmpl, 'foo')
  assert.equal(list[0].who, 'carol@example.com')

  // history:false on the message skips the entity.
  await si.post('sys:mail,send:mail', {
    code: 'foo',
    to: 'dave@example.com',
    history: false,
    content: { bar: 'BarraB' }
  })
  await new Promise(r => setTimeout(r, 50))
  list = await si.entity('sys/mailhist').list$()
  assert.equal(list.length, 1)

  await si.close()
})

test('email-options-pass-through', async () => {
  // Options for nodemailer and email-templates other than send and
  // preview are passed through, such as the default message fields.
  var si = await seneca_instance(
    {},
    {
      history: false,
      logmail: false,
      email: {
        message: { from: 'sender@example.com' }
      }
    }
  ).ready()

  var res = await si.post('sys:mail,send:mail', {
    code: 'foo',
    to: 'erin@example.com',
    content: { bar: 'BarraB' }
  })

  assert.equal(res.sent.envelope.from, 'sender@example.com')
  assert.deepEqual(res.sent.envelope.to, ['erin@example.com'])
  assert.ok(res.sent.message.includes('BarraB'))

  await si.close()
})

function seneca_instance(seneca_options, plugin_options) {
  return Seneca(seneca_options)
    .test()
    .use('@seneca/entity')
    .use(Plugin, plugin_options)
}
