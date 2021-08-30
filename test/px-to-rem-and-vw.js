const postcss = require('postcss');
const expect = require('expect');
const pxtorem = require('../index.js');

describe('basic convert', () => {
  it('should work in basic example', () => {
    const input = `
    h1 {
       margin: 0 0 20px 20px;
       font-size: 32px;
       line-height: 1.2;
       letter-spacing: 1px;
    }`;
    const output = `
    h1 {
       margin: 0 0 0.26667rem 0.26667rem;
       margin: 0 0 2.66667vw 2.66667vw;
       font-size: 0.42667rem;
       font-size: 4.26667vw;
       line-height: 1.2;
       letter-spacing: 0.01333rem;
       letter-spacing: 0.13333vw;
    }`;
    const processed = postcss(pxtorem()).process(input).css;

    expect(processed).toBe(output);
  });

  it('should work in basic example2', () => {
    const input = `
    h1 {
      width: 20px;
      height: 12vw;
      font-size: 0.5rem;
      font-size: 1px;
    }`;
    const output = `
    h1 {
      width: 0.26667rem;
      width: 2.66667vw;
      height: 12vw;
      font-size: 0.5rem;
      font-size: 0.01333rem;
      font-size: 0.13333vw;
    }`;
    const processed = postcss(pxtorem()).process(input).css;

    expect(processed).toBe(output);
  });

  it('should work in customize base size', () => {
    const input = `
    h1 {
      margin: 0 0 20px 20px;
      font-size: 32px;
      line-height: 1.2;
      letter-spacing: 1px;
    }`;
    const output = `
    h1 {
      margin: 0 0 0.1626rem 0.1626rem;
      margin: 0 0 1.62602vw 1.62602vw;
      font-size: 0.26016rem;
      font-size: 2.60163vw;
      line-height: 1.2;
      letter-spacing: 0.00813rem;
      letter-spacing: 0.0813vw;
    }`;
    const processed = postcss(
      pxtorem({
        baseSize: {
          rem: 123,
          vw: 12.3,
        },
      })
    ).process(input).css;

    expect(processed).toBe(output);
  });
});
