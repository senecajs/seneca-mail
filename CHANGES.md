# Changes

## 3.0.0 2026-11-21

First entry of this change log. Earlier versions are on npm and in the git
history.

* Seneca 4: the peer dependency is `seneca` `^4.0.0` (2.4.0 had no peer and
  was tested on Seneca 3). Seneca 3 users stay on `@seneca/mail@2`.
* Optional peer dependency `@seneca/entity` `^29.0.0`. The mail history
  (option `history`, on by default) is saved as `sys/mailhist` entities, so
  load the entity plugin by its full name: `seneca.use('@seneca/entity')`.
* Node.js 24 or later (`engines.node` `>=24`).
* The option defaults are plain values and the `valid` builders that Seneca
  passes, instead of Joi (B2). Seneca 4 passes no Joi, so 2.4.0 stopped at
  load with `Cannot read properties of undefined (reading 'boolean')`.
  `email` stays open: keys other than `send` and `preview` are passed to
  email-templates and nodemailer. `makehist` defaults to a function that adds
  nothing. Unknown top-level options are rejected with
  `invalid_plugin_option`.
* `seneca.depends('promisify')` is removed (D4); promises are built into
  Seneca 4.
* Message ids come from `crypto.randomUUID()`. The `uuid` package was used
  but not declared, and resolved only through the dependencies of
  email-templates.
* Tests run on `node:test` with the line coverage threshold of 80% for
  `mail.js` (was lab 22, which does not run on Node.js 24). New tests check
  the mail history with `makehist`, and an `email` option that is passed
  through. They load `@seneca/entity` by its full name and no longer use
  `promisify` or the removed `legacy.transport` option (D3, D4).
  devDependencies: `seneca` `^4.0.0`, `@seneca/entity` `^29.0.0`,
  `seneca-plugin-validator` `^0.7.0` and `@seneca/doc` `^9.0.0`;
  `@hapi/lab`, `@hapi/code`, `seneca-entity` and `seneca-promisify` are
  removed.
* `package-lock.json` is no longer committed. The obsolete `.travis.yml` and
  the generated `test/coverage.html` are removed. `publishConfig.access` is
  `public`, and the package includes `CHANGES.md`.
