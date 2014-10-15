/* Copyright (c) 2013-2014 Richard Rodger, MIT License */
"use strict";

var fs = require('fs')

var _              = require('underscore')
var nodemailer     = require("nodemailer")
var transports     = {
  "smtp"    : 'nodemailer-smtp-transport',
  "ses"     : 'nodemailer-ses-transport',
  "smtpPool": 'nodemailer-smtp-pool',
  "sendmail": 'nodemailer-sendmail-transport',
  "stub"    : 'nodemailer-stub-transport',
  "pickup"  : 'nodemailer-pickup-transport'
}


module.exports = function( options ){
  var seneca = this
  var plugin = "mail"
  var transport

  options = this.util.deepextend({
    content:   {},
    mail:      {},
    transport: 'smtp',
    config: {}
  },options)

  var sendMail = function( args, done ){
    var seneca = this

    if( args.code ) {
      seneca.act({role:plugin,cmd:'generateBody',code:args.code,content:args.content},function(err,out){
        if( err) return done(err)
        do_send(out)
      })
    }
    else do_send({html:args.html,text:args.text})


    function do_send(body) {
      var sendargs = _.extend({},options.mail,args,{cmd:null,hook:'send',text:body.text,html:body.html})

      seneca.log.debug('send',sendargs.code||'-',sendargs.to)
      seneca.act(sendargs,done)
    }
  }

  var getContent = function( args, done ){
    var code   = args.code // template identifier

    var content = this.util.deepextend({},options.content[code]||{},args.content||{})
    done( null, content )
  }

  seneca.add({role:plugin,hook:'send'},function( args, done ){
    transport.sendMail(args, function(err, response){
      if( err ) return done(err);
      done(null,{ok:true,details:response})
    })
  })

  function initTransport(options, callback) {
    var transportPluginName = transports[options.transport] || options.transportPluginName || options.transport
    var transportPlugin

    seneca.log.debug('Loading specified transport definition: ' + transportPluginName)
    transportPlugin = require(transportPluginName)

    transport = nodemailer.createTransport( transportPlugin(options.config) )
    callback(null, transport)
  }

  var close = function(args,done){
    if( transport && _.isFunction( transport.close ) ) {
      transport.close(done)
    }
    else return done(null)
  }

  var defaultGenerateBody = function (args, done) {
    done('Unsupported configuration, downgrade seneca-mail or override "generateBody" seneca command as specified in https://github.com/rjrodger/seneca-mail.')
  }

  var defaultInit = function (args, done) {
    var seneca = this
    seneca.act(
      {role: plugin, hook: 'init', sub: 'transport', options: options},
      function (err) {
        if (err) return done(err);

        done(null)
      })
  }

  var templateGenerateBody = function (args, done) {
    done('Unsupported configuration, downgrade seneca-mail or override "generateBody" seneca command as specified in https://github.com/rjrodger/seneca-mail.')
  }

  var templateInit = function (args, done) {
    var seneca = this
    seneca.act(
      {role:plugin,hook:'init',sub:'templates',options:options},
      function( err ){
        if( err ) return done(err);

        seneca.act(
          {role:plugin,hook:'init',sub:'transport',options:options},
          function( err ){
            if( err ) return done(err);

            done(null)
          })
      })
  }

  var template

  function initTemplates(seneca, options, callback) {
    var folder = options.folder

    if( void 0 != options.templates && !options.templates ) {
      seneca.log.warn('not using templates')
      return done()
    }

    fs.stat( folder, function(err,folderstat) {
      if( err ) {
        if( 'ENOENT' == err.code ) {
          return seneca.fail({code:'no-templates-folder',folder:folder},callback)
        }
        else return callback(err);
      }

      if( !folderstat.isDirectory() ) {
        return seneca.fail({code:'not-a-folder',folder:folder},callback)
      }

      emailtemplates( folder, function( err, templateinstance ) {
        if( err ) return callback(err);

        template = templateinstance
        callback(null,template)
      })
    })
  }

  if (!options.folder){
    seneca.add({init:plugin}, defaultInit)
    seneca.add({role:plugin,cmd:'generateBody'},templateGenerateBody)
  }else{
    seneca.add({init:plugin}, templateInit)
    seneca.add({role:plugin,cmd:'generateBody'},templateGenerateBody)
    seneca.add({role:plugin,hook:'init',sub:'templates'},function( args, done ) {
      initTemplates(this, args.options, done)
    })
  }

  seneca.add({role:plugin,hook:'init',sub:'transport'},function( args, done ){
    initTransport(args.options, done)
  })
  seneca.add({role:plugin,cmd:'send'},sendMail)
  seneca.add({role:plugin,hook:'content'},getContent)
  seneca.add({role:'seneca',cmd:'close'},close)

  return {
    name:plugin
  }
}
