/* Copyright (c) 2013-2020 Richard Rodger and other contributors, MIT License */
'use strict'

const Uuid = require('uuid')
const Email = require('email-templates')

module.exports = mail
module.exports.defaults = ({ Joi }) => ({
  test: Joi.boolean()
    .default(false)
    .description('Test mode.'),

  history: Joi.boolean()
    .default(true)
    .description('Save mail history to `sys/mailhist` entity.'),

  // NOTE: Joi function default must be returned from a default maker function
  makehist: Joi.function()
    .default(() => () => {})
    .description('Add properties to `sys/mailhist` entity.'),

  logmail: Joi.boolean()
    .default(true)
    .description('Log mail sending at info level.'),

  // options for nodemailer
  email: Joi.object({
    // NOTE: for safety the default is to not send email

    send: Joi.boolean()
      .default(false)
      .description('Send email (for safety, off by default).'),

    preview: Joi.boolean()
      .default(false)
      .description('Preview email.')
  })
    .unknown()
    .default()
    .description('Options for nodemailer.')
})

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
      var orig_code = view.split('/')[0]
      var part = view.split('/')[1]

      var code = null
      var owner = null
      var orbit = null
      if (orig_code.includes('~')) {
        var subcodes = orig_code.split('~')
        code = subcodes[0]
        owner = subcodes[1]
        orbit = subcodes[2]
      } else {
        code = orig_code
      }

      // empty string is an artefact of code format
      owner = '' === owner ? null : owner

      // TODO: how to make this action specific?
      var res = await root.post('sys:mail,hook:render', {
        code,
        owner,
        orbit,
        part,
        content
      })

      if (null == res) {
        return null
      }

      if (false === res.ok) {
        throw new Error('mail-render-failed: ' + (res ? res.why : 'unknown'))
      }

      var out = res[part]

      if ('html' === part) {
        out = await mailer.juiceResources(out)
      }

      return out
    }

    mailer = new Email(email_opts)
  })

  async function send_mail(msg, meta) {
    var content = msg.content

    // Template format is code~owner~orbit
    var template = msg.code
    if (null != msg.owner) {
      template = template + '~' + msg.owner
    }
    if (null != msg.orbit) {
      template =
        template +
        // NOTE: empty owner may be needed
        (null != msg.owner ? '' : '~') +
        '~' +
        msg.orbit
    }

    // TODO: support domain suffix?
    var messageId = Uuid.v4()

    var mail_opts = {
      template,
      message: {
        to: msg.to,
        from: msg.from,
        subject: msg.subject,
        messageId
      },
      locals: content
    }

    var sent = await mailer.send(mail_opts)
    var statusCode = sent ? sent.statusCode : 0

    var result =
      sent && 'function' === typeof sent.toJSON
        ? sent.toJSON()
        : {
            messageId: messageId,
            statusCode: statusCode
          }

    var savehist =
      (options.history && false !== msg.history) ||
      (!options.history && true === msg.history)

    var when = Date.now()

    if (savehist) {
      // do not wait
      seneca
        .entity('sys/mailhist')
        .data$({
          ...msg,
          template,
          when,
          mid: messageId,
          status: statusCode,
          result,
          ...options.makehist({ msg, meta, template, sent, result, when })
        })
        .save$()
    }

    if (options.logmail) {
      seneca.log.info({
        notice: 'email-sent',
        data: {
          ...msg,
          template,
          when,
          mid: sent.messageId,
          status: statusCode
        }
      })
    }

    return {
      msg,

      // NOTE: avoid sending internal objects back (sendgrid issue)
      sent: Array.isArray(sent)
        ? {
            message: sent[2]
              ? sent[2].originalMessage.html
                ? sent[2].originalMessage.html
                : ''
              : ''
          }
        : sent,

      result,
      template
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
