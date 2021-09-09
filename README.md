# postcss-pixel-to-remvw

a postcss plugin for converting px to rem and vw, also you can choose only convert one of then.

**This version requires `postcss` version 8**

For postcss v7, you have to use [postcss-pixel-to-remvw v1](https://github.com/ben-lau/postcss-pixel-to-remvw/tree/older-postcss)

# Install

```
npm install postcss-pixel-to-remvw -D
```

# Example

## normal

- Input

```css
h1 {
  margin: 0 0 20px 20px;
  font-size: 32px;
  line-height: 1.2;
  letter-spacing: 1px;
}
```

- Output

```css
h1 {
  margin: 0 0 0.26667rem 0.26667rem;
  margin: 0 0 2.66667vw 2.66667vw;
  font-size: 0.42667rem;
  font-size: 4.26667vw;
  line-height: 1.2;
  letter-spacing: 0.01333rem;
  letter-spacing: 0.13333vw;
}
```

## not convert to vw (compact with the pc)

- Input

```css
/*disable-convert-vw*/
h1 {
  margin: 0 0 20px 20px;
  font-size: 32px;
  line-height: 1.2;
  letter-spacing: 1px;
}
```

- Output

```css
/*disable-convert-vw*/
h1 {
  margin: 0 0 0.26667rem 0.26667rem;
  font-size: 0.42667rem;
  line-height: 1.2;
  letter-spacing: 0.01333rem;
}
```

## not convert some

- Input

```css
/*disable-convert-vw*/
h1 {
  margin: 0 0 20px 20px;
  font-size: 32px; /*no*/
  line-height: 1.2;
  letter-spacing: 1px;
}
```

- Output

```css
/*disable-convert-vw*/
h1 {
  margin: 0 0 0.26667rem 0.26667rem;
  font-size: 32px; /*no*/
  line-height: 1.2;
  letter-spacing: 0.01333rem;
}
```

# Usage

## In Webpack

```javascript
const pxtoremvw = require('postcss-pixel-to-remvw');
export default {
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader!postcss-loader',
      },
    ],
  },
  postcss: [pxtoremvw(/*options*/)],
};
```

## common usage

```javascript
const { writeFile, readFileSync } = require('fs');
const postcss = require('postcss');
const pxtoremvw = require('postcss-pixel-to-remvw');

const processedCss = postcss(pxtoremvw()).process(readFileSync('test.css')).css;

writeFile('test.remvw.css', processedCss, err => {
  if (err) throw err;
  console.log('Rem file written.');
});
```

# Configuration

default:

```javascript
{
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
```

- `baseSize` {Object} the base size config, default is { rem: 75, vw: 7.5 }
  - `rem` {Number} the root element font size, means 1rem = [your setting] px
  - `vw` {Number} the base ratio for viewport width, means 1vw = [your setting] px
- `unitPrecision` {Number} the digital accurarcy of converted stylesheet
- `selectorBlackList` {string[]} The selectors list to ignore conversion
  - If value is string, it checks to see if selector contains the string.['body'] will match .body-class
  - If value is regexp, it checks to see if the selector matches the regexp. [/^body$/] will match body but not .body
- `propList` {string[]} The properties that can do the conversion.
  - Values need to be exact matches.
  - Use wildcard _ to enable all properties. Example: ['_']
  - Use * at the start or end of a word. (['*position\*'] will match background-position-y)
  - Use ! to not match a property. Example: ['*', '!letter-spacing']
  - Combine the "not" prefix with the other prefixes. Example: ['*', '!font*']
- `minPixelValue` {Number} the minimum pixel value to replace
- `exclude` {String | Regexp | ()=>boolean} the file path to ignore conversion
  - If value is string, it checks to see if file path contains the string.
    - 'exclude' will match \project\postcss-pxtorem\exclude\path
  - If value is regexp, it checks to see if file path matches the regexp.
    - /exclude/i will match \project\postcss-pxtorem\exclude\path
  - If value is function, you can use exclude function to return a true and the file will be ignored.
    - the callback will pass the file path as a parameter, it should returns a Boolean result.
    - function (file) { return file.indexOf('exclude') !== -1; }
- `keepRuleComment` {String} a comment stating that the property will not be converted
- `commentOfDisableAll` {String} a comment stating that the whole file will not be converted
- `commentOfDisableRem` {String} a comment stating that the whole file will not be converted to rem,but keep convert to vw
- `commentOfDisableVW` {String} a comment stating that the whole file will not be converted to vw,but keep convert to rem

# TODO

- [x] compact with older version of postcss
- [x] unit test
  - [x] baseSize
  - [ ] unitPrecision
  - [ ] selectorBlackList
  - [ ] propList
  - [ ] minPixelValue
  - [ ] exclude
  - [x] keepRuleComment
  - [x] commentOfDisableAll
  - [x] commentOfDisableRem
  - [x] commentOfDisableVW

Thanks to [postcss-pxtorem](https://github.com/cuth/postcss-pxtorem)
