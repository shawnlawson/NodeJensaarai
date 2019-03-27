const {ipcRenderer} = require('electron')
const osc = require('osc')

///////////////////////////////////////////////////////////////////
// OSC Outgoing
///////////////////////////////////////////////////////////////////
var udpPort = new osc.UDPPort({
                      localAddress: "0.0.0.0",
                      localPort: 8888
                  })

udpPort.on("ready", () => {
    console.log("OSC Send Ready");    
})

udpPort.on("error", (error) => {
    console.log("Error: ", error.message);
})

udpPort.open()

function sendCode() {
  var message = {address: '/'+mLanguage,
                  args: [{type: 's',
                          value: mCode
                        }]
                }

//TODO::: fix ports
  if (mLanguage === 'tidal'){
    udpPort.send(message, '127.0.0.1', 7778)
  } 
  else if (mLanguage === 'glsl' || mLanguage === 'python') {
    udpPort.send(message, '127.0.0.1', 7777)
  }
}


///////////////////////////////////////////////////////////////////
// OSC Incoming
///////////////////////////////////////////////////////////////////

udpPort.on('message', (oscMsg) => { 
  if (oscMsg.address === '/python_feedback') {
    feedback.setValue(oscMsg.args[0], 1)
  } 
  else if (oscMsg.address === '/tidal_feedback') {
    feedback.setValue(oscMsg.args[0], 1)
  } 
  else if (oscMsg.address === '/glsl_feedback') {
    feedback.setValue(oscMsg.args[0], 1)
    setLineErrors(oscMsg.args[0], 50)
  } 
  else if (oscMsg.address === 'tidal_rewrite') {
    replaceTidalCode(oscMsg.args[0])
  }
})


///////////////////////////////////////////////////////////////////
// For browser window
///////////////////////////////////////////////////////////////////
editor.on('change', (event) => {
  var timestamp = Date.now()
  var data = {'p': 'c', 't': timestamp, 'd': event}
  ipcRenderer.send('change', data)
})

editor.on('changeSelection', (event) => {
  var timestamp = Date.now()
  var data = {'p': 'u', 't': timestamp, 'd': editor.session.selection.getRange(), 'b': editor.session.selection.isBackwards() + 0}
  ipcRenderer.send('change', data)
})

editor.myBackMarkerListener = true

editor.session.on('changeBackMarker', function (event) {
  if (!editor.myBackMarkerListener) { return }
  var timestamp = Date.now()
  var marks = editor.session.getMarkers(false) // false for back markers
  for (var m in marks) {
    if (marks[m].clazz.indexOf('other-client-') > -1) {
      var r = new Range.fromPoints(marks[m].range.start.getPosition(), marks[m].range.end.getPosition())
      var data = {'p': 'o', 't': timestamp, 'd': r, 'c': marks[m].clazz}
      ipcRenderer.send('change', data)
    }
  }
})

editor.commands.on('afterExec', function (event) {
  if (event.command.name === 'execLine' ||
      event.command.name === 'execBlock') {
    var timestamp = Date.now()
    var data = {'p': 'e', 
                't': timestamp, 
                'a': event.command.name, 
                'd': editor.session.selection.getRange(),
                'l': mLanguage}
    ipcRenderer.send('change', data)
  }
})

editor.session.on('changeScrollLeft', (number) => {
  var timestamp = Date.now()
  var data = {'p': 's', 
              't': timestamp, 
              'n': number, 
              'y': 'left'}
  ipcRenderer.send('change', data)
})

editor.session.on('changeScrollTop', (number) => {
  var timestamp = Date.now()
  var data = {'p': 's', 
              't': timestamp, 
              'n': number, 
              'y': 'top'}
  ipcRenderer.send('change', data)
})

function sendNewHighlighting(data) {
  ipcRenderer.send('highlighting', data)
}

ipcRenderer.on('initAsk', (event, arg) => {
  ipcRenderer.send('initReply', {code: editor.getSession().getValue()})
})