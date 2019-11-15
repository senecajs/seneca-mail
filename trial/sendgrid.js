
var Seneca = require('Seneca')

run()

async function run() {
  var si = await Seneca({ logger:'flat', log: 'debug', legacy: { transport: false } })
      .use('promisify')
      .use('..', {
        email: {
          send: false,
          transport: {
            name: 'sendgrid',
            options: {
              apiKey: process.env.SENDGRID_API_KEY
            }
          }
        }
      })
      .message('sys:mail,hook:render,code:foo', async function (msg) {
        if('html' === msg.part) {
          return {html:`<h1>Foo</h1> ${msg.content.bar} ooF`}
        }
      })
      .ready()

  var res = await si.post('sys:mail,send:mail', {
    code: 'foo',
    to: 'richard@ricebridge.com',
    from: 'info@voxgig.com',
    subject: 'QAZ',
    content: {
      bar: 'BarraB'
    }
  })

  console.log(res)
}
