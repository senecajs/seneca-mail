# seneca-mail

## An email plugin for the [Seneca](http://senecajs.org) toolkit

This module is a plugin for the Seneca framework. It provides email capability for actions. It's also a good example of how you can provide different implementations for a plugin's functionality.






This module is a plugin for the Seneca framework. It provides business logic for user management, such as:

   * login
   * logout
   * registration
   * password handling

There are two core concepts: user and login. A _user_, storing the user account details and encrypted passwords, 
and a _login_, representing an instance of a user that has been authenticated. A user can have multiple logins.

This module does not make any assumptions about the context it runs in. 
Use the [seneca-auth](http://github.com/rjrodger/seneca-auth) plugin to handle web and social media authentication.


## Support

If you're using this module, feel free to contact me on twitter if you
have any questions! :) [@rjrodger](http://twitter.com/rjrodger)

Current Version: 0.2.1 

Tested on: node 0.8.16, seneca 0.5.3

[![Build Status](https://secure.travis-ci.org/rjrodger/seneca-user.png)](http://travis-ci.org/rjrodger/seneca-user)



## Quick example

```JavaScript
var seneca = require('seneca')()
seneca.use('user')

seneca.ready(function(){

  var userpin = seneca.pin({role:'user',cmd:'*'})

  userpin.register( {name:"Flann O'Brien",email:'nincompoop@deselby.com',password:'blackair'}, 
  function(err,out) {

    userpin.login({email:'nincompoop@deselby.com',password:'bicycle'}, function(err,out){
      console.log('login success: '+out.ok)

      userpin.login({email:'nincompoop@deselby.com',password:'blackair'}, function(err,out){
        console.log('login success: '+out.ok)
        console.log('login instance: '+out.login)
      })
    })
  })
})
```

This example, uses a _pin_ for convenience: <code>userpin.register( ... )</code> is the same as 
<code>seneca.act({role:'user',cmd:'register', ... )</code>.

In the example code, a user is registered, and then two login attempts are made. The first with an incorrect password, the second with the correct
password. The successful login provides a login instance. The _login.token_ property can be used to authenticate this login. For example,
the [seneca-auth](http://github.com/rjrodger/seneca-auth) plugin uses this token as a HTTP authentication cookie.

To run this example (and the other code in this README), try:

```sh
node test/readme.js
```


## Deeper example

Take a look at the <a href="http://github.com/rjrodger/seneca-examples">user accounts example</a>.



## Install

```sh
npm install seneca
npm install seneca-user
```

You'll need the [seneca](http://github.com/rjrodger/seneca) module to use this module - it's just a plugin.



## Usage

To load the plugin:

```JavaScript
seneca.use('user', { ... options ... })
```

The user and login data is persisted using seneca entities. These have
names _sys_user_ and _sys_login_ by default, but can be changed in the
options.

Passwords are not stored in plaintext, but using a salted SHA hash. In
the context of password reminder functionality, this means you can
generate new passwords, but cannot recover old ones. 
[This is what you want](http://www.codinghorror.com/blog/2007/09/youre-probably-storing-passwords-incorrectly.html).

There are separate actions to encrypt and verify passwords, so you can do things your own way if you like.

To support different use cases, users can be identified by either a
_nick_ or their email address. The _nick_ property is the traditional
'username', but does not need to be used in this fashion (hence the name 'nick').



## Options

   * _user_: spec for user entity type, default: {zone:null, base:'sys', name:'user'}. 
   * _login_: spec for login entity type, default: {zone:null, base:'sys', name:'login'}. 


## Entities

### User

The user entity has a default type of _-/sys/user_ and standard properties:

   * _nick_: Username, mostly. If not provided, will be set to email value.
   * _email_: Email address. At least one of nick or email is required.
   * _name_: Name of user. Just a text field. [Cultural imperialism damages your conversions, ya know...](http://www.kalzumeus.com/2010/06/17/falsehoods-programmers-believe-about-names/)!
   * _active_: if true, user can log in, if false, user can't. Default: true.
   * _when_: creation time, ISO String, like 2013-03-21T17:32:24.039Z
   * _salt_: salt for encrypted password
   * _pass_: encrypted password

You can add your own properties, but be careful not to use the standard property names.


### Login

The login entity has a default type of _-/sys/login_ and standard properties:

   * _token_: authentication token
   * _nick_: copied from user
   * _email_: copied from user
   * _user_: user.id string
   * _when_: creation time, ISO String, like 2013-03-21T17:32:24.039Z
   * _active_: if true, login against this token will succeed, otherwise not

You can add your own properties, but be careful not to use the standard property names.



## Actions

All actions provide results via the standard callback format: <code>function(error,data){ ... }</code>.


### role:user, cmd:login

Login an existing user. Creates a new sys_login entry.

#### Arguments:
   
   * _nick_: required if no email, identifies user
   * _email_: required if no nick, identifies user
   * _password_: password as entered by user
   * _auto_: automatic login without password, default: _false_. Use this to generate login tokens.

#### Provides:

Object with properties:

   * _ok_: true if login succeeded, false if not
   * _login_: login entity, includes login.token property
   * _user_: user entity



### role:user, cmd:logout

Logout a user. Update sys_login entry to active:false. Adds login.ended field with ISOString date time.  

#### Arguments:
   
   * _token_: existing login.token, maybe from a cookie

#### Provides:

Same object format as login command result: {ok:true|false,user:,login:}



### role:user, cmd:register

Register a new user. You'll probably call this after a user fills out a regstration form. Any additional action arguments are saved as
user properties. The nick and email fields will be checked for uniqueness. The new user is not logged in, use the login action for that.


#### Arguments:
   
   * _nick_: Username, mostly. If not provided, will be set to args.username value, if defined, otherwise args.email value.
   * _email_: Email address. At least one of nick or email is required.
   * _username_: a convenience - just an alias for nick.
   * _password_: Plaintext password, supplied by user - will be encrypted.
   * _repeat_: Password, repeated. Optional - if provided, must match password.
   * _name_: Name of user. Just a text field.
   * _active_: if true, user can log in, if false, user can't. Default: true.

#### Provides:

Object with properties:

   * _ok_: true if registration succeeded, false if not
   * _user_: new user entity



### role:user, cmd:auth

Authenticate a login token, returning the associated login and user if
the token is valid and active. Use this, for example, when handling
HTTP requests with an authentication cookie, to get the user.


#### Arguments:
   
   * _token_: existing login.token, maybe from a cookie

#### Provides:

Same object format as login command result: {ok:true|false,user:,login:}


### role:user, cmd:update

Update the user's details, such as nick and/or password.


#### Arguments:
   
   * _orig_nick_: original nick, so user can be found, or use orig_email
   * _orig_email_: original email, so user can be found, or use orig_nick
   * _nick_: new nick, optional
   * _email_: new email, optional
   * _name_: new name, optional
   * _password_: new password, optional
   * _repeat_: new password, repeated. Optional - if provided, must match password


#### Provides:

Object with properties:

   * _ok_: true if update succeeded, false if not
   * _user_: user entity



### role:user, cmd:clean

Strips sensitive information from user entity. In particular, the pass, salt, and active properties.

#### Arguments:
   
None.

#### Provides:

User entity.



### role:user, cmd:encrypt_password

Encrypts a plaintext password, providing the salt and ciphertext.

#### Arguments:
   
   * _password_: plaintext password.

#### Provides:

Object with properties:

   * _salt_: the salt string
   * _pass_: the ciphertext string


### role:user, cmd:verify_password

Verifies that a password matches a given salt and ciphertext.

#### Arguments:
   
   * _salt_: the salt string to use, take this from user.salt
   * _pass_: the pass string to use, take this from user.pass
   * _proposed_: the proposed plaintext password to verify

#### Provides:

Object with properties:

   * _ok_: true if password matches







### role:user, cmd:entity

Provide an instance of the user or login entities. Used by other
plugins to get the right entity type for additional user operations.

#### Arguments:
   
   * _kind_: 'user' or 'login'

#### Provides:

Seneca entity object for user or login.




## Logging

To see what this plugin is doing, try:

```sh
node your-app.js --seneca.log=plugin:user
```

This will print action logs and plugin logs for the user plugin. To skip the action logs, use:

```sh
node your-app.js --seneca.log=type:plugin,plugin:user
```

You can also set up the logging programmatically:

    var seneca = require('seneca')({
      log:{
        map:[
          {plugin:'user',handler:'print'}
        ]
      }
    })

For more on logging, see the [seneca logging example](http://senecajs.org/logging-example.html).




### Customization

As with all seneca plugins, you can customize behavior simply by overwriting actions.

For example, to add some custom fields when registering a user:


```javascript
    // override by using the same action pattern
    seneca.add({role:'user',cmd:'register'},function(args,done){
    
      // assign user to one of 10 random "teams"
      args.team = Math.floor( 10 * Math.random() )
    
      // this calls the original action, as provided by the user plugin
      this.parent(args,done)
    })
    
    
    userpin.register( {name:"Brian O'Nolan",email:'brian@swim-two-birds.com',password:'na-gCopaleen'}, 
    function(err,out) {
      console.log('user has team: '+out.user.team)
    })
```


## Test

```sh
cd test
mocha user.test.js --seneca.log.print
```





FIX BELOW!!!


This plugin works by wrapping existing actions with a mailission checking action. If the mailission test passes, the parent
action can proceed. If not, a mailission error is generated.

The possible mailission checks are:

   * _allow_: simple yes/no
   * _act_: allow only specific actions to pass
   * _entity_: allow only specific actions on entities
   * _own_: allow on specific actions on entities that are 'owned' by given users 

This plugin also understands when it is used in a web server context, and will add a mailission specification to 
the req.seneca object if it exists.

A full example, in the context of the seneca data editor, is provided
in the [seneca examples repository](https://github.com/rjrodger/seneca-examples). TODO!


### Support

If you're using this module, feel free to contact me on twitter if you
have any questions! :) [@rjrodger](http://twitter.com/rjrodger)

Current Version: 0.1.0

Tested on: node 0.8.16, seneca 0.5.6


### Quick example

You use this plugin mainly by adding a _mail_ object to user entities:

```JavaScript
var userent = seneca.make('sys','user')

userent.find({email:'alice@example.com'}, function(err,alice){
  alice.mail = {
    act:[ 
      {foo:'bar', mail$:true},
      {qaz:'lol', mail$:false},
    ]
  }
  alice.save$()
})
```

This mailission specification allows the user alice to execute _foo:bar_ actions, but not _qaz:lol_ ones.
The _mail$_ metadata property specifies the mailissions for each action pattern in the list.

Here's another example, this time for entities:

```JavaScript
var userent = seneca.make('sys','user')

userent.find({email:'alice@example.com'}, function(err,alice){
  alice.mail = {
    entity:[ 
      {base:'shop', name:'cart', mail$:'r'},
      {base:'qaz', mail$:'crudq'},
    ]
  }
  alice.save$()
})
```

In this case, alice can only read ('r') from -/shop/cart entities, but can do anything to -/qaz/- entities.
There are more details on the [seneca data entity model](http://senecajs.org/data-entities.html) here.

Of course, this example code does not actually work, as all of the setup and configuration is missing.
Here is some working code that provides a minimal example by setting up some of the values manually.

### Working Code

This code applies a mailissions test to the _echo_ plugin. The _echo_
plugin has one action _role:echo_, that just gives you back the same
arguments you put it. The example code adds a mailission check to this
action, and shows you how to trigger it manually, using the _mail$_ argument.


```JavaScript
var seneca  = require('seneca')()
seneca.use('echo')

seneca.use( 'mail', {act:[
  {role:'echo'},
]})

seneca.act({role:'mail', cmd:'init'})

seneca.act({role:'echo', foo:'bar', mail$:{allow:true}},function(err,out){
  console.log('foo='+out.foo)
})

seneca.act({role:'echo', foo:'bar', mail$:{allow:false}},function(err,out){
  console.log(err)
})
```


The _mail$_ metadata argument is recognised by the _mail_ plugin and contains the mailission specification to test against.
Normally, you won't set this manually, but generate it using the _role:mail, cmd:makemail_ action. In a web context, this
plugin also does this for you, based on the mail property of the current user.


### Web App Code

Here's an outline of how you would use it in a
[connect](http://www.senchalabs.org/connect) app, using the _user_ and
_auth_ plugins to provide user accounts:

```JavaScript
var seneca  = require('seneca')()
var connect = require('connect')

seneca.use('user')
seneca.use('auth')

seneca.use('mail',{
  act:[{role:'echo'}]
})

seneca.use('echo')

seneca.act({role:'mail', cmd:'init'})

var app = connect()
app.use( seneca.service() )
app.listen(3000)
```

The mail plugin does not wrap other actions immediately when it is registered. Rather, you call the _role:mail, cmd:init_ action
when you're ready. First you need to add any other plugins and actions that you want to apply mailissions checking to.



## Install

```sh
npm install seneca
npm install seneca-mail
```


## Usage

This plugin has two elements. First, the options define the set of actions that mailission checks will apply to. Second, mailission
checks only occur if there is a _mail$_ metadata argument, containing a mailissions specification. 

### Mailission options

   * _act_: array of action pins (needed for both _allow_ and _act_ checks)
   * _entity_: array of entity type specifications
   * _own_: array of entity type specifications

These specify the actions to wrap. For example:

```JavaScript
seneca.use( 'mail', {act:[
  {role:'echo'}
]})
```

This wraps any action with a _role:echo_ argument, which means that it will have a mailission check applied.

<b>You need to specify explicitly the actions to which you wish to apply mailission checks.</b>

As a convenience, you can apply mailission checks to entities by simply specifying their zone, base and name (all optional):

```JavaScript
seneca.use( 'mail', {entity:[
  {base:'sys'},
  {base:'foo',name:'bar'}
]})
```

The above code specifies that actions on any entity of type -/sys/- or -/foo/bar will have an mailission check applied. 

The _entity_ option saves you from having to specify a mailission check for all the entity actions, otherwise you would have to do this:

```JavaScript
seneca.use( 'mail', {act:[
  {role:'entity',cmd:'save',base:'sys'},
  {role:'entity',cmd:'load',base:'sys'},
  {role:'entity',cmd:'list',base:'sys'},
  ...
]})
```

The allowed entity operations (create, read, update, delete, query)
are specified in the mail$ metadata argument to the entity actions
(see below).

The _own_ option works in much the same way as the _entity_ option,
except that the user must be the owner of the entity in question.
Entities should have an _owner_ property containing the identifier of the -/sys/user entity for this to work.

```JavaScript
seneca.use( 'mail', {own:[
  {base:'foo'}
]})
```


### Mailission specifications

To trigger a mailissions check, an action must contain a mail$ metadata argument. This is an object that contains one or more of the
following properties:

   * allow: boolean, true if action is mailitted.
   * act: an action router object; only matching actions can be executed
   * entity: an entity type router object, matching the entity action, and specifying the operations mailitted
   * own: an entity type router object, matching the entity action, and specifying the operations mailitted, if also owner of the entity

You do not normally construct the mail$ object directly, but instead use the _role:mail, cmd:makemail_ action to create one from a 
literal definition (you can store this in the -/sys/user entity, for example). If you store the definition in a _mail_ property on
-/sys/user, and use the mail plugin in a web context, then this is done for you automatically.


#### allow

To store as a literal, use this structure in the _mail_ property:

```JavaScript
{allow:true|false}
```

This will converted to the mail$ metadata argument, by the _role:mail, cmd:makemail_ action:

```JavaScript
{allow:true|false}
```

In general, this check is not particularly useful for individual
users, serving rather to provide a global block on certain
actions. You would do this by adding an allow property to any _mail$_
you generate.


#### act

To store as a literal, use this structure in the _mail_ property:

```JavaScript
{act:[
  { role:'...', cmd:'...', mail$:true },
  { role:'...', mail$:false },
  { foo:'bar', mail$:true },
  ...
]}
```

The _act_ sub property is an array of action pins. Each pin specifies
the argument properties to match against. The mail$ value indicates if
the action is allowed or not.

This will converted to the mail$ metadata argument:

```JavaScript
{act:router}
```

where _router_ is a [seneca router](http://senecajs.org/routing.html) TODO! (the same thing that routes action arguments to plugin functions). 
The router matches a given set of action arguments to the mailission specification.

You could construct it manually, like so:

```JavaScript
var router = seneca.util.router()
router.add( {role:'...',cmd:'...'}, true )
router.add( {role:'...'}, false )
router.add( {foo:'bar'}, true )
```

Note that as with all routers, the action arguments are matched in alphabetical order.


#### entity

To store as a literal, use this structure in the _mail_ property:

```JavaScript
{act:[
  { base:'sys', mail$:'' },
  { base:'foo', mail$:'rq' },
  { base:'foo': name:'bar', mail$:'crudq' },
  ...
]}
```

This specification is similar to the act specification above, except
that the entity type is matched against. The mailission value encodes the allowed operations. There are:

   * create (r): create new entities
   * read (r): load an entity by identifier
   * update (r): modify an entity by identifier
   * delete (r): remove an entity by identifier
   * query (r): perform queries to list multiple entites

The query (q) mailission also allows you to perform queries for the
read, update and delete operations, if you have mailission for those
too.

In the example specification above, the user has no mailissions on
-/sys/- entities, can only read and query -/foo/- entities, and
can perform any operations on -/foo/bar entities.

The mail$ metadata argument form is:

```JavaScript
{entity:router}
```

where the router is constructed in the same way as the _act_
mailission, except using the entity zone, base and name.
 The data values in the router are the _crudq_ operation
specifications.


#### entity

To store as a literal, use this structure in the _mail_ property:

```JavaScript
{act:[
  { base:'sys', mail$:'' },
  { base:'foo', mail$:'rq' },
  { base:'foo': name:'bar', mail$:'crudq' },
  ...
]}
```

This is the same as the _entity_ mailission. However, the mailissions only apply if the entity has an _owner_
property that matches the identifier of the user executing the action.

The mail plugin handles all the set up for you when used in a web context. See the _test/mail.app.js_ example code.

The mail$ metadata argument form is:

```JavaScript
{own:{
  entity:router
  owner:'...'
}}
```

Where the entity property is a router on the entity zone, base and
name, has data values of the form 'crudq', and the owner is the
identifier of the user.
 

## Test

```bash
cd test
mocha mail.test.js --seneca.log.print
```
