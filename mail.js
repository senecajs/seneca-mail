/* Copyright (c) 2013-2014 Richard Rodger, MIT License */
"use strict";

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
      this.act(
        {
          role:plugin,hook:'content',
          code:args.code,
          content:_.extend(
            {},
            options.content,
            options.content[args.code] || {},
            args.content
          )
        },function(err,content){

          if( err) return done(err)

          seneca.act({role:plugin,cmd:'generateBody',code:args.code,content:content},function(err,out){
            if( err) return done(err)
            do_send(out)
          })
        })
    }
    else do_send({html:args.html,text:args.text})


    function do_send(body) {
      var sendargs = _.extend(
        {},
        options.mail,
        args,
        {
          cmd:null, hook:'send',
          text:body.text,
          html:body.html
        }
      )
      if (body.subject){
        sendargs.subject = body.subject
      }

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

  if (options.folder){
    require('./lib/templateActions')(seneca, options)
  }else{
    require('./lib/defaultActions')(seneca, options)
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
