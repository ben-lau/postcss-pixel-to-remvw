'use strict';

var postcss = require('postcss');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var postcss__default = /*#__PURE__*/_interopDefaultLegacy(postcss);

/**@typedef {{baseSize: {rem:number,vw:number},unitPrecision: number,selectorBlackList: string[],propList: string[],minPixelValue: number,exclude: string|RegExp|()=>boolean ,commentOfDisableAll:string,commentOfDisableRem:string,commentOfDisableVW:string}} Options */

/**
 * @type {Options}
 */

var defaults = {
  baseSize: {
    rem: 75,
    // 10rem = 750px
    vw: 7.5 // 100vw = 750px

  },
  unitPrecision: 5,
  selectorBlackList: [],
  propList: ['*'],
  minPixelValue: 0,
  exclude: null,
  // Single rule does not convert
  keepRuleComment: 'no',
  // The entire file is not converted
  commentOfDisableAll: 'disable-convert',
  // The entire file is not converted to rem
  commentOfDisableRem: 'disable-convert-rem',
  // nThe entire file is not converted to vw
  commentOfDisableVW: 'disable-convert-vw'
};
var REG_PX = /"[^"]+"|'[^']+'|url\([^)]+\)|(\d*\.?\d+)px/g;

var isFunction = function isFunction(target) {
  return typeof target === 'function';
};

var isString = function isString(target) {
  return typeof target === 'string';
};

var isRegExp = function isRegExp(target) {
  return target instanceof RegExp;
};

var toFixed = function toFixed(number, precision) {
  var multiplier = Math.pow(10, precision + 1);
  var wholeNumber = Math.floor(number * multiplier);
  return Math.round(wholeNumber / 10) * 10 / multiplier;
};

var filterPropList = {
  exact: function exact(list) {
    return list.filter(function (m) {
      return m.match(/^[^*!]+$/);
    });
  },
  contain: function contain(list) {
    return list.filter(function (m) {
      return m.match(/^\*.+\*$/);
    }).map(function (m) {
      return m.substr(1, m.length - 2);
    });
  },
  endWith: function endWith(list) {
    return list.filter(function (m) {
      return m.match(/^\*[^*]+$/);
    }).map(function (m) {
      return m.substr(1);
    });
  },
  startWith: function startWith(list) {
    return list.filter(function (m) {
      return m.match(/^[^*!]+\*$/);
    }).map(function (m) {
      return m.substr(0, m.length - 1);
    });
  },
  notExact: function notExact(list) {
    return list.filter(function (m) {
      return m.match(/^![^*].*$/);
    }).map(function (m) {
      return m.substr(1);
    });
  },
  notContain: function notContain(list) {
    return list.filter(function (m) {
      return m.match(/^!\*.+\*$/);
    }).map(function (m) {
      return m.substr(2, m.length - 3);
    });
  },
  notEndWith: function notEndWith(list) {
    return list.filter(function (m) {
      return m.match(/^!\*[^*]+$/);
    }).map(function (m) {
      return m.substr(2);
    });
  },
  notStartWith: function notStartWith(list) {
    return list.filter(function (m) {
      return m.match(/^![^*]+\*$/);
    }).map(function (m) {
      return m.substr(1, m.length - 2);
    });
  }
}; // px replacer creator

var createPxReplacer = function createPxReplacer(perRatio, minPixelValue, unitPrecision, unit) {
  return function (origin, $1) {
    var pixels = parseFloat($1);

    if (!$1 || pixels <= minPixelValue) {
      return origin;
    } else {
      return "".concat(toFixed(pixels / perRatio, unitPrecision)).concat(unit);
    }
  };
};

var inBlackList = function inBlackList(blacklist, selector) {
  if (typeof selector !== 'string') {
    return false;
  }

  return blacklist.some(function (regex) {
    if (typeof regex === 'string') {
      return selector.indexOf(regex) !== -1;
    }

    return selector.match(regex);
  });
};

