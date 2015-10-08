var seneca = require('seneca')()

seneca.use('..',{
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
//    host: "127.0.0.1",
//    port: 25,
//    ignoreTLS: true
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
