var mCompileTimer = null
var mErrors = new Array()
var mExecs = new Array()
var mExecTimer = null
var mFeedback = false
var mLanguage = 'python'

function setShaderFromEditor() {
    var rawCode = editor.session.doc.getAllLines()
    var rawCodeLength = rawCode.length
    var cleanCode = ''
    var startExp = /(?:\h?[d][1-8]|\h?hush|\h?let|\h?bps)/ig
    var i = 0
    while (i < rawCodeLength) {
        var resultStart = startExp.exec(rawCode[i])
        if (resultStart !== null) {
            while (i < rawCodeLength - 1) {
                cleanCode += '\n'
                i++
                if (rawCode[i].length === 0 || !rawCode[i].trim()) {
                    break
                }
            }
        } else {
            cleanCode += rawCode[i] + '\n'
            i++
        }
    }
}

function setLineErrors(result, lineOffset) {
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

                var id = editor.session.addMarker(new Range(annotation.row, 0, annotation.row, 1), 'errorHighlight', 'text', false)
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
editor.session.setMode('')
editor.session.setUseWrapMode(true)
editor.session.setUseWorker(true)
editor.session.selection.clearSelection()

editor.setDisplayIndentGuides(false)
editor.setOptions({
    enableBasicAutocompletion: false,
    enableSnippets: true,
    enableLiveAutocompletion: false,
})

editor.setShowPrintMargin(false)
// editor.getSession().on('change', function (e) {
//   clearTimeout(mCompileTimer)
//   mCompileTimer = setTimeout(setShaderFromEditor, 200)
// })
editor.$blockScrolling = Infinity
editor.setOptions({
    fontSize: '12pt',
})


editor.livewriting = livewriting
editor.livewriting('create', 'ace', {}, '')

//TODO:: need to get correct language in
editor.commands.addCommand({
    name: 'execLine',
    bindKey: {
        win: 'Shift-Return',
        mac: 'Shift-Return'
    },
    exec: function() {
        if (firepad !== null) {
            audioMessageRef.push({ author: userId, exec: 'execLine', range: editor.session.selection.getRange(), backwards: editor.session.selection.isBackwards() + 0, language: mLanguage })
        }
        editor.runTidal(editor.session.selection.getRange(), 'execLine', null)
    }
})

editor.commands.addCommand({
    name: 'execBlock',
    bindKey: {
        win: 'Ctrl-Return',
        mac: 'Command-Return'
    },
    exec: function() {
        if (firepad !== null) {
            audioMessageRef.push({ author: userId, exec: 'execBlock', range: editor.session.selection.getRange(), backwards: editor.session.selection.isBackwards() + 0, language: mLanguage })
        }
        editor.runTidal(editor.session.selection.getRange(), 'execBlock', null)
    }
})

//called locally, from firebase remote, and livewriting playback
editor.runTidal = function(theRange, execType, theLanguage) {
    var theCode = ''
    var sel = new Range()
    var endExp = /(?:^\s*$)/gm
    var myCursor = editor.session.selection.getCursor()

    if (execType === 'execLine') {
        //if single line and nothing selected
        if (theRange.start.column === theRange.end.column &&
            theRange.start.row === theRange.end.row) {
            sel = theRange
        } else { //else multiline selection
            sel = theRange
            sel.start.column = 0
            sel.end.column = 1
        }
        var lines = editor.session.doc.getLines(sel.start.row, sel.end.row)
        theCode = lines.join(editor.session.doc.getNewLineCharacter())
    } else { // is block execution
        sel = theRange
        sel.start.column = 0
        sel.end.column = 0

        while (sel.start.row > 0) {
            var lineStart = editor.session.doc.getLine(sel.start.row)
            var resultStart = endExp.exec(lineStart)
            if (resultStart !== null || "" === lineStart ) {
                sel.start.row += 1
                break
            }
            sel.start.row -= 1
        }

        var lastLine = editor.session.doc.getLength()

        while (sel.end.row < lastLine) {
            var lineEnd = editor.session.doc.getLine(sel.end.row)
            // if (lineEnd.length === 0 || !lineEnd.trim()) {
            var resultStart = endExp.exec(lineEnd)
            if (resultStart !== null || "" === lineEnd) {
                break
            }
            sel.end.row += 1
        }

        var lines = editor.session.doc.getLines(sel.start.row, sel.end.row)
        theCode = lines.join(editor.session.doc.getNewLineCharacter())
        // for highlighting
        // sel.end.row -= 1
    }

    //TODO:: needed? 
    // sel.clipRows = function() {
    //     var range
    //     range = Range.prototype.clipRows.apply(this, arguments)
    //     range.isEmpty = function() {
    //         return false
    //     }
    //     return range
    // }

    //determine which language
    var langRange = JSON.parse(JSON.stringify(sel));
    var isComment = /\s*\/+/i
    var isPython = /\s*\/+\s*python/i
    var isTidal = /\s*\/+\s*tidal/i
    var isLua = /\s*\/+\s*lua/i
    var isGLSL = /\s*\/+\s*glsl/i

    while (langRange.start.row >= 0) {
        var theLine = editor.session.doc.getLine(langRange.start.row)
        if (null !== isComment.exec(theLine)) {
            if (null !== isPython.exec(theLine)) {
                mLanguage = 'python'
                break
            } else if (null !== isTidal.exec(theLine)) {
                mLanguage = 'tidal'
                break
            } else if (null !== isLua.exec(theLine)) {
                mLanguage = 'lua'
                break
            }else if (null !== isGLSL.exec(theLine)) {
                mLanguage = 'glsl'
                break
            }
        }
        langRange.start.row -= 1
    }

    var id = editor.session.addMarker(sel, 'execHighlight', 'text')
    mExecs.push(id)
    mExecTimer = setTimeout(clearExecHighLighting, 550)

    
    ipcRenderer.send(mLanguage, theCode)
}

function clearExecHighLighting() {
    while (mExecs.length > 0) {
        var mark = mExecs.pop()
        editor.session.removeMarker(mark)
    }
}

/// /////////////////////////////////
//  Tidal Feedback
/// /////////////////////////////////
var feedback = ace.edit('feedback')
feedback.setTheme('ace/theme/monokai')
// feedback.session.setMode('ace/mode/haskell')
feedback.session.setUseWrapMode(true)
feedback.session.setUseWorker(true)
feedback.session.selection.clearSelection()
feedback.setDisplayIndentGuides(false)
feedback.setShowPrintMargin(false)
feedback.$blockScrolling = Infinity
feedback.setOptions({
    fontSize: '10pt',
    readOnly: true,
    highlightActiveLine: false,
    highlightGutterLine: false,
    highlightSelectedWord: false
})
feedback.renderer.$cursorLayer.element.style.opacity = 0
$('#feedback .ace_active-line').hide()
// $('#feedback').hide()