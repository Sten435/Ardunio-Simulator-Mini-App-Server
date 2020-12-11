var server = require('http').createServer();
const usbDetect = require('usb-detection');
const serialIo = require('serial-io');
const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline
var io = require('socket.io')(server, {
    cors: {
        methods: ["GET", "POST"],
        credentials: true,
        origin: '*'
      }
});

io.on('connection', function(client) {
  usbDetect.startMonitoring();

  usbDetect.on('add', function (){
      setTimeout(() => {  
        serialIo.ports().then(path=>{
          client.emit('device_added', path)
        })
      }, 500);
  })
 
  usbDetect.on('remove', function (){
      setTimeout(() => {  
        serialIo.ports().then(path=>{
          client.emit('device_removed', path)
        })
    }, 500);
  });

  client.on('portData_bautData', ((data)=>{
    let port = data.PORTValue
    let bautrate = data.BautrateValue
    const parser = new Readline()
    const serialport = new SerialPort(port, { 
      baudRate: parseInt(bautrate),
      lock: false
    })
    serialport.on('open', function(){
      
      serialport.pipe(parser)
        parser.on('data', ((data)=>{
          client.emit('mainDataFromLocalServer', data)
        }))
        client.on('disconnectPort', function(){
          serialport.destroy()
        })

        serialport.on('error', function(err){
          console.log(err);
        })
    })
  }))

  client.on('Request_ports', function(){
    setTimeout(() => {  
      serialIo.ports().then(path=>{
        client.emit('sendPort', path)
      })
    }, 500);
  })
});

server.listen(5000);