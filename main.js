const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow

// require('electron-debug')({showDevTools: true, enabled: true})

const path = require('path')
const url = require('url')
const {ipcMain} = require('electron')
const osc = require('osc')

let mainWindow, textWindow
let outPythonPort = 7777, 
    outTidalPort = 7777, 
    outLuaPort = 7777, 
    outGLSLPort = 7777, 
    inAllPort = 8888

let extraIP = "192.168.1.10"
let extraSend = false

/*************************
Functions for Electron Creation
*************************/

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    transparent: true,
    frame: true,
    hasShadow: false
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
  // console.log(displays)
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
  // console.log(arg)
  udpPort.send({
    address: '/python',
    args: [arg]
  }, '127.0.0.1', outPythonPort)
})

ipcMain.on('tidal', (event, arg) => {
  console.log(arg)
  udpPort.send({
    address: '/tidal',
    args: [arg + '\n']
  }, '127.0.0.1', outTidalPort)
  
  if(true === extraSend){
      udpPort.send({
      address: '/tidal',
      args: [arg + '\n']
    }, extraIP, outTidalPort)
  }
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

ipcMain.on('highlighting', (event, arg) => {
  if (textWindow) { textWindow.webContents.send('highlighting', arg) }
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
 // console.log('An OSC Message was received!', oscMsg)
 if (mainWindow)
  if (oscMsg.address === '/tidal_feedback') {
    mainWindow.webContents.send('feedback', {
      type: 'tidal',
      msg: oscMsg.args[0]
    })
  } else if (oscMsg.address === '/tidal_rewrite') {
    mainWindow.webContents.send('tidal_rewrite', {
      type: 'tidal', 
      msg: oscMsg.args[0]
    })
  } else if (oscMsg.address === '/python_feedback') {
    mainWindow.webContents.send('feedback', {
      type: 'python',
      msg: oscMsg.args[0]
    })
  } else if (oscMsg.address === '/python_graph') {
    mainWindow.webContents.send('graph', {
      type: 'python',
      msg: oscMsg.args[0]
    })
  } else if (oscMsg.address === '/python_graph/destroy') {
    mainWindow.webContents.send('graph_destroy', {
      type: 'python',
      msg: oscMsg.args[0]
    })
  } else if (oscMsg.address === '/python_graph/create') {
    mainWindow.webContents.send('graph_create', {
      type: 'python',
      msg: oscMsg.args[0]
    })
  } else if (oscMsg.address === '/python_graph/disconnect') {
    mainWindow.webContents.send('graph_disconnect', {
      type: 'python',
      msg: oscMsg.args[0]
    })
  } else if (oscMsg.address === '/python_graph/connect') {
    mainWindow.webContents.send('graph_connect', {
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
