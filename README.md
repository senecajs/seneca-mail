# seneca-mail

## An email plugin for the [Seneca](http://senecajs.org) toolkit

This module is a plugin for the Seneca framework. It provides email capability for actions. It's also a good example of how you can provide different implementations for a plugin's functionality.

With this module you can:

   * Compose email from templates
   * Send email using various service providers

Each email template is identified by a _code_. The code is the unique identifier for each type of email template that you send.
If you are sending a completely custom, dynamically generated email, then you can omit the code.

The default implementation uses the
[email-templates](http://niftylettuce.github.io/node-email-templates/) module to compose email and the
[nodemailer](http://www.nodemailer.com/) module to send it. You can customize this by overriding the appropriate actions.

For a customization example, see the
[seneca-postmark-mail](https://github.com/rjrodger/seneca-postmark-mail). It
shows how you can use the Seneca action pattern-matching concept to easily integrate and
customize plugins, without needing to learn complex APIs. 


This module can be used in a standalone fashion, but is most often
used with the [seneca-user](http://github.com/rjrodger/seneca-user)
plugin to handle transaction emails for user accounts, such as welcome
mails and password reminders.


## Support

If you're using this module, feel free to contact me on twitter if you
have any questions! :) [@rjrodger](http://twitter.com/rjrodger)

Current Version: 0.1.1 

Tested on: node 0.10.6, seneca 0.5.6

[![Build Status](https://secure.travis-ci.org/rjrodger/seneca-mail.png)](http://travis-ci.org/rjrodger/seneca-mail)



## Quick example

This example uses a standard Gmail account to send the email. Use your own details for testing, but don't persist them anywhere!

```JavaScript
var seneca = require('seneca')()

seneca.use('mail',{
  folder: './email-templates',
  mail: {
   from: 'help@example.com'
  },
  config:{
    service: "Gmail",
    auth: {
      user: "admin@example.com",
      pass: "PASSWORD"
    }
  }
})


seneca.ready(function(err){
  if( err ) return console.log(err);

  seneca.act({
    role:'mail',
    cmd:'send',
    code:'welcome',
    to:'customer1@example.com',
    subject:'Welcome!',
    content:{
      name:'Customer One'
    }
  })
})
```

The _role:mail, cmd:send_ action sends out an email. The _code_
identifies the email template that you want to use. You can also just
provide the email body directly by providing _html_ or _text_ argument
containing an HTML or plaintext body string.

The tradition email fields are what you would expect:

   * _to_: to email address
   * _from_: from email address - you can set this once in the plugin configuration, as per the example
   * _subject_: email subject line

If you are using a template, the concrete values to insert into the template are taken from the properties of the _content_ argument.

To use templates, create a folder in your project called _email-templates_, containing the sub-folder and file
_welcome/html.ejs_:

```HTML
<h1>Hello <%=name%>!</h1>
Welcome to our service!
```

This is the email template that generates the final text of the email that will be sent. You can use HTML to make your emails look nicer. You also use plain text by creating a _welcome/text.ejs_ version of the email template file.


To run this example, install the _seneca-mail_ module as below, copy
the _test/readme.js_ file into your own project, update the
configuration with real values, and run from the command line with

```sh
node readme.js
```


## Deeper example

Take a look at the <a
href="http://github.com/rjrodger/seneca-examples">user accounts
example</a> to see how this module provides with transactional email
for user account functionality.



## Install

```sh
npm install seneca
npm install seneca-mail
```

You'll need the [seneca](http://github.com/rjrodger/seneca) module to use this module - it's just a plugin.



## Usage

To load the plugin:

```JavaScript
seneca.use('mail', { ... options ... })
```

To isolate logging output from the plugin, use:
```bash
node your-app.js --seneca.log=plugin:mail
```

For more logging options, see [Seneca logging tutorial](http://senecajs.org/logging-example.html).
You may wish to log email activity to a separate file for audit purposes.


## Options

   * _folder_: contains email template sub-folders, default: _'./email-templates'_. 
   * _content_: insertion values for all email templates (saves repetition), default: _{}_. 
     * non-string sub-objects allow for email specific content (using email _code_ as property name), for example: {content:{welcome:{subject:'Howdy!'}}}
   * _mail: fields for all emails, good place for a common from address, default: _{}_.
   * _transport_: the _nodemailer_ transport, default: _'smtp'_.
   * _config_: the _nodemailer_ configuration, default: _{}_.

If you are using a customer email template generator then the _folder_ option may not be needed.

If you are using a different email module, the _transport_ and _config_ options may not be needed.



## Actions

All actions provide results via the standard callback format: <code>function(error,data){ ... }</code>.


### role:mail, cmd:send

Send an email. Arguments override default settings in the _mail_ plugin option.


#### Arguments:
   
   * _code_: template code, name of the sub-folder of the email templates folder
   * _content_: insertion values for the email template
   * _html_ and/or _text_: literal body of the email, only used if there's no _code_ argument (_content_ is also ignored in this case)
   * _to_: to email address, overrides _options.mail.to_ 
   * _from_: from email address, overrides _options.mail.from_ 
   * _cc_: from email address, overrides _options.mail.cc_ 
   * _bcc_: from email address, overrides _options.mail.bcc_ 
   * _replyTo_: reply to email address, overrides _options.mail.replyTo_ 
   * _subject_: email subject line, overrides _options.mail.subject_ 

#### Provides:

Object with properties:

   * _ok_: true if send succeeded, false if not
   * _details_: underlying email module response data, if any

#### Sub Actions:

   * _role:mail, cmd:generate_: to generate the literal email body

#### Hooks:

   * _role:mail, hook:send_: to send the email, providing the literal email body as _html_ and _text_ arguments



### role:mail, cmd:generate

Generate literal email HTML and plain text from a template.


#### Arguments:
   
   * _code_: template code, name of the sub-folder of the email templates folder
   * _content_: specific insertion values for this email, overrides and extends values in _options.content_

#### Provides:

Object with properties:

   * _ok_: true if generate succeeded, false if not
   * _html_: literal HTML email body, generated from template by inserting content values
   * _text_: literal plain text email body, generated from template by inserting content values

#### Sub Actions:

None.

#### Hooks:

   * _role:mail, hook:content_: to customize content generation 





## Logging

To see what this plugin is doing, try:

```sh
node your-app.js --seneca.log=plugin:mail
```

This will print action logs and plugin logs for the user plugin. To skip the action logs, use:

```sh
node your-app.js --seneca.log=type:plugin,plugin:mail
```

You can also set up the logging programmatically:

    var seneca = require('seneca')({
      log:{
        map:[
          {plugin:'mail',handler:'print'}
        ]
      }
    })

For more on logging, see the [seneca logging example](http://senecajs.org/logging-example.html).




### Customization

As with all seneca plugins, you can customize behavior simply by overwriting actions.
However, this plugin also provides customization hooks, which are sub actions called by the main _cmd_ actions.

To see these in action, review the code of the
[seneca-postmark-mail](https://github.com/rjrodger/seneca-postmark-mail)
module, which shows you how to use these hooks to send email using a
different module.


### role:mail, hook:send

Actually send email


#### Arguments:
   
   * _html_: literal HTML email body
   * _text_: literal plain text email body
   * ALL: used by underlying mail module

#### Provides:

As per action _role:mail, cmd:send_.



### role:mail, hook:content

Modify or provide email content for template insertion


#### Arguments:
   
   * _code_: template code
   * _content_: merged content from action arguments and options

#### Provides:

Object with content values.



### role:mail, hook:init

Initialize plugin. Calls _role:mail, hook:init, sub:templates_ and
_role:mail, hook:init, sub:transport_ in sequence.


#### Arguments:
   
   * _options_: plugin options

#### Provides:

Nothing.


### role:mail, hook:init, sub:templates

Initialize email templates.

#### Arguments:
   
   * _options_: plugin options

#### Provides:

Implementation dependent object.



### role:mail, hook:init, sub:transport

Initialize email transport

#### Arguments:
   
   * _options_: plugin options

#### Provides:

Implementation dependent object.




## Test

```sh
cd test
mocha mail.test.js --seneca.log.print
```

Copy sendconf.example.js and add real configuration values, and then send a mail with:

```sh
cd test
node send-mail.js --seneca.log.print
```

See the [nodemailer](http://www.nodemailer.com/) module for configuration options.


