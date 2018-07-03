var debugging = false
var secondWindow = false

$(document)
    .ready(function() {
        /// /////////////////////////////////
        //  Footer
        /// /////////////////////////////////
        $('#footer')
            .mouseover(function(event) {
                $('#footerUI').fadeIn('fast')
            })
            .mouseleave(function(event) {
                $('#footerUI').fadeOut('slow')
            })

        $('#selectFontSize')
            .selectmenu({
                width: 'auto',
                position: { collision: 'flip' }
            })
            .on('selectmenuchange', function(event, data) {
                editor.setOptions({
                    fontSize: data.item.value + 'pt'
                })
                this.blur()
            })
        $('#selectBackgroundAlpha')
            .selectmenu({
                width: 'auto',
                position: { collision: 'flip' }
            })
            .on('selectmenuchange', function(event, data) {
              var rgbaCol = 'rgba(0, 0, 0, '+ parseFloat(data.item.value)+')';
              $('html, body').css('background', rgbaCol)
              this.blur()
            })

        $('#selectHighlighting')
          .selectmenu({
              width: 'auto',
              position: { collision: 'flip' }
          })
          .on('selectmenuchange', function(event, data) {
            if (data.item.value === 'none') 
              editor.session.setMode('') //TODO is this ok?
            else if (data.item.value === 'glsl') 
              editor.session.setMode('ace/mode/glsl')
            else if (data.item.value === 'tidal') 
              editor.session.setMode('ace/mode/haskell')
            else if (data.item.value === 'python') 
              editor.session.setMode('ace/mode/python')
            else if (data.item.value === 'lua') 
              editor.session.setMode('ace/mode/lua')
            this.blur()
          })

        $('#autoComplete')
          .button()
          .bind('change', function(event) {
            enableLiveAutocompletion: !editor.getOptions().enableLiveAutocompletion
            this.blur()
          })

        $('#debug')
            .button()
            .bind('change', function(event) {
                debugging = !debugging
                this.blur()
            })

        $('#extraWindow')
            .button()
            .bind('change', function() {
                secondWindow = !secondWindow
                sendUpdateWindow(secondWindow)
                this.blur()
            })

        $('#network')
            .button()
            .click(function(event) {
                $('#networkPanel').dialog('open')
            })

        // --------------------- FIREBASE AND OSC PANEL ------------
        $('#networkPanel')
            .dialog({
                autoOpen: false,
                maxHeight: 400,
                minWidth: 520,
                show: {
                    effect: 'clip',
                    duration: 250
                },
                hide: {
                    effect: 'clip',
                    duration: 250
                }
            })

        // TODO: fix these buttons
        $('#new_hash')
            .button()
            .click(function(event) {
                createFirepad(true)
            })

        $('#connect_to_firebase')
            .button()
            .click(function(event) {
                createFirepad(false)
            })

        $('#disconnect_to_firebase')
            .button()
            .click(function(event) {
                if (firepad !== null) {
                    firepad.dispose()
                }
            })

        $('#set_osc_ports')
            .button()
            .click(function(event) {
                var data = {
                    'python': parseInt( $('#python_send').val() ),
                    'tidal': parseInt( $('#tidal_send').val() ),
                    'lua': parseInt( $('#lua_send').val() ),
                    'glsl': parseInt( $('#glsl_send').val() ),
                    'receive': parseInt( $('#all_receive').val() )
                }
                sendNewOSCPorts(data)
            })


        $('#openFile')
            .button()
            .click(function(event) { // to hide the other file button interface from users
                $('#myFile').trigger('click')
            })

        $('#myFile')
            .change(function(event) {
                openFile(event)
            })

        $('#saveFile')
            .button()
            .click(function(event) {
                editor.livewriting('save', editor.livewriting('returnactiondata'))
            })

        $('#playback')
            .button()
            .click(function(event) {
                $('.livewriting_navbar').dialog('open')
            })

        $('.livewriting_navbar')
            .dialog({
                autoOpen: false,
                maxHeight: 400,
                minWidth: 800,
                show: {
                    effect: 'clip',
                    duration: 250
                },
                hide: {
                    effect: 'clip',
                    duration: 250
                }
                // ,
                // beforeClose: function (event, ui) {
                //   $(this).parent().css('visibility', 'hidden')
                //   event.preventDefault()
                //   return false
                // }
            })
    }) // end document ready
    .keydown(function(event) {

    }) // end document keydown
    .keyup(function(event) {

    }) // end document keyup
    .on('dragenter', function(event) {
        event.stopPropagation()
        event.preventDefault()
    })
    .on('dragover', function(event) {
        event.stopPropagation()
        event.preventDefault()
    })
    .on('drop', function(event) {
        event.stopPropagation()
        event.preventDefault()
    })

function openFile(event) {
    var file
    if (event.target.files) { file = event.target.files } else { file = event.dataTransfer.files }
    var f
    var numFiles = file.length
    for (var i = 0; f = file[i]; i++) {
        if (f.name.slice(-4) === '.txt') {
            var reader = new FileReader()

            reader.onload = (function(theFile) {
                return function(e) {
                    editor.livewriting('playJson', reader.result)
                    // editor.setValue(reader.result, -1)
                }
            })(f)

            reader.readAsText(f, 'text/plain;charset=utf-8')
        }
    }
}

function addStyleRule(css) {
    var styleElement
    if (typeof document === 'undefined' || document === null) {
        return
    }
    if (!editor.addedStyleRules) {
        editor.addedStyleRules = {}
        styleElement = document.createElement('style')
        document.documentElement.getElementsByTagName('head')[0].appendChild(styleElement)
        editor.addedStyleSheet = styleElement.sheet
    }
    if (editor.addedStyleRules[css]) {
        return
    }
    editor.addedStyleRules[css] = true
    return editor.addedStyleSheet.insertRule(css, 0)
}