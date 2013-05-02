/* Copyright (c) 2013 Richard Rodger, MIT License */
"use strict";


var _ = require('underscore')
var emailtemplates = require('email-templates')


var name = "mail"





module.exports = function( options, register ){
  var seneca = this

  options = this.util.deepextend({
    folder:'./email-templates',
    content: {}
  },options)


  var template

  
  seneca.add({role:name,cmd:'generate'},function( args, done ){
    var code     = args.code // template identifier 

    this.act({role:name,hook:'content',code:args.code,content:args.content},function(err,content){
      if( err) return done(err)

      template( code, content, function(err,html,text){
        done( err, {ok:!err, html:html, text:text} )
      })
    })
  })


  seneca.add({role:name,cmd:'send'},function( args, done ){
    if( args.code ) {
      this.act({role:name,cmd:'generate',content:content},function(err,out){
        if( err) return done(err)
        do_send(out)
      })
    }
    else do_send({html:args.html,text:args.text})


    function do_send(body) {
      done(null,body)
    }
  })


  seneca.add({role:name,hook:'content'},function( args, done ){
    var code   = args.code // template identifier 

    var content = this.util.deepextend({},options.content[code]||{},args.content||{})
    done( null, content )
  })


  
  var service = function(){}


  emailtemplates( options.folder, function( err, templateinstance ) {
    template = templateinstance

    register(err,{
      name:name,
      service:service
    })
  })
}

