/* Copyright (c) 2013-2014 Richard Rodger, MIT License */
'use strict';


var fs = require('fs')

var _              = require('underscore')
var emailtemplates = require('email-templates')
var nodemailer     = require('nodemailer')







module.exports = function( options ){
  var seneca = this
  var plugin = 'mail'

  options = this.util.deepextend({
    folder:    './email-templates',
    content:   {},
    mail:      {},
    transport: 'smtp',
    config: {}
  },options)




  seneca.add({role:plugin,cmd:'generate'},function( args, done ){
    var code     = args.code // template identifier

    this.act({role:plugin,hook:'content',
              code:args.code,
              content:_.extend({},options.content,options.content[code]||{},args.content)},function(err,content){
      if( err) { return done(err) }

      template( code, content, function(err,html,text){
        done( err, {ok:!err, html:html, text:text} )
      })
    })
  })


  seneca.add({role:plugin,cmd:'send'},function( args, done ){
    var seneca = this

    if( args.code ) {
      seneca.act({role:plugin,cmd:'generate',code:args.code,content:args.content},function(err,out){
        if( err) { return done(err) }
        do_send(out)
      })
    }
    else {
      do_send({html:args.html,text:args.text})
    }


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
      if( err ) { return done(err); }
      done(null,{ok:true,details:response})
    })
  })



  var template
  var transport

  function initTemplates(seneca, options, callback) {
    var folder = options.folder

    if( void 0 !== options.templates && !options.templates ) {
      seneca.log.warn('not using templates')
      return callback()
    }

    fs.stat( folder, function(err,folderstat) {
      if( err ) {
        if( 'ENOENT' === err.code ) {
          return seneca.fail({code:'no-templates-folder',folder:folder},callback)
        }
        else {
          return callback(err);
        }
      }

      if( !folderstat.isDirectory() ) {
        return seneca.fail({code:'not-a-folder',folder:folder},callback)
      }

      emailtemplates( folder, function( err, templateinstance ) {
        if( err ) { return callback(err); }

        template = templateinstance
        callback(null,template)
      })
    })
  }

  seneca.add({role:plugin,hook:'init',sub:'templates'},function( args, done ) {
    initTemplates(this, args.options, done)
  })


  function initTransport(options, callback) {
    if (options.transport === 'smtp') {
      transport = nodemailer.createTransport(options.config)
    }
    else {
      return seneca.fail({code:'transport-not-supported',transport:options.transport},callback)
    }
    callback(null,transport)
  }

  seneca.add({role:plugin,hook:'init',sub:'transport'},function( args, done ){
    initTransport(args.options, done)
  })


  seneca.add({init:plugin},function( args, done ){
    var seneca = this
    seneca.act(
      {role:plugin,hook:'init',sub:'templates',options:options},
      function( err ){
        if( err ) { return done(err); }

        seneca.act(
          {role:plugin,hook:'init',sub:'transport',options:options},
          function( err ){
            if( err ) { return done(err); }

            done(null)
          })
      })
  })


  seneca.add({role:'seneca',cmd:'close'},function(args,done){
    transport.close()

    this.prior(args,done)
  })


  return {
    name:plugin
  }
}
