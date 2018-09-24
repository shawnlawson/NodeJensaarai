var debugging = false
var secondWindow = false
var cy = cytoscape({
    container: $('#cy'),

    style: cytoscape.stylesheet()
        .selector('node')
        .css({
            'content': 'data(id)',
            'text-opacity': 0.75,
            'text-valign': 'top',
            'text-halign': 'center',
            'background-color': '#11479e',
            'color': 'white',
            'shape': 'ellipse'
            // 'text-outline-width': 2,
            // 'text-outline-color': '#999'
        })
        .selector('.bypass')
        .css({
            'shape': 'triangle'
        })
        .selector('edge')
        .css({
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
            'line-color': '#9dbaea',
            'target-arrow-color': '#9dbaea',
            'width': 1
        }),

    layout: {
        name: 'dagre',
        rankDir: 'LR',
        ranker: 'longest-path'
    },
    panningEnabled: false,
    zoomingEnabled: false

})

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
                var rgbaCol = 'rgba(0, 0, 0, ' + parseFloat(data.item.value) + ')';
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

                sendNewHighlighting(data.item.value)
                this.blur()
            })

        $('#autoComplete')
            .button()
            .bind('change', function(event) {
                editor.setOptions({
                    enableLiveAutocompletion: !editor.getOptions().enableLiveAutocompletion
                })
                this.blur()
            })

        $('#debug')
            .button()
            .bind('change', function(event) {
                debugging = !debugging
                if (debugging) {
                    $('#editor').hide()
                    cy.panningEnabled(true)
                    cy.zoomingEnabled(true)
                } else {
                    $('#editor').show()
                    cy.panningEnabled(false)
                    cy.zoomingEnabled(false)
                }
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
                firebase.auth().signOut().then(function() {
                  // Sign-out successful.
                }).catch(function(error) {
                  // An error happened.
                });
            })

        $('#set_osc_ports')
            .button()
            .click(function(event) {
                var data = {
                    'python': parseInt($('#python_send').val()),
                    'tidal': parseInt($('#tidal_send').val()),
                    'lua': parseInt($('#lua_send').val()),
                    'glsl': parseInt($('#glsl_send').val()),
                    'receive': parseInt($('#all_receive').val())
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
                openFile(event, "live")
            })

        $('#edFile')
            .change(function(event) {
                openFile(event, "editor")
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

        $('#firebase_user').val(localStorage.firebase_user) 
        $('#firebase_pass').val(localStorage.firebase_pass)
        
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

function openFile(event, who) {
    var file
    if (event.target.files) {
        file = event.target.files
    } else {
        file = event.dataTransfer.files
    }

    var f
    var numFiles = file.length
    for (var i = 0; f = file[i]; i++) {
        // if (f.name.slice(-4) === '.txt') {
        var reader = new FileReader()

        reader.onload = (function(theFile) {
            return function(e) {
                if (who === "live") {
                    editor.livewriting('playJson', reader.result)
                } else if (who === "editor") {
                    editor.setValue(reader.result, -1)
                }
            }
        })(f)

        reader.readAsText(f, 'text/plain;charset=utf-8')
        // }
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

function buildGraph(data) {
    theGraph = JSON.parse(data)

    cy.elements().remove()

    for (i = 0; i < theGraph.length; i++) {
        cy.add({
            group: "nodes",
            data: {
                id: theGraph[i][0]
            }
        })

        if (theGraph[i][2] === true)
            cy.$id(theGraph[i][0]).classes('bypass')
    }
    //ugh, second iteration through for edges, cause can't connect if they don't exist
    for (i = 0; i < theGraph.length; i++) {
        if (0 < theGraph[i][1].length) {
            for (j = 0; j < theGraph[i][1].length; j++) {
                cy.add({
                    group: "edges",
                    data: {
                        source: theGraph[i][0],
                        target: theGraph[i][1][j]
                    }
                })
            }
        }
    }
    cy.layout({ name: 'dagre', rankDir: 'LR', ranker: 'network-simplex' }).run()
}