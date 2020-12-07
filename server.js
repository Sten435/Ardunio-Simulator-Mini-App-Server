var express = require('express');  
var app = express();  
var server = require('http').createServer(app);  
var io = require('socket.io')(server, {
    cors: {
        methods: ["GET", "POST"],
        credentials: true,
        origin: '*',
      }
});

app.get('/', function(req, res) {  
    res.send('Server')
});

io.on('connection', function(client) {
  client.on('msg', function(data) {
      console.log(data);
  });
});

server.listen(5000);