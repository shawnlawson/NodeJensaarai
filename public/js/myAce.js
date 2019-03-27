var mCompileTimer = null
var mErrors = new Array()
var mExecs = new Array()
var mExecTimer = null
var mFeedback = false
var mLanguage = 'python'
var mCode = ''

var NNExecuteTimer = null
var NNBaseTime = 1000  //this is in milliseconds
var NNRandVariance = 200

function setLineErrors(result, lineOffset) {
    while (mErrors.length > 0) {
        var mark = mErrors.pop()
        editor.session.removeMarker(mark)
    }

    editor.session.clearAnnotations()

        var lines = result.match(/^.*((\r\n|\n|\r)|$)/gm)
        var tAnnotations = []
        for (var i = 0; i < lines.length; i++) {
            var parts = lines[i].split(':')

            if (parts.length === 5 || parts.length === 6) {
                var annotation = {}
                annotation.row = parseInt(parts[2]) - lineOffset
                annotation.text = parts[3] + ' : ' + parts[4]
                annotation.type = 'error'

                if (debugging) { tAnnotations.push(annotation) }
                var theLine = editor.session.doc.getLine(annotation.row)
                var id = editor.session.addMarker(new Range(annotation.row, 
                                                            0, 
                                                            annotation.row, 
                                                            theLine.length), 
                                                  'errorHighlight', 
                                                  'text', 
                                                  false)
                mErrors.push(id)
            }
        }

        if (debugging) {
            // console.log(result)
            editor.session.setAnnotations(tAnnotations)
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
editor.getSession().on('change', function (e) {
  clearTimeout(mCompileTimer)
  mCompileTimer = setTimeout(setShaderFromEditor, 200)
})
editor.$blockScrolling = Infinity
editor.setOptions({
    fontSize: '12pt',
})


editor.livewriting = livewriting
editor.livewriting('create', 'ace', {}, '')

editor.commands.addCommand({
    name: 'openFile',
    bindKey: {
        win: 'Ctrl-O',
        mac: 'Command-O'
    },
    exec: function() {
         $('#edFile').trigger('click')
    }
})

editor.commands.addCommand({
    name: 'execLine',
    bindKey: {
        win: 'Shift-Return',
        mac: 'Shift-Return'
    },
    exec: function() {
        var tempLang = whichLanguage(editor.session.selection.getRange())
        if (firepad !== null) {
            audioMessageRef.push({ author: userId, 
                                   exec: 'execLine', 
                                   range: editor.session.selection.getRange(), 
                                   backwards: editor.session.selection.isBackwards() + 0, 
                                   language: tempLang })
        }
        editor.runCode(editor.session.selection.getRange(), 
                       'execLine', 
                       tempLang)
    }
})

editor.commands.addCommand({
    name: 'execBlock',
    bindKey: {
        win: 'Ctrl-Return',
        mac: 'Command-Return'
    },
    exec: function() {
        var tempLang = whichLanguage(editor.session.selection.getRange())
        if (firepad !== null) {
            audioMessageRef.push({ author: userId, 
                                   exec: 'execBlock', 
                                   range: editor.session.selection.getRange(), 
                                   backwards: editor.session.selection.isBackwards() + 0, 
                                   language: tempLang })
        }
        editor.runCode(editor.session.selection.getRange(), 
                       'execBlock', 
                       tempLang)
    }
})

//called locally, from firebase remote, and livewriting playback
editor.runCode = function(theRange, execType, theLanguage) {
    var theCode = ''
    var sel = JSON.parse(JSON.stringify(theRange));
    var isWhiteSpace = /^\s*$/m
    // var isComment = /\s*\/{2,}/i
    var isPython = /\s*\/{2,}\s*python/i
    var isTidal = /\s*\/{2,}\s*tidal/i
    var isLua = /\s*\/{2,}\s*lua/i
    var isGLSL = /\s*\/{2,}\s*glsl/i
    var isLangTag = /^\s*\/{2,}\s*(python|tidal|lua|glsl)$/mi
    var myCursor = editor.session.selection.getCursor()

//TODO:: change to not set global lang choice?
/*
python up to tag down to empty line
tidal up to tag down to empty line
lua up to tag down to closing block...? count end's and open conditions?
glsl whole file, or auto
*/

    if (execType === 'execLine') {
        //if single line and nothing selected
        if (theRange.start.column === theRange.end.column &&
            theRange.start.row === theRange.end.row) {
            sel.start.column = 0
            var theLine = editor.session.doc.getLine(sel.start.row)
            sel.end.column = theLine.length
        } else { //else multiline selection
            sel.start.column = 0
            sel.end.column = 1
            var theLine = editor.session.doc.getLine(sel.end.row)
            sel.end.column = theLine.length    
        }

    } else { // is block execution
        sel.start.column = 0
        sel.end.column = 1

        // get start of bock basd on language
        if (theLanguage === 'tidal') {
            while (sel.start.row >= 0) {
                var lineStart = editor.session.doc.getLine(sel.start.row)
                if(null !== isTidal.exec(lineStart) ||
                   null !==  isWhiteSpace.exec(lineStart) || 
                   "" === lineStart) {
                    sel.start.row += 1
                    break
                }
                sel.start.row -= 1
            }
        } else if (theLanguage === 'python' ||
                   theLanguage === 'lua') {
            while (sel.start.row >= 0) {
                var lineStart = editor.session.doc.getLine(sel.start.row)
                //TODO:: for now must have empty lines not counting tabs over
                if(null !== isPython.exec(lineStart) || 
                   "" === lineStart) {
                    sel.start.row += 1
                    break
                }
                sel.start.row -= 1
            }
        } else if (theLanguage === 'glsl') {
            while (sel.start.row >= 0) {
                var lineStart = editor.session.doc.getLine(sel.start.row)
                if(null !== isGLSL.exec(lineStart)) {
                    sel.start.row += 1
                    break
                }
                sel.start.row -= 1
            }
        }

        //get end of block based on language
        var lastLine = editor.session.doc.getLength()
        // if (lineEnd.length === 0 || !lineEnd.trim()) { //helpful?
        if (theLanguage === 'tidal') {
            while (sel.end.row < lastLine) {
                var lineEnd = editor.session.doc.getLine(sel.end.row)
                
                if (null !==  isWhiteSpace.exec(lineEnd) ||
                    "" === lineEnd ||
                    null !== isLangTag.exec(lineEnd)) {
                    sel.end.row -= 1
                    var theLine = editor.session.doc.getLine(sel.end.row)
                    sel.end.column = theLine.length
                    break
                } 
                sel.end.row += 1
            }
        } else if (theLanguage === 'python' ||
                   theLanguage === 'lua') {
            while (sel.end.row < lastLine) {
                var lineEnd = editor.session.doc.getLine(sel.end.row)
                //TODO:: for now must have empty lines not counting tabs over
                if ("" === lineEnd ||
                    null !== isLangTag.exec(lineEnd)) {
                    sel.end.row -= 1
                    var theLine = editor.session.doc.getLine(sel.end.row)
                    sel.end.column = theLine.length
                    break
                } 
                sel.end.row += 1
            }
        } else if (theLanguage === 'glsl') {
            while (sel.end.row < lastLine) {
                var lineEnd = editor.session.doc.getLine(sel.end.row)
                if (null !== isLangTag.exec(lineEnd)) {
                    sel.end.row -= 1
                    var theLine = editor.session.doc.getLine(sel.end.row)
                    sel.end.column = theLine.length
                    break
                } 
                sel.end.row += 1
            }
        }

    }

    var lines = editor.session.doc.getLines(sel.start.row, sel.end.row)
    theCode = lines.join(editor.session.doc.getNewLineCharacter())

    sel.clipRows = function () {
        var range
        range = Range.prototype.clipRows.apply(this, arguments)
        range.isEmpty = function () {
          return false
        }
        return range
    }

    if (theLanguage !== 'glsl') {
        var id = editor.session.addMarker(sel, 'execHighlight', 'text')
        mExecs.push(id)
        mExecTimer = setTimeout(clearExecHighLighting, 550)
    }

    mLanguage = theLanguage
    mCode = theCode

    sendCode()
}

function whichLanguage(aRange) {
    var langRange = JSON.parse(JSON.stringify(aRange));
    // var isComment = /\s*\/{2,}/i
    var isPython = /\s*\/{2,}\s*python/i
    var isTidal = /\s*\/{2,}\s*tidal/i
    var isLua = /\s*\/{2,}\s*lua/i
    var isGLSL = /\s*\/{2,}\s*glsl/i

    while (langRange.start.row >= 0) {
        var theLine = editor.session.doc.getLine(langRange.start.row)
        // if (null !== isComment.exec(theLine)) {
            if (null !== isPython.exec(theLine)) {
                return 'python'
            } else if (null !== isTidal.exec(theLine)) {
                return 'tidal'
            } else if (null !== isLua.exec(theLine)) {
                return 'lua'
            } else if (null !== isGLSL.exec(theLine)) {
                return 'glsl'
            }
        // }
        langRange.start.row -= 1
    }
    return null
}

function clearExecHighLighting() {
    while (mExecs.length > 0) {
        var mark = mExecs.pop()
        editor.session.removeMarker(mark)
    }
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function replaceTidalCode(newCode) {
    var sel = new Range(0,0,0,0)
    var isWhiteSpace = /^\s*$/m
    var isTidal = /\s*\/{2,}\s*tidal/i
    var lastLine = editor.session.doc.getLength()

    while (sel.end.row < lastLine) {
        var lineEnd = editor.session.doc.getLine(sel.end.row)
        
        if (null !== isTidal.exec(lineEnd)) {
            sel.start.row += 1
            sel.end.row += 1
            continue
        }

        if ((null !==  isWhiteSpace.exec(lineEnd) ||
            "" === lineEnd)) {
            sel.end.row -= 1
            lineEnd = editor.session.doc.getLine(sel.end.row)
            sel.end.column = lineEnd.length
            break
        } 
        sel.end.row += 1        
    }
    
    editor.session.doc.replace(sel, newCode)
    editor.navigateTo(sel.end.row, sel.end.column)

    clearTimeout(NNExecuteTimer)
    NNExecuteTimer = setTimeout(NNExecuteCallback, 
                                NNBaseTime + getRndInteger(NNRandVariance, -NNRandVariance))
}

function NNExecuteCallback () {
    editor.commands.exec("execBlock")
}

function setShaderFromEditor() {
    var tempLang = whichLanguage(editor.session.selection.getRange())
    // editor.livewriting('record', 
    //                    editor.session.selection.getRange(), 
    //                    'execBlock', 
    //                    tempLang)
    if (tempLang === 'glsl') {
        editor.runCode(editor.session.selection.getRange(), 
                       'execBlock', 
                       tempLang)
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