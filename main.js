const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')
const {ipcMain} = require('electron')
const osc = require('osc')

let mainWindow, textWindow
let outPythonPort = 7777, 
    outTidalPort = 7778, 
    outLuaPort = 7779, 
    outGLSLPort = 7780, 
    inAllPort = 8888

/*************************
Functions for Electron Creation
*************************/

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 600,
    transparent: true
  })

  mainWindow.setMenu(null)

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'public/index.html'),
    protocol: 'file:',
    slashes: true,
    hash: '-L96f9MrXfXSkw97cLp1'
  }))

  // mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
    textWindow = null
  })

  createOutputWindow()
}

function createOutputWindow () {
  let displays = electron.screen.getAllDisplays()
  let extraDisplays = displays.find((display) => {
    return display.bounds.x !== 0 || display.bounds.y !== 0
  })

  if (extraDisplays) {
    textWindow = new BrowserWindow({
      x: extraDisplays.bounds.x,
      y: extraDisplays.bounds.y,
      width: extraDisplays.bounds.width,
      height: extraDisplays.bounds.height,
      // 'node-integration': true,
      transparent: true,
      hasShadow: false,
      frame: false,
      // skipTaskbar: true,
      toolbar: false
      // alwaysOnTop: true
    })

    textWindow.setMenu(null)

    textWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'public/text.html'),
      protocol: 'file:',
      slashes: true
    }))

    textWindow.hide()
  }
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
Interprocess communication between main and windows
*************************/
ipcMain.on('change', (event, arg) => {
  // console.log(arg)
  if (textWindow) { textWindow.webContents.send('change', arg) }
})

ipcMain.on('python', (event, arg) => {
  console.log(arg)
  udpPort.send({
    address: '/command',
    args: [arg]
  }, '127.0.0.1', outPythonPort)
})

ipcMain.on('tidal', (event, arg) => {
  console.log(arg)
  udpPort.send({
    address: '/tidal',
    args: [arg + '\n']
  }, '127.0.0.1', outTidalPort)
})

ipcMain.on('lua', (event, arg) => {
  console.log(arg)
  udpPort.send({
    address: '/lua',
    args: [arg]
  }, '127.0.0.1', outLuaPort)
})

ipcMain.on('glsl', (event, arg) => {
  console.log(arg)
  udpPort.send({
    address: '/glsl',
    args: [arg + '\n']
  }, '127.0.0.1', outGLSLPort)
})

ipcMain.on('newPorts', (event, arg) =>{
  console.log(arg)
  outPythonPort = arg.python 
  outTidalPort = arg.tidal 
  outLuaPort = arg.lua 
  outGLSLPort = arg.glsl
  if ( inAllPort !== arg.receive ) {
    inAllPort = arg.received
    udpPort.close()
    udpPort = new osc.UDPPort({
      localAddress: '0.0.0.0',
      localPort: inAllPort
    })
    udpPort.open()
  }
})

ipcMain.on('window', (event, arg) => {
  // console.log(arg)
  if (arg === true)
    textWindow.show() 
  else
    textWindow.hide() 
})

/*************************
OSC functions
*************************/
var udpPort = new osc.UDPPort({
  localAddress: '0.0.0.0',
  localPort: inAllPort
})

udpPort.on('bundle', function (oscBundle, timeTag, info) {
  console.log('An OSC bundle just arrived for time tag', timeTag, ':', oscBundle)
  console.log('Remote info is: ', info)
})

udpPort.on('message', function (oscMsg) {
 //console.log('An OSC Message was received!', oscMsg.args[0])
  if (oscMsg.address === '/tidal_feedback') {
    mainWindow.webContents.send('feedback', {
      type: 'tidal',
      msg: oscMsg.args[0]
    })
  } else if (oscMsg.address === '/python_feedback') {
    mainWindow.webContents.send('feedback', {
      type: 'python',
      msg: oscMsg.args[0]
    })
  } else if (oscMsg.address === '/lua_feedback') {
    mainWindow.webContents.send('feedback', {
      type: 'lua',
      msg: oscMsg.args[0]
    })
  } else if (oscMsg.address === '/glsl_feedback') {
    mainWindow.webContents.send('feedback', {
      type: 'glsl',
      msg: oscMsg.args[0]
    })
  }
})

udpPort.on('ready', function () {
  // udpPort.send({
  //   address: '/command',
  //   args: ['default', 100]
  // }, '127.0.0.1', 6666)
})

udpPort.open()
