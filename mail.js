/* Copyright (c) 2013-2019 Richard Rodger and other contributors, MIT License */
'use strict'

const Email = require('email-templates')

module.exports = mail
module.exports.defaults = {
  test: false,
  email: {
    // NOTE: for safety the default is to not send email
    send: false,
    preview: false
  }
}

function mail(options) {
  var seneca = this
  var mailer

  // TODO seneca 4.x with embedded promisify should support this
  seneca.depends('promisify')

  seneca
    .message('sys:mail,send:mail', send_mail)
    .message('sys:mail,hook:render', hook_render)

  seneca.prepare(async function() {
    var root = seneca.root

    var email_opts = options.email

    // create transport
    var transport_opts = email_opts.transport
    if (transport_opts) {
      var transport_maker = require('nodemailer-' + transport_opts.name)
      var transport = transport_maker(transport_opts.options)
      email_opts.transport = transport
    }

    email_opts.render = async (view, content) => {
      var code = view.split('/')[0]
      var part = view.split('/')[1]

      // TODO: how to make this action specific?
      var res = await root.post('sys:mail,hook:render', {
        code,
        part,
        content
      })

      var out = res && res[part]

      if ('html' === part) {
        out = await mailer.juiceResources(out)
      }

      return out
    }

    mailer = new Email(email_opts)
  })

  async function send_mail(msg) {
    var content = msg.content

    var mail_opts = {
      template: msg.code,
      message: {
        to: msg.to,
        from: msg.from,
        subject: msg.subject
      },
      locals: content
    }

    var res = await mailer.send(mail_opts)

    return {
      msg: msg,
      sent: res
    }
  }

  async function hook_render(msg) {
    return {
      html:
        'NO RENDER DEFINED FOR ' +
        msg.code +
        ', content was: ' +
        JSON.stringify(msg.content)
    }
  }
}
