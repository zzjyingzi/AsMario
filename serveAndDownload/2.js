const http1 = require('http');
http1.get('http://news.163.com',function (IncomingMessage){
  IncomingMessage.on('data', function (res){
    console.log(res);
  });

});
