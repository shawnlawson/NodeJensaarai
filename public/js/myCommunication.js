const {ipcRenderer} = require('electron')

  ///////////////////////////////////////////////////////////////////
  // Outgoing
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

function sendNewOSCPorts(data) {
  ipcRenderer.send('newPorts', data)
}

function sendUpdateWindow(data) {
  ipcRenderer.send('window', data)
}

  ///////////////////////////////////////////////////////////////////
  // Incoming
  ///////////////////////////////////////////////////////////////////
ipcRenderer.on('feedback', (event, arg) => {
  feedback.setValue(arg.msg, 1)
   if (arg.type === 'tidal') {
  //   var l = feedback.session.getLength()
  //   feedback.session.insert({
  //     row: l,
  //     column: 0
  //   }, arg.msg + '\n')
  //   if (l > 400) {
  //     feedback.session.removeLines(0, 100)
  //   }
  //   feedback.scrollToLine(l, false, true, function () {})
  //   feedback.session.selection.clearSelection()
  } else if (arg.type === 'glsl') {
    setLineErrors(arg.msg, 49)
  }
})

