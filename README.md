# @seneca/mail

[![npm version](https://img.shields.io/npm/v/@seneca/mail.svg)](https://npmjs.com/package/@seneca/mail)
[![build](https://github.com/senecajs/seneca-mail/actions/workflows/build.yml/badge.svg)](https://github.com/senecajs/seneca-mail/actions/workflows/build.yml)
[![Known Vulnerabilities](https://snyk.io/test/github/senecajs/seneca-mail/badge.svg)](https://snyk.io/test/github/senecajs/seneca-mail)
[![Coverage Status](https://coveralls.io/repos/github/senecajs/seneca-mail/badge.svg?branch=master)](https://coveralls.io/github/senecajs/seneca-mail?branch=master)
[![DeepScan grade](https://deepscan.io/api/teams/5016/projects/12281/branches/187929/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=5016&pid=12281&bid=187929)

| ![Voxgig](https://www.voxgig.com/res/img/vgt01r.png) | This open source module is sponsored and supported by [Voxgig](https://www.voxgig.com). |
|---|---|

## Install

```
npm install @seneca/mail
```
## Quick Example

```
seneca.use('mail', {
  email: { send: true }
})
```
## More Examples

See [test/](test/) for usage examples.

## Motivation

Send emails with templates from Seneca microservices.

## Support

If you're using this module and need help, you can:

- Post a [github issue](https://github.com/senecajs/seneca-mail/issues)
- Tweet to [@senecajs](http://twitter.com/senecajs)
- Ask on the [Gitter](https://gitter.im/senecajs/seneca)


## API

### Options

* `test` : boolean <i><small>false</small></i>
 : Test mode.
* `history` : boolean <i><small>true</small></i>
 : Save mail history to `sys/mailhist` entity.
* `makehist` : function <i><small></small></i>
 : Add properties to `sys/mailhist` entity.
* `logmail` : boolean <i><small>true</small></i>
 : Log mail sending at info level.
* `email.send` : boolean <i><small>false</small></i>
 : Send email (for safety, off by default).
* `email.preview` : boolean <i><small>false</small></i>
 : Preview email.

Set plugin options when loading with:
```
seneca.use('mail', { name: value, ... })

```
<small>Note: <code>foo.bar</code> in the list above means 
<code>{ foo: { bar: ... } }</code></small> 

<!--END:options-->

<!--START:action-list-->

### Action Patterns

* [sys:mail,hook:render](#-sysmailhookrender-)
* [sys:mail,send:mail](#-sysmailsendmail-)

<!--END:action-list-->

<!--START:action-desc-->

### Action Descriptions

### &laquo; `sys:mail,hook:render` &raquo;

No description provided.

----------
### &laquo; `sys:mail,send:mail` &raquo;

No description provided.

----------

<!--END:action-desc-->

## Contributing

The [Senecajs org][] encourages open participation. If you feel you can help in any way, be it with documentation, examples, extra testing, or new features please get in touch.

### Running tests

```
npm run test
```
## Background

Supports multiple email transports via [nodemailer](https://nodemailer.com/).

