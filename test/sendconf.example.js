var path = require( 'path' )

module.exports = {
  send: { code: 'hello', to: 'foo@example.com' },

  folder: path.join( __dirname, 'email-templates' ),
  content: {foo: 'bar'},
  mail: {from: 'bar@example.com', subject: 'seneca-mail'},
  config: {
    service: "Gmail",
    auth: {
      user: "bar@example.com",
      pass: "password"
    }
  }
}
