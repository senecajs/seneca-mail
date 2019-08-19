
var Seneca = require('Seneca')

run()

async function run() {
  var si = await Seneca({ legacy: { transport: false } })
      .use('promisify')
      .use('..', {
        email: {
          send: false,
/*
          transport: {
            name: 'sendgrid',
            options: {
              apiKey: process.env.SENDGRID_API_KEY
            }
          }
*/
          
        }
      })
      .message('sys:mail,hook:render,code:foo', async function (msg) {
        return {html: `Foo ${msg.content.bar} ooF` }
      })
      .ready()

  var res = await si.post('sys:mail,send:mail', {
    code: 'foo',
    to: 'richard@ricebridge.com',
    from: 'info@voxgig.com',
    content: {
      bar: 'BarraB'
    }
  })

  console.log(res)
}
