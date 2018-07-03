
$(document)
  .ready(function () {

    // .on('selectmenuchange', function (event, data) {
    //   editor.setOptions({
    //     fontSize: data.item.value + 'pt'
    //   })
    // })
  }) // end document ready

function addStyleRule (css) {
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
