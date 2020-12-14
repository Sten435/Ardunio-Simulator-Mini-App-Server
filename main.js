const { app, BrowserWindow, Notification, ipcMain } = require('electron')

var server = require('http').createServer();
const usbDetect = require('usb-detection');
const serialIo = require('serial-io');
const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline

function createWindow () {
  const win = new BrowserWindow({
    width: 400,
    height: 315,
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.loadFile('index.html')
  // win.webContents.openDevTools()

  return win
}

app.whenReady().then(()=>{
  let win = createWindow()
    ipcMain.on('message', (event, arg) => {
      if(arg === 'startConn'){
        openSerial(win)
      }
    });

    ipcMain.on('connect', (event, arg) => {
      if(server.listening){
        win.webContents.send('server_is_open')
      }
      usbDetect.startMonitoring();

      serialIo.ports().then(path=>{
        event.sender.send('path', path)
      })

      usbDetect.on('remove', function (){
        setTimeout(() => {
          // const notification = {
          //   title: 'Device Removed'
          // }
          // new Notification(notification).show()
          serialIo.ports().then(path=>{
            event.sender.send('path', path)
          })
        }, 400);
      });
      usbDetect.on('add', function (){
        setTimeout(() => {  
          // const notification = {
          //   title: 'Device Connected'
          // }
          // new Notification(notification).show()

          serialIo.ports().then(path=>{
            event.sender.send('path', path)
          })
        }, 400);
      });
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

let openSerial = ((win)=>{
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
              ipcMain.on('connect', (event, arg) => {
                serialIo.ports().then(path=>{
                  event.sender.send('path', path)
                })
              });
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
          win.webContents.send('bautrate', bautrate)
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
            serialport.on('close', function(){
              //Server Closed
            })
    
            client.on('sendDdata', function(data){
              // serialport.write('13')
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
    
    if(!server.listening){
      server.listen(5000);
    }

    return true
    
})