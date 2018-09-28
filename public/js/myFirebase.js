/// ////
//  firebase launch
/// ////
var firepad = null
var audioMessageRef = null

// Helper to get hash from end of URL or generate a random one.
function getExampleRef() {
    var ref = firebase.database().ref()
    var hash = window.location.hash.replace(/#/g, '')
    if (hash) {
        ref = ref.child(hash)
    } else {
        ref = ref.push() // generate unique location.
        window.location = window.location + '#' + ref.key // add it as a hash to the URL.
    }
    if (typeof console !== 'undefined') {
        console.log('Firebase data: ', ref.toString())
    }
    return ref
}

var userId = Math.floor(Math.random() * 9999999999).toString()

/// / Create Firepad.
function createFirepad(isNew) {

    localStorage.firebase_user = $('#firebase_user').val()
    localStorage.firebase_pass = $('#firebase_pass').val()

    if (firebase !== null) {
        firebase.initializeApp(config)
    }

    firebase.auth().signInWithEmailAndPassword(localStorage.firebase_user, localStorage.firebase_pass).then(function() {
        console.log('hells yea')
        if (!isNew) {
            window.location.hash = ''
            window.location = window.location + '#' + $('#firebase_hash').val()
        }

        var firepadRef = getExampleRef()

        $('firebase_hash').val(firepadRef.key)

        //for reconnecting, ACE editor needs to be empty
        if (editor !== null) {
            editor.setValue("", 0)
        }

        firepad = Firepad.fromACE(firepadRef, editor, {
            userId: userId,
            defaultText: '#write some python or tidal\n\n\nd1 $ s "funky*4"\n  # n (irand 8)\n  # gain  "1.2"\n  # unit "c"\n  # speed "4"\n\n'
        })

        audioMessageRef = firebase.database().ref('audioMessage/' + 1)

        audioMessageRef.on('child_added', function(data) {
            //if messages not by us
            if (data.val().author !== userId) {
                // record other user code executions
                editor.livewriting('record', data.val().range, data.val().exec, data.val().language)
                // run other user code executions
                editor.runCode(data.val().range, data.val().exec, data.val().language)
                // delete the message
                audioMessageRef.child(data.key).remove()
            }
        })
    }).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode + "\n" + errorMessage)
        return
    });

}

// createFirepad(false)
