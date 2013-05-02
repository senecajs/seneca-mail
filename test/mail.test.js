/* Copyright (c) 2013 Richard Rodger */
"use strict";


// mocha mail.test.js


var seneca  = require('seneca')

var assert  = require('chai').assert

var gex     = require('gex')










describe('mail', function() {
  

  it('happy', function( done ){
    seneca()
      .use('..')
      .ready( function(err,si){ 
        assert.isNull(err)

        var mail = si.pin({role:'mail',cmd:'*'})
        mail.generate({code:'foo',content:{foo:'bar'}},function(err,out){
          assert.isNull(err)
          //console.dir(out)
          assert.equal( '<h1>Foo: bar</h1>\n', out.html )
          assert.equal( 'Foo: bar\n', out.text )
          done()
        })
      })
  })

  it('content', function( done ){
    seneca()
      .use('..',{content:{bar:{a:1}}})
      .ready( function(err,si){ 
        assert.isNull(err)

        var mail = si.pin({role:'mail',cmd:'*'})
        mail.generate({code:'bar'},function(err,out){
          assert.isNull(err)
          //console.dir(out)
          assert.equal( '<div>a:1</div>', out.html )
          assert.equal( 'a:1', out.text )
          done()
        })
      })
  })

  
})
