/**@typedef {{baseSize: {rem:number,vw:number},unitPrecision: number,selectorBlackList: string[],propList: string[],minPixelValue: number,exclude: string|RegExp|()=>boolean ,commentOfDisableAll:string,commentOfDisableRem:string,commentOfDisableVW:string}} Options */

/**
 * @type {Options}
 */
const defaults = {
  baseSize: {
    rem: 75, // 10rem = 750px
    vw: 7.5, // 100vw = 750px
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
  commentOfDisableVW: 'disable-convert-vw',
};

const REG_PX = /"[^"]+"|'[^']+'|url\([^)]+\)|(\d*\.?\d+)px/g;

const isFunction = target => typeof target === 'function';

const isString = target => typeof target === 'string';

const toFixed = (number, precision) => {
  const multiplier = 10 ** (precision + 1);
  const wholeNumber = Math.floor(number * multiplier);
  return (Math.round(wholeNumber / 10) * 10) / multiplier;
};

const filterPropList = {
  exact: list => list.filter(m => m.match(/^[^*!]+$/)),
  contain: list =>
    list.filter(m => m.match(/^\*.+\*$/)).map(m => m.substr(1, m.length - 2)),
  endWith: list => list.filter(m => m.match(/^\*[^*]+$/)).map(m => m.substr(1)),
  startWith: list =>
    list.filter(m => m.match(/^[^*!]+\*$/)).map(m => m.substr(0, m.length - 1)),
  notExact: list =>
    list.filter(m => m.match(/^![^*].*$/)).map(m => m.substr(1)),
  notContain: list =>
    list.filter(m => m.match(/^!\*.+\*$/)).map(m => m.substr(2, m.length - 3)),
  notEndWith: list =>
    list.filter(m => m.match(/^!\*[^*]+$/)).map(m => m.substr(2)),
  notStartWith: list =>
    list.filter(m => m.match(/^![^*]+\*$/)).map(m => m.substr(1, m.length - 2)),
};

// px replacer creator
const createPxReplacer =
  (perRatio, minPixelValue, unitPrecision, unit) => (origin, $1) => {
    const pixels = parseFloat($1);
    if (!$1 || pixels <= minPixelValue) {
      return origin;
    } else {
      return `${toFixed(pixels / perRatio, unitPrecision)}${unit}`;
    }
  };

const inBlackList = (blacklist, selector) => {
  if (typeof selector !== 'string') {
    return false;
  }
  return blacklist.some(regex => {
    if (typeof regex === 'string') {
      return selector.indexOf(regex) !== -1;
    }
    return selector.match(regex);
  });
};

const createPropListMatcher = propList => {
  const hasWild = propList.indexOf('*') > -1;
  const matchAll = hasWild && propList.length === 1;
  const lists = {
    exact: filterPropList.exact(propList),
    contain: filterPropList.contain(propList),
    startWith: filterPropList.startWith(propList),
    endWith: filterPropList.endWith(propList),
    notExact: filterPropList.notExact(propList),
    notContain: filterPropList.notContain(propList),
    notStartWith: filterPropList.notStartWith(propList),
    notEndWith: filterPropList.notEndWith(propList),
  };
  return prop => {
    if (matchAll) return true;
    return (
      (hasWild ||
        lists.exact.indexOf(prop) > -1 ||
        lists.contain.some(m => prop.indexOf(m) > -1) ||
        lists.startWith.some(m => prop.indexOf(m) === 0) ||
        lists.endWith.some(m => prop.indexOf(m) === prop.length - m.length)) &&
      !(
        lists.notExact.indexOf(prop) > -1 ||
        lists.notContain.some(m => prop.indexOf(m) > -1) ||
        lists.notStartWith.some(m => prop.indexOf(m) === 0) ||
        lists.notEndWith.some(m => prop.indexOf(m) === prop.length - m.length)
      )
    );
  };
};

const declarationExists = (decls, prop, value) =>
  decls.some(decl => decl.prop === prop && decl.value === value);

/**
 * @param {Partial<Options>} options
 */
const converter = (options = {}) => {
  const {
    exclude,
    unitPrecision,
    minPixelValue,
    baseSize,
    propList,
    selectorBlackList,
    keepRuleComment,
    commentOfDisableAll,
    commentOfDisableVW,
    commentOfDisableRem,
  } = Object.assign({}, defaults, options);

  const satisfyPropList = createPropListMatcher(propList);
  let isExcludeFile = false;
  let remReplace = null;
  let vwReplace = null;

  return {
    postcssPlugin: 'postcss-px-to-remvw',
    Once(css) {
      const filePath = css.source.input.file;

      if (
        exclude &&
        ((isFunction(exclude) && exclude(filePath)) ||
          (isString(exclude) && filePath.indexOf(exclude) !== -1) ||
          filePath.match(exclude) !== null)
      ) {
        isExcludeFile = true;
      } else {
        isExcludeFile = false;
      }

      const remRootValue = baseSize.rem;
      const vwRootValue = baseSize.vw;
      const [firstNode] = css.nodes;

      remReplace = createPxReplacer(
        remRootValue,
        minPixelValue,
        unitPrecision,
        'rem'
      );
      vwReplace = createPxReplacer(
        vwRootValue,
        minPixelValue,
        unitPrecision,
        'vw'
      );

      if (firstNode && firstNode.type === 'comment') {
        // whole file
        if (firstNode.text.trim() === commentOfDisableAll) {
          isExcludeFile = true;
        }

        // not convert rem
        if (isExcludeFile || firstNode.text.trim() === commentOfDisableRem) {
          remReplace = null;
        }

        // not convert vw
        if (isExcludeFile || firstNode.text.trim() === commentOfDisableVW) {
          vwReplace = null;
        }
      }
    },
    Declaration(decl) {
      const next = decl.next();
      if (
        isExcludeFile ||
        decl.value.indexOf('px') === -1 ||
        !satisfyPropList(decl.prop) ||
        inBlackList(selectorBlackList, decl.parent.selector) ||
        (next && next.type === 'comment' && next.text === keepRuleComment)
      ) {
        return;
      }
      const value = decl.value;

      if (baseSize.vw && vwReplace) {
        const _value = value.replace(REG_PX, vwReplace);

        // if rem unit already exists, do not add or replace
        if (!declarationExists(decl.parent, decl.prop, _value)) {
          if (remReplace) {
            decl.cloneAfter({ value: _value });
          } else {
            decl.value = _value;
          }
        }
      }

      if (baseSize.rem && remReplace) {
        const _value = value.replace(REG_PX, remReplace);

        // if rem unit already exists, do not add or replace
        if (!declarationExists(decl.parent, decl.prop, _value)) {
          decl.value = _value;
        }
      }
    },
  };
};

// https://github.com/postcss/postcss/blob/main/docs/writing-a-plugin.md
converter.postcss = true;

export default converter;
