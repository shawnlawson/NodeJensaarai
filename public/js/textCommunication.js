const { ipcRenderer } = require('electron')

ipcRenderer.on('change', (event, arg) => {
  if (arg.p === 'c') { // change in content
    var change = arg.d
    var text
    var range
    if (change.data) {
      console.log('do something with change.data')
    } else if (change.action === 'insert') {
      text = change.lines.join('\n')
      editor.session.doc.insert(change.start, text)
    } else if (change.action === 'remove') {
      range = Range.fromPoints(change.start, change.end)
      editor.session.doc.remove(range)
    }
  } else if (arg.p === 'u') { // cursor change
    editor.session.selection.setSelectionRange(arg.d, Boolean(event.b))
  } else if (arg.p === 'o') { // remote cursor change
          // remove old marks
    var marks = editor.session.getMarkers(false)

    for (var m in marks) {
      if (marks[m].clazz.indexOf('other-client-') > -1) {
        editor.session.removeMarker(marks[m].id)
      }
    }
          // add updated marks
    var css
    var color = '#' + event.c.substring(event.c.length - 6)
    if (arg.d.start.column === arg.d.end.column && arg.d.start.row === arg.d.end.row) {
      css = '.' + event.c + ' {\n  position: absolute;\n  background-color: transparent;\n  border-left: 2px solid ' + color + ';\n}'
      addStyleRule(css)
    } else {
      css = '.' + arg.c + ' {\n  position: absolute;\n  background-color: ' + color + ';\n  border-left: 2px solid ' + color + ';\n}'
      addStyleRule(css)
    }
    var r = Range.fromPoints(arg.d.start, arg.d.end)
    r.clipRows = function () {
      var range
      range = Range.prototype.clipRows.apply(this, arguments)
      range.isEmpty = function () {
        return false
      }
      return range
    }
    editor.session.addMarker(r, arg.c, 'text')
  } else if (arg.p === 's') { // scroll
    if (arg.y === 'left') {
      editor.session.setScrollLeft(arg.n)
    } else if (arg.y === 'top') {
      editor.session.setScrollTop(arg.n)
    }
  } else if (arg.p === 'e') {
    console.log(arg)
    editor.runTidal(arg.d, arg.a)
  }
})
