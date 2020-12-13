const { app, BrowserWindow } = require('electron')
const {ipcMain} = require('electron')

function createWindow () {
  const win = new BrowserWindow({
    width: 400,
    height: 200,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.loadFile('index.html')
  win.webContents.openDevTools()
}

app.whenReady().then(createWindow).then(()=>{

    // receive message from index.html 
    ipcMain.on('message', (event, arg) => {
    if(arg === 'startConn'){
      openSerial()
    }

  });
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

let openSerial = (()=>{
    
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
    
            client.on('sendDdata', function(data){
              console.log(data)
              serialport.write("13")
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

    return true
    
})