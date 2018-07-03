ace.define('ace/mode/python_highlight_rules', ['require', 'exports', 'module', 'ace/lib/oop', 'ace/mode/text_highlight_rules'], function (require, exports, module) {
  'use strict'

  var oop = require('../lib/oop')
  var TextHighlightRules = require('./text_highlight_rules').TextHighlightRules

  var PythonHighlightRules = function () {
    var keywords = (
        'and|as|assert|break|class|continue|def|del|elif|else|except|exec|' +
        'finally|for|from|global|if|import|in|is|lambda|not|or|pass|print|' +
        'raise|return|try|while|with|yield'
    )

    var builtinConstants = (
        'True|False|None|NotImplemented|Ellipsis|__debug__'
    )

    var builtinFunctions = (
        'abs|divmod|input|open|staticmethod|all|enumerate|int|ord|str|any|' +
        'eval|isinstance|pow|sum|basestring|execfile|issubclass|print|super|' +
        'binfile|iter|property|tuple|bool|filter|len|range|type|bytearray|' +
        'float|list|raw_input|unichr|callable|format|locals|reduce|unicode|' +
        'chr|frozenset|long|reload|vars|classmethod|getattr|map|repr|xrange|' +
        'cmp|globals|max|reversed|zip|compile|hasattr|memoryview|round|' +
        '__import__|complex|hash|min|set|apply|delattr|help|next|setattr|' +
        'buffer|dict|hex|object|slice|coerce|dir|id|oct|sorted|intern'
    )

    var touchDesignerObjects = (
    	'addTOP|analyzeTOP|antialiasTOP|blobtrackTOP|blurTOP|cacheselectTOP|' +
    	'cacheTOP|channelmixTOP|choptoTOP|chromakeyTOP|circleTOP|compositeTOP|' +
    	'constantTOP|convolveTOP|cornerpinTOP|cplusplusTOP|cropTOP|crossTOP|' +
    	'cubemapTOP|cudaTOP|depthTOP|differenceTOP|directxoutTOP|displaceTOP|' +
    	'edgeTOP|embossTOP|feedbackTOP|fitTOP|flipTOP|glslmultiTOP|glslTOP|' +
    	'hsvadjustTOP|hsvtorgbTOP|insideTOP|inTOP|kinectTOP|layoutTOP|leapmotionTOP|' +
    	'levelTOP|lookupTOP|lumablurTOP|lumalevelTOP|mathTOP|matteTOP|monochromeTOP|' +
    	'moviefileinTOP|moviefileoutTOP|multiplyTOP|ndiinTOP|ndioutTOP|noiseTOP|' +
    	'normalmapTOP|nullTOP|oculusriftTOP|opencolorioTOP|openvrTOP|opviewerTOP|' +
    	'outsideTOP|outTOP|overTOP|packTOP|photoshopinTOP|projectionTOP|rampTOP|' +
    	'realsenseTOP|rectangleTOP|remapTOP|renderpassTOP|renderselectTOP|renderTOP|' +
    	'reorderTOP|resolutionTOP|rgbkeyTOP|rgbtohsvTOP|scalabledisplayTOP|' +
    	'screengrabTOP|screenTOP|sdiinTOP|sdioutTOP|sdiselectTOP|sharedmeminTOP|' +
    	'sharedmemoutTOP|slopeTOP|spoutinTOP|ssaoTOP|substanceselectTOP|substanceTOP|' +
    	'subtractTOP|svgTOP|switchTOP|syphonspoutoutTOP|textTOP|texture3dTOP|' +
    	'thresholdTOP|tileTOP|timemachineTOP|touchinTOP|touchoutTOP|transformTOP|' +
    	'underTOP|videodeviceinTOP|videodeviceoutTOP|videostreaminTOP|' +
    	'videostreamoutTOP|viosoTOP|webrenderTop|' +
    	'abletonlinkCHOP|analyzeCHOP|angleCHOP|attributeCHOP|audiobandeqCHOP|' +
    	'audiodeviceinCHOP|audiodeviceoutCHOP|audiodynamicsCHOP|audiofileinCHOP|' +
    	'audiofilterCHOP|audiomovieCHOP|audiooscillatorCHOP|audioparaeqCHOP|' +
    	'audioplayCHOP|audiospectrumCHOP|audiostreaminCHOP|audiostreamoutCHOP|' +
    	'beatCHOP|blacktraxCHOP|blendCHOP|clipbenderCHOP|clipCHOP|clockCHOP|' +
    	'compositeCHOP|constantCHOP|copyCHOP|countCHOP|cplusplusCHOP|crossCHOP|' +
    	'cycleCHOP|dattoCHOP|delayCHOP|deleteCHOP|dmxinCHOP|dmxoutCHOP|envelopCHOP|' +
    	'etherdreamCHOP|eventCHOP|expressionCHOP|extendCHOP|fanCHOP|feedbackCHOP|' +
    	'fileinCHOP|fileoutCHOP|filterCHOP|functionCHOP|geometryCHOP|gestureCHOP|' +
    	'handleCHOP|heliosdacCHOP|hogCHOP|hokuyoCHOP|holdCHOP|inCHOP|infoCHOP|' +
    	'interpolateCHOP|inversecurveCHOP|inversekinCHOP|joinCHOP|joystickCHOP|' +
    	'keyboardinCHOP|keyframeCHOP|kinectCHOP|lagCHOP|leapmotionCHOP|leuzerod4CHOP|' +
    	'lfoCHOP|limitCHOP|logicCHOP|lookupCHOP|ltcinCHOP|ltcoutCHOP|mathCHOP| ' +
    	'mergeCHOP|midiinCHOP|midiinmapCHOP|midioutCHOP|mouseinCHOP|mouseoutCHOP|' +
    	'natnetinCHOP|noiseCHOP|nullCHOP|objectCHOP|oculusaudioCHOP|oculusriftCHOP|' +
    	'openvrCHOP|oscinCHOP|oscoutCHOP|outCHOP|overrideCHOP|panelCHOP|' +
    	'parameterCHOP|patternCHOP|performCHOP|pipeinCHOP|pipeoutCHOP|pulseCHOP|' +
    	'realsenseCHOP|recordCHOP|renameCHOP|renderpickCHOP|reorderCHOP|replaceCHOP|' +
    	'resampleCHOP|scurveCHOP|scanCHOP|scriptCHOP|selectCHOP|sequencerCHOP|' +
    	'serialCHOP|sharedmeminCHOP|sharedmemoutCHOP|shiftCHOP|shuffleCHOP|slopeCHOP' +
    	'soptoCHOP|sortCHOP|speedCHOP|spliceCHOP|springCHOP|stretchCHOP|switchCHOP|' +
    	'syncinCHOP|syncoutCHOP|tabletCHOP|timesliceCHOP|timelineCHOP|timerCHOP|' +
    	'timingCHOP|toptoCHOP|touchinCHOP|touchoutCHOP|trailCHOP|transformCHOP|' +
    	'triggerCHOP|trimCHOP|warpCHOP|waveCHOP|' +
    	'artnetDAT|chopexecuteDAT|choptoDAT|clipDAT|convertDAT|datexecuteDAT|' +
    	'errorDAT|etherdreamDAT|evaluateDAT|examineDAT|executeDAT|fifoDAT|fileinDAT|' +
    	'fileoutDAT|folderDAT|inDAT|indicesDAT|infoDAT|insertDAT|keyboardinDAT|' +
    	'mergeDAT|midieventDAT|midiinDAT|monitorsDAT|mqttclientDAT|multitouchinDAT|' +
    	'nullDAT|opexecuteDAT|opfindDAT|oscinDAT|oscoutDAT|outDAT|panelexecuteDAT|' +
    	'parameterexecuteDAT|performDAT|renderpickDAT|reorderDAT|scriptDAT|selectDAT' +
    	'serialDAT|soptoDAT|sortDAT|substituteDAT|switchDAT|tableDAT|tcpipDAT|' +
    	'textDAT|touchinDAT|touchoutDAT|transposeDAT|tuioinDAT|udpinDAT|udpoutDAT|' +
    	'udtinDAT|udtoutDAT|webDAT|websocketDAT|xmlDAT|' +
    	'addSOP|alembicSOP|alignSOP|armSOP|attributecreateSOP|attributeSOP|basisSOP|' +
    	'blendSOP|bonegroupSOP|booleanSOP|boxSOP|bridgeSOP|cacheSOP|capSOP|' +
    	'captureregionSOP|captureSOP|carveSOP|choptoSOP|circleSOP|claySOP|clipSOP|' +
    	'convertSOP|copySOP|cplusplusSOP|creepSOP|curveclaySOP|curvesectSOP|' +
    	'dattoSOP|deformSOP|deleteSOP|divideSOP|extrudeSOP|facetSOP|fileinSOP|' +
    	'filletSOP|fitSOP|fontSOP|forceSOP|fractalSOP|gridSOP|groupSOP|holeSOP|' +
    	'inSOP|inversecurveSOP|isosurfaceSOP|joinSOP|jointSOP|kinectSOP|latticeSOP' +
    	'limitSOP|lineSOP|linethickSOP|lodSOP|lsystemSOP|magnetSOP|materialSOP|' +
    	'mergeSOP|metaballSOP|modelSOP|noiseSOP|nullSOP|objectmergeSOP|openvrSOP|' +
    	'outSOP|particleSOP|pointSOP|polyloftSOP|polypatchSOP|polyreduceSOP|' +
    	'polysplineSOP|polystitchSOP|profileSOP|projectSOP|railsSOP|raySOP' +
    	'rectangleSOP|refineSOP|resampleSOP|revolveSOP|scriptSOP|selectSOP|' +
    	'sequenceblendSOP|skinSOP|sortSOP|sphereSOP|springSOP|spriteSOP|spriteSOP' +
    	'stitchSOP|subdivideSOP|superquadSOP|surfsectSOP|sweepSOP|switchSOP|' +
    	'textSOP|textureSOP|torusSOP|traceSOP|trailSOP|transformSOP|trimSOP|' +
    	'tristripSOP|tubeSOP|twistSOP|vertexSOP|wireframeSOP|' +
    	'constantMAT|depthMAT|glslMAT|inMAT|nullMAT|outMAT|pbrMAT|phongMAT|' +
    	'pointspriteMAT|selectMAT|switchMAT|wireframeMAT|'
    	)

    var touchDesignerFunctions = (
		'isInput|isOutput|inOP|outOP|connections|min|max|clampMin|clampMax|default|' +
		'defaultExpr|normMin|normMax|normVal|isPulse|isMomentary|isMenu|isNumber|' +
		'isFloat|isInt|isOP|isPython|isString|isToggle|style|isCustom|copy|eval|' +
		'evalNorm|evalExpression|evalExport|create|par|pars()|expr|tdu|rand|' +
		'parent|name|path|children|destroy|absTime|frame|seconds|outputConnectors|' +
		'connect|disconnect|')

    var keywordMapper = this.createKeywordMapper({
      'invalid.deprecated': 'debugger',
      'support.function': builtinFunctions,
      'constant.language': builtinConstants,
      'keyword': keywords,
      'support.function.other': touchDesignerFunctions,
      'variable.language': touchDesignerObjects
      // 'storage': tidalFunctions
    }, 'identifier')

    var strPre = '(?:r|u|ur|R|U|UR|Ur|uR)?'

    var decimalInteger = '(?:(?:[1-9]\\d*)|(?:0))'
    var octInteger = '(?:0[oO]?[0-7]+)'
    var hexInteger = '(?:0[xX][\\dA-Fa-f]+)'
    var binInteger = '(?:0[bB][01]+)'
    var integer = '(?:' + decimalInteger + '|' + octInteger + '|' + hexInteger + '|' + binInteger + ')'

    var exponent = '(?:[eE][+-]?\\d+)'
    var fraction = '(?:\\.\\d+)'
    var intPart = '(?:\\d+)'
    var pointFloat = '(?:(?:' + intPart + '?' + fraction + ')|(?:' + intPart + '\\.))'
    var exponentFloat = '(?:(?:' + pointFloat + '|' + intPart + ')' + exponent + ')'
    var floatNumber = '(?:' + exponentFloat + '|' + pointFloat + ')'

    var stringEscape = "\\\\(x[0-9A-Fa-f]{2}|[0-7]{3}|[\\\\abfnrtv'\"]|U[0-9A-Fa-f]{8}|u[0-9A-Fa-f]{4})"

    this.$rules = {
      'start': [ {
        token: 'comment',
        regex: '//.*$'
      }, {
        token: 'string',           // multi line """ string start
        regex: strPre + '"{3}',
        next: 'qqstring3'
      }, {
        token: 'string',           // " string
        regex: strPre + '"(?=.)',
        next: 'qqstring'
      }, {
        token: 'string',           // multi line ''' string start
        regex: strPre + "'{3}",
        next: 'qstring3'
      }, {
        token: 'string',           // ' string
        regex: strPre + "'(?=.)",
        next: 'qstring'
      }, {
        token: 'constant.numeric', // imaginary
        regex: '(?:' + floatNumber + '|\\d+)[jJ]\\b'
      }, {
        token: 'constant.numeric', // float
        regex: floatNumber
      }, {
        token: 'constant.numeric', // long integer
        regex: integer + '[lL]\\b'
      }, {
        token: 'constant.numeric', // integer
        regex: integer + '\\b'
      }, {
        token: keywordMapper,
        regex: '[a-zA-Z_$][a-zA-Z0-9_$]*\\b'
      }, {
        token: 'keyword.operator',
        regex: '\\+|\\-|\\*|\\*\\*|\\/|\\/\\/|%|<<|>>|&|\\||\\^|~|<|>|<=|=>|==|!=|<>|='
      }, {
        token: 'paren.lparen',
        regex: '[\\[\\(\\{]'
      }, {
        token: 'paren.rparen',
        regex: '[\\]\\)\\}]'
      }, {
        token: 'text',
        regex: '\\s+'
      } ],
      'qqstring3': [ {
        token: 'constant.language.escape',
        regex: stringEscape
      }, {
        token: 'string', // multi line """ string end
        regex: '"{3}',
        next: 'start'
      }, {
        defaultToken: 'string'
      } ],
      'qstring3': [ {
        token: 'constant.language.escape',
        regex: stringEscape
      }, {
        token: 'string',  // multi line ''' string end
        regex: "'{3}",
        next: 'start'
      }, {
        defaultToken: 'string'
      } ],
      'qqstring': [{
        token: 'constant.language.escape',
        regex: stringEscape
      }, {
        token: 'string',
        regex: '\\\\$',
        next: 'qqstring'
      }, {
        token: 'string',
        regex: '"|$',
        next: 'start'
      }, {
        defaultToken: 'string'
      }],
      'qstring': [{
        token: 'constant.language.escape',
        regex: stringEscape
      }, {
        token: 'string',
        regex: '\\\\$',
        next: 'qstring'
      }, {
        token: 'string',
        regex: "'|$",
        next: 'start'
      }, {
        defaultToken: 'string'
      }]
    }
  }

  oop.inherits(PythonHighlightRules, TextHighlightRules)

  exports.PythonHighlightRules = PythonHighlightRules
})

