const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow

// require('electron-debug')({showDevTools: true, enabled: true})

const path = require('path')
const url = require('url')
const {ipcMain} = require('electron')
// const osc = require('osc')

let mainWindow

/*************************
Functions for Electron Creation
*************************/

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    transparent: true,
    frame: true,
    hasShadow: true
  })

  // mainWindow.setMenu(null)

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'public/index.html'),
    protocol: 'file:',
    slashes: true,
    hash: '-L96f9MrXfXSkw97cLp1'
  }))

  // mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })

}


/*************************
Electron app functions
*************************/
app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

/*************************
Serve Local for TD
*************************/
let expressTD = require('express')
let appTD = expressTD()
let serverTD = require('http').Server(appTD)
let ioTD = require('socket.io')(serverTD)

appTD.use(expressTD.static(path.join(__dirname, 'public')))
appTD.get('/', function(req, res){
  res.sendFile('/text.html')
})

ioTD.on('connection', (socket) =>{
  console.log('connected')

  socket.on('disconnect', () => {
    console.log('user disconnected');
  })

  socket.on('initAsk', (message) =>{
      mainWindow.webContents.send('initAsk')
  })
})

serverTD.listen(8000, () => console.log('listening on 8000'))

/*************************
Interprocess communication between main and windows
*************************/
ipcMain.on('initReply', (event, arg) => {
  ioTD.emit('initReply', {msg: arg.code})
})

ipcMain.on('change', (event, arg) => {
  ioTD.emit('change', {msg: arg})
})

ipcMain.on('highlighting', (event, arg) => {
  ioTD.emit('highlighting', {msg: arg})
})
