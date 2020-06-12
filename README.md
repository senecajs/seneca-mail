# @seneca/mail


Send emails with templates.


[![Build Status](https://travis-ci.org/senecajs/seneca-mail.svg?branch=master)](https://travis-ci.org/senecajs/seneca-mail)
[![Coverage Status](https://coveralls.io/repos/github/senecajs/seneca-mail/badge.svg?branch=master)](https://coveralls.io/github/senecajs/seneca-mail?branch=master)
<a href="https://codeclimate.com/github/senecajs/seneca-mail/maintainability"><img src="https://api.codeclimate.com/v1/badges/70f83e6658979f229707/maintainability" /></a>
[![DeepScan grade](https://deepscan.io/api/teams/5016/projects/12281/branches/187929/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=5016&pid=12281&bid=187929)
[![dependencies Status](https://david-dm.org/senecajs/seneca-mail/status.svg)](https://david-dm.org/senecajs/seneca-mail)



Updated plugin - WORK IN PROGRESS



<!--START:options-->


## Options

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
```js


seneca.use('mail', { name: value, ... })


```


<small>Note: <code>foo.bar</code> in the list above means 
<code>{ foo: { bar: ... } }</code></small> 



<!--END:options-->


<!--START:action-list-->


## Action Patterns

* [sys:mail,hook:render](#-sysmailhookrender-)
* [sys:mail,send:mail](#-sysmailsendmail-)


<!--END:action-list-->

<!--START:action-desc-->


## Action Descriptions

### &laquo; `sys:mail,hook:render` &raquo;

No description provided.



----------
### &laquo; `sys:mail,send:mail` &raquo;

No description provided.



----------


<!--END:action-desc-->





