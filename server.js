var server = require('http').createServer();  
var io = require('socket.io')(server, {
    cors: {
        methods: ["GET", "POST"],
        credentials: true,
        origin: '*'
      }
});

io.on('connection', function(client) {
  client.on('msg', function(data) {
      console.log(data);
  });
});

server.listen(5000);