ace.define('ace/mode/folding/pythonic', ['require', 'exports', 'module', 'ace/lib/oop', 'ace/mode/folding/fold_mode'], function (require, exports, module) {
  'use strict'

  var oop = require('../../lib/oop')
  var BaseFoldMode = require('./fold_mode').FoldMode

  var FoldMode = exports.FoldMode = function (markers) {
    this.foldingStartMarker = new RegExp('([\\[{])(?:\\s*)$|(' + markers + ')(?:\\s*)(?:#.*)?$')
  }
  oop.inherits(FoldMode, BaseFoldMode);

  (function () {
    this.getFoldWidgetRange = function (session, foldStyle, row) {
      var line = session.getLine(row)
      var match = line.match(this.foldingStartMarker)
      if (match) {
        if (match[1]) { return this.openingBracketBlock(session, match[1], row, match.index) }
        if (match[2]) { return this.indentationBlock(session, row, match.index + match[2].length) }
        return this.indentationBlock(session, row)
      }
    }
  }).call(FoldMode.prototype)
})

ace.define('ace/mode/python', ['require', 'exports', 'module', 'ace/lib/oop', 'ace/mode/text', 'ace/mode/python_highlight_rules', 'ace/mode/folding/pythonic', 'ace/range'], function (require, exports, module) {
  'use strict'

  var oop = require('../lib/oop')
  var TextMode = require('./text').Mode
  var PythonHighlightRules = require('./python_highlight_rules').PythonHighlightRules
  var PythonFoldMode = require('./folding/pythonic').FoldMode
  var Range = require('../range').Range

  var Mode = function () {
    this.HighlightRules = PythonHighlightRules
    this.foldingRules = new PythonFoldMode('\\:')
  }
  oop.inherits(Mode, TextMode);

  (function () {
    this.lineCommentStart = '//'

    this.getNextLineIndent = function (state, line, tab) {
      var indent = this.$getIndent(line)

      var tokenizedLine = this.getTokenizer().getLineTokens(line, state)
      var tokens = tokenizedLine.tokens

      if (tokens.length && tokens[tokens.length - 1].type == 'comment') {
        return indent
      }

      if (state == 'start') {
        var match = line.match(/^.*[\{\(\[\:]\s*$/)
        if (match) {
          indent += tab
        }
      }

      return indent
    }

    var outdents = {
      'pass': 1,
      'return': 1,
      'raise': 1,
      'break': 1,
      'continue': 1
    }

    this.checkOutdent = function (state, line, input) {
      if (input !== '\r\n' && input !== '\r' && input !== '\n') { return false }

      var tokens = this.getTokenizer().getLineTokens(line.trim(), state).tokens

      if (!tokens) { return false }
      do {
        var last = tokens.pop()
      } while (last && (last.type == 'comment' || (last.type == 'text' && last.value.match(/^\s+$/))))

      if (!last) { return false }

      return (last.type == 'keyword' && outdents[last.value])
    }

    this.autoOutdent = function (state, doc, row) {
      row += 1
      var indent = this.$getIndent(doc.getLine(row))
      var tab = doc.getTabString()
      if (indent.slice(-tab.length) == tab) { doc.remove(new Range(row, indent.length - tab.length, row, indent.length)) }
    }

    this.$id = 'ace/mode/python'
  }).call(Mode.prototype)

  exports.Mode = Mode
})
