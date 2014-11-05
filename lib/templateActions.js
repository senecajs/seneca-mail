"use strict";

var emailtemplates = require("email-templates")
var fs = require('fs')
var _ = require('underscore')


module.exports = function (seneca, options) {
  var plugin = "mail"
  var template

  var generateBody = function (args, done) {
    var code = args.code // template identifier
    var content = args.content

    this.act(
      {
        role: plugin,
        hook: 'content',
        code: args.code,
        content: content}, function (err, content) {

        if (err) {
          return done(err)
        }
        template(code, content, function (err, html, text) {
          done(err, {ok: !err, html: html, text: text})
        })
      })
  }

  var init = function (args, done) {
    var seneca = this
    seneca.act(
      {role: plugin, hook: 'init', sub: 'templates', options: options},
      function (err) {
        if (err) {
          return done(err);
        }

        seneca.act(
          {role: plugin, hook: 'init', sub: 'transport', options: options},
          done
        )
      })
  }

  function initTemplates(seneca, options, callback) {
    var folder = options.folder

    if (void 0 != options.templates && !options.templates) {
      seneca.log.warn('not using templates')
      return callback()
    }

    fs.stat(folder, function (err, folderstat) {
      if (err) {
        if ('ENOENT' === err.code) {
          return seneca.fail({code: 'no-templates-folder', folder: folder}, callback)
        }
        else {
          return callback(err);
        }
      }

      if (!folderstat.isDirectory()) {
        return seneca.fail({code: 'not-a-folder', folder: folder}, callback)
      }

      emailtemplates(folder, function (err, templateinstance) {
        if (err) {
          return callback(err);
        }

        template = templateinstance
        callback(null, template)
      })
    })
  }

  seneca.add({init: plugin}, init)
  seneca.add({role: plugin, cmd: 'generate'}, generateBody)
  seneca.add({role: plugin, hook: 'init', sub: 'templates'}, function (args, done) {
    initTemplates(this, args.options, done)
  })

  return {
    name: 'defaultMailActions'
  }
}
