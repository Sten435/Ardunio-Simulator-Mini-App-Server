const { ipcRenderer } = require('electron')

ipcRenderer.send('connect');

let sendData = ()=>{
    ipcRenderer.send('message', 'startConn');
    document.getElementById('submit').classList.add('Pressed');
    document.getElementById('submit').classList.remove('submit-hover');
    document.getElementById('submit').innerHTML = 'Listening...';
    document.getElementById('submit').setAttribute('disabled', 'disabled');
}

ipcRenderer.on('path', (event, path)=>{
  document.getElementById('paths_number').innerHTML = path.length
})

ipcRenderer.on('bautrate', (event, bautrate)=>{
  document.getElementById('bautrate_number').innerHTML = bautrate
})

ipcRenderer.on('server_is_open', (event)=>{
  document.getElementById('submit').classList.add('Pressed');
  document.getElementById('submit').classList.remove('submit-hover');
  document.getElementById('submit').innerHTML = 'Listening...';
  document.getElementById('submit').setAttribute('disabled', 'disabled');
})