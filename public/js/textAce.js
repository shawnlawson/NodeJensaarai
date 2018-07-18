var Range = ace.require('ace/range').Range

var mErrors = new Array()
var mExecs = new Array()
var mExecTimer = null

function setLineErrors (result, lineOffset) {
  while (mErrors.length > 0) {
    var mark = mErrors.pop()
    editor.session.removeMarker(mark)
  }

  editor.session.clearAnnotations()

  if (result.mSuccess === false) {
    // var lineOffset = getHeaderSize();
    var lines = result.mInfo.match(/^.*((\r\n|\n|\r)|$)/gm)
    var tAnnotations = []
    for (var i = 0; i < lines.length; i++) {
      var parts = lines[i].split(':')

      if (parts.length === 5 || parts.length === 6) {
        var annotation = {}
        annotation.row = parseInt(parts[2]) - lineOffset
        annotation.text = parts[3] + ' : ' + parts[4]
        annotation.type = 'error'

        if (debugging) { tAnnotations.push(annotation) }

        var id = editor.session.addMarker(new Range(annotation.row, 0, annotation.row, 1), 'errorHighlight', 'fullLine', false)
        mErrors.push(id)
      }
    }

    if (debugging) {
      console.log(result.mInfo)
      editor.session.setAnnotations(tAnnotations)
    }
  }
}

/// /////////////////////////////////
//  ACE launch
/// /////////////////////////////////
var langTools = ace.require('ace/ext/language_tools')
langTools.setCompleters([langTools.snippetCompleter, langTools.keyWordCompleter])

var editor = ace.edit('editor')
editor.setTheme('ace/theme/monokai')
editor.setSelectionStyle('text')
editor.setHighlightActiveLine(false)
editor.session.setMode('ace/mode/python') //TODO, updated from main editor
editor.session.setUseWrapMode(true)
editor.session.setUseWorker(true)
editor.session.selection.clearSelection()

editor.setDisplayIndentGuides(false)
editor.setOptions({
  readOnly: true
})

editor.setShowPrintMargin(false)

editor.$blockScrolling = Infinity
editor.setOptions({
  fontSize: '12pt'
})

var delay

editor.runCode = function (theRange, execType) {
  var theCode = ''
  var sel = new Range()
  var startExp = /(?:\h?[d][1-8]|\h?hush|\h?let|\h?bps|\v)/ig
  var endExp = /\v/gi
  var myCursor = editor.session.selection.getCursor()
//TODO:: need to update this!!
  if (execType === 'execLine') {
    sel = theRange
    sel.start.column = 0
    sel.end.column = 1
    // var lines = editor.session.doc.getLines(sel.start.row, sel.end.row)
    // theCode = lines.join('\n\n')
  } else { // is block execution
    sel = theRange
    sel.start.column = 0
    sel.end.column = 0

    while (sel.start.row >= 0) {
      var lineStart = editor.session.doc.getLine(sel.start.row)
      var resultStart = startExp.exec(lineStart)
      if (resultStart !== null) {
        break
      }
      sel.start.row -= 1
    }

    var lastLine = editor.session.doc.getLength()

    while (sel.end.row < lastLine) {
      var lineEnd = editor.session.doc.getLine(sel.end.row)
      if (lineEnd.length === 0 || !lineEnd.trim()) {
        break
      }
      sel.end.row += 1
    }

    // var lines = editor.session.doc.getLines(sel.start.row, sel.end.row)
    // theCode = lines.join(editor.session.doc.getNewLineCharacter())
    // for highlighting
    sel.end.row -= 1
  }

  // sel.clipRows = function () {
  //   var range
  //   range = Range.prototype.clipRows.apply(this, arguments)
  //   range.isEmpty = function () {
  //     return false
  //   }
  //   return range
  // }

  var id = editor.session.addMarker(sel, 'execHighlight', 'text')
  mExecs.push(id)
  mExecTimer = setTimeout(clearExecHighLighting, 550)
}

function clearExecHighLighting () {
  while (mExecs.length > 0) {
    var mark = mExecs.pop()
    editor.session.removeMarker(mark)
  }
}
