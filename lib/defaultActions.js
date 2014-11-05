"use strict";

module.exports = function( seneca, options ){
  var plugin = "mail"

  var generateBody = function (args, done) {
    done('Unsupported configuration, downgrade seneca-mail or override "generateBody" seneca command as specified in https://github.com/rjrodger/seneca-mail.')
  }

  var init = function (args, done) {
    var seneca = this
    seneca.act(
      {role: plugin, hook: 'init', sub: 'transport', options: options},
      function (err) {
        if (err) {
          return done(err);
        }

        done(null)
      })
  }

  seneca.add({init:plugin}, init)
  seneca.add({role:plugin,cmd:'generateBody'},generateBody)

  return {
    name:'defaultMailActions'
  }
}
