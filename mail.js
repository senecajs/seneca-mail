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

  seneca.add({role:plugin,cmd:'generateBody'},function( args, done ){
    done( 'Unsupported configuration, downgrade seneca-mail or override "generateBody" seneca command as specified in https://github.com/rjrodger/seneca-mail.' )
  })

  seneca.add({role:plugin,cmd:'send'},function( args, done ){
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
  })

  seneca.add({role:plugin,hook:'content'},function( args, done ){
    var code   = args.code // template identifier

    var content = this.util.deepextend({},options.content[code]||{},args.content||{})
    done( null, content )
  })

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

  seneca.add({role:plugin,hook:'init',sub:'transport'},function( args, done ){
    initTransport(args.options, done)
  })


  seneca.add({init:plugin},function( args, done ){
    var seneca = this
    seneca.act(
      {role:plugin,hook:'init',sub:'transport',options:options},
      function( err ){
        if( err ) return done(err);

        done(null)
      })
  })


  seneca.add({role:'seneca',cmd:'close'},function(args,done){
    if( transport && _.isFunction( transport.close ) ) {
      transport.close(done)
    }
    else return done(null)
  })


  return {
    name:plugin
  }
}