var createPropListMatcher = function createPropListMatcher(propList) {
  var hasWild = propList.indexOf('*') > -1;
  var matchAll = hasWild && propList.length === 1;
  var lists = {
    exact: filterPropList.exact(propList),
    contain: filterPropList.contain(propList),
    startWith: filterPropList.startWith(propList),
    endWith: filterPropList.endWith(propList),
    notExact: filterPropList.notExact(propList),
    notContain: filterPropList.notContain(propList),
    notStartWith: filterPropList.notStartWith(propList),
    notEndWith: filterPropList.notEndWith(propList)
  };
  return function (prop) {
    if (matchAll) return true;
    return (hasWild || lists.exact.indexOf(prop) > -1 || lists.contain.some(function (m) {
      return prop.indexOf(m) > -1;
    }) || lists.startWith.some(function (m) {
      return prop.indexOf(m) === 0;
    }) || lists.endWith.some(function (m) {
      return prop.indexOf(m) === prop.length - m.length;
    })) && !(lists.notExact.indexOf(prop) > -1 || lists.notContain.some(function (m) {
      return prop.indexOf(m) > -1;
    }) || lists.notStartWith.some(function (m) {
      return prop.indexOf(m) === 0;
    }) || lists.notEndWith.some(function (m) {
      return prop.indexOf(m) === prop.length - m.length;
    }));
  };
};

var declarationExists = function declarationExists(decls, prop, value) {
  return decls.some(function (decl) {
    return decl.prop === prop && decl.value === value;
  });
};
/**
 * @param {Partial<Options>} options
 */


var converter = postcss__default["default"].plugin('postcss-pixel-to-remvw', function () {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var _Object$assign = Object.assign({}, defaults, options),
      exclude = _Object$assign.exclude,
      unitPrecision = _Object$assign.unitPrecision,
      minPixelValue = _Object$assign.minPixelValue,
      baseSize = _Object$assign.baseSize,
      propList = _Object$assign.propList,
      selectorBlackList = _Object$assign.selectorBlackList,
      keepRuleComment = _Object$assign.keepRuleComment,
      commentOfDisableAll = _Object$assign.commentOfDisableAll,
      commentOfDisableVW = _Object$assign.commentOfDisableVW,
      commentOfDisableRem = _Object$assign.commentOfDisableRem;

  var satisfyPropList = createPropListMatcher(propList);
  var isExcludeFile = false;
  var remReplace = null;
  var vwReplace = null;
  return function (css) {
    var filePath = css.source.input.file;

    if (exclude && (isFunction(exclude) && exclude(filePath) || isString(exclude) && filePath.indexOf(exclude) !== -1 || isRegExp(exclude) && filePath.match(exclude) !== null)) {
      isExcludeFile = true;
    } else {
      isExcludeFile = false;
    }

    var remRootValue = baseSize.rem;
    var vwRootValue = baseSize.vw;
    remReplace = createPxReplacer(remRootValue, minPixelValue, unitPrecision, 'rem');
    vwReplace = createPxReplacer(vwRootValue, minPixelValue, unitPrecision, 'vw'); // whole file

    isExcludeFile = css.nodes.some(function (item) {
      return item.type === 'comment' && item.text.trim() === commentOfDisableAll;
    }); // not convert rem

    if (isExcludeFile || css.nodes.some(function (item) {
      return item.type === 'comment' && item.text.trim() === commentOfDisableRem;
    })) {
      remReplace = null;
    } // not convert vw


    if (isExcludeFile || css.nodes.some(function (item) {
      return item.type === 'comment' && item.text.trim() === commentOfDisableVW;
    })) {
      vwReplace = null;
    }

    css.walkDecls(function (decl) {
      var next = decl.next();

      if (isExcludeFile || decl.value.indexOf('px') === -1 || !satisfyPropList(decl.prop) || inBlackList(selectorBlackList, decl.parent.selector) || next && next.type === 'comment' && next.text === keepRuleComment) {
        return;
      }

      var value = decl.value;
      var needConvertVw = baseSize.vw && vwReplace;
      var needConvertRem = baseSize.rem && remReplace;

      if (needConvertVw) {
        var _value = value.replace(REG_PX, vwReplace); // if rem unit already exists, do not add or replace


        if (!declarationExists(decl.parent, decl.prop, _value)) {
          if (needConvertRem) {
            decl.cloneAfter({
              value: _value
            });
          } else {
            decl.value = _value;
          }
        }
      }

      if (needConvertRem) {
        var _value2 = value.replace(REG_PX, remReplace); // if rem unit already exists, do not add or replace


        if (!declarationExists(decl.parent, decl.prop, _value2)) {
          decl.value = _value2;
        }
      }
    });
  };
}); // https://github.com/postcss/postcss/blob/main/docs/writing-a-plugin.md

module.exports = converter;
