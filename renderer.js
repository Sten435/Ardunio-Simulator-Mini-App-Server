const { ipcRenderer } = require('electron')
ipcRenderer.on('success', (event, arg) => {
  var el = document.createElement("DIV");
  el.innerHTML = arg
  document.body.appendChild(el);
  alert(arg)
})
let sendData = ()=>{
  ipcRenderer.send('message', 'startConn')
}