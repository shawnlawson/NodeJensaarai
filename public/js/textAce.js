var Range = ace.require('ace/range').Range

var mErrors = new Array()
var mExecs = new Array()
var mExecTimer = null

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
editor.session.setMode('') //TODO, updated from main editor
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
            while (sel.start.row > 0) {
                var lineStart = editor.session.doc.getLine(sel.start.row)
                if (null !== isTidal.exec(lineStart) ||
                    null !== isWhiteSpace.exec(lineStart) ||
                    "" === lineStart) {
                    sel.start.row += 1
                    break
                }
                sel.start.row -= 1
            }
        } else if (theLanguage === 'python' ||
            theLanguage === 'lua') {
            while (sel.start.row > 0) {
                var lineStart = editor.session.doc.getLine(sel.start.row)
                //TODO:: for now must have empty lines not counting tabs over
                if (null !== isPython.exec(lineStart) ||
                    "" === lineStart) {
                    sel.start.row += 1
                    break
                }
                sel.start.row -= 1
            }
        } else if (theLanguage === 'glsl') {
            while (sel.start.row > 0) {
                var lineStart = editor.session.doc.getLine(sel.start.row)
                if (null !== isGLSL.exec(lineStart)) {
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

                if (null !== isWhiteSpace.exec(lineEnd) ||
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

    sel.clipRows = function() {
        var range
        range = Range.prototype.clipRows.apply(this, arguments)
        range.isEmpty = function() {
            return false
        }
        return range
    }

    var id = editor.session.addMarker(sel, 'execHighlight', 'text')
    mExecs.push(id)
    mExecTimer = setTimeout(clearExecHighLighting, 550)
}

function clearExecHighLighting() {
    while (mExecs.length > 0) {
        var mark = mExecs.pop()
        editor.session.removeMarker(mark)
    }
}