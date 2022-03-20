const postcss = require('postcss');
const expect = require('expect');
const pxtorem = require('../index.js');

describe('ignore some situations', () => {
  it('should not convert some property with disabled comment', () => {
    const input = `
    h1 {
       margin: 0 0 20px 20px;
       font-size: 32px; /*no*/
       line-height: 1.2;
       letter-spacing: 1px;
    }`;
    const output = `
    h1 {
       margin: 0 0 0.26667rem 0.26667rem;
       margin: 0 0 2.66667vw 2.66667vw;
       font-size: 32px; /*no*/
       line-height: 1.2;
       letter-spacing: 0.01333rem;
       letter-spacing: 0.13333vw;
    }`;
    const processed = postcss(pxtorem()).process(input).css;

    expect(processed).toBe(output);
  });

  it('should not convert some property with new disabled comment', () => {
    const input = `
    h1 {
       margin: 0 0 20px 20px;
       font-size: 32px; /*no-convert*/
       line-height: 1.2;
       letter-spacing: 1px;
    }`;
    const output = `
    h1 {
       margin: 0 0 0.26667rem 0.26667rem;
       margin: 0 0 2.66667vw 2.66667vw;
       font-size: 32px; /*no-convert*/
       line-height: 1.2;
       letter-spacing: 0.01333rem;
       letter-spacing: 0.13333vw;
    }`;
    const processed = postcss(
      pxtorem({ keepRuleComment: 'no-convert' })
    ).process(input).css;

    expect(processed).toBe(output);
  });

  it('should not convert to rem in whole file with disabled comment at the top', () => {
    const input = `
    /*disable-convert-rem*/
    h1 {
       margin: 0 0 20px 20px;
       font-size: 32px;
       line-height: 1.2;
       letter-spacing: 1px;
    }`;
    const output = `
    /*disable-convert-rem*/
    h1 {
       margin: 0 0 2.66667vw 2.66667vw;
       font-size: 4.26667vw;
       line-height: 1.2;
       letter-spacing: 0.13333vw;
    }`;
    const processed = postcss(pxtorem()).process(input).css;

    expect(processed).toBe(output);
  });

  it('should not convert to rem in whole file with new disabled comment at the top', () => {
    const input = `
    /*no-convert-rem*/
    h1 {
       margin: 0 0 20px 20px;
       font-size: 32px;
       line-height: 1.2;
       letter-spacing: 1px;
    }`;
    const output = `
    /*no-convert-rem*/
    h1 {
       margin: 0 0 2.66667vw 2.66667vw;
       font-size: 4.26667vw;
       line-height: 1.2;
       letter-spacing: 0.13333vw;
    }`;
    const processed = postcss(
      pxtorem({ commentOfDisableRem: 'no-convert-rem' })
    ).process(input).css;

    expect(processed).toBe(output);
  });

  it('should not convert to vw in whole file with disabled comment at the top', () => {
    const input = `
    /*disable-convert-vw*/
    h1 {
       margin: 0 0 20px 20px;
       font-size: 32px;
       line-height: 1.2;
       letter-spacing: 1px;
    }`;
    const output = `
    /*disable-convert-vw*/
    h1 {
       margin: 0 0 0.26667rem 0.26667rem;
       font-size: 0.42667rem;
       line-height: 1.2;
       letter-spacing: 0.01333rem;
    }`;
    const processed = postcss(pxtorem()).process(input).css;

    expect(processed).toBe(output);
  });

  it('should not convert to vw in whole file with new disabled comment at the top', () => {
    const input = `
    /*no-convert-vw*/
    h1 {
       margin: 0 0 20px 20px;
       font-size: 32px;
       line-height: 1.2;
       letter-spacing: 1px;
    }`;
    const output = `
    /*no-convert-vw*/
    h1 {
       margin: 0 0 0.26667rem 0.26667rem;
       font-size: 0.42667rem;
       line-height: 1.2;
       letter-spacing: 0.01333rem;
    }`;
    const processed = postcss(
      pxtorem({ commentOfDisableVW: 'no-convert-vw' })
    ).process(input).css;

    expect(processed).toBe(output);
  });

  it('should not convert to rem in whole file with disabled comment at the top and some property with disabled comment', () => {
    const input = `
    /*disable-convert-rem*/
    h1 {
       margin: 0 0 20px 20px;
       font-size: 32px; /*no*/
       line-height: 1.2;
       letter-spacing: 1px;
    }`;
    const output = `
    /*disable-convert-rem*/
    h1 {
       margin: 0 0 2.66667vw 2.66667vw;
       font-size: 32px; /*no*/
       line-height: 1.2;
       letter-spacing: 0.13333vw;
    }`;
    const processed = postcss(pxtorem()).process(input).css;

    expect(processed).toBe(output);
  });

  it('should not convert to rem in whole file with new disabled comment at the top and some property with new disabled comment', () => {
    const input = `
    /*no-convert-rem*/
    h1 {
       margin: 0 0 20px 20px;
       font-size: 32px; /*no-convert*/
       line-height: 1.2;
       letter-spacing: 1px;
    }`;
    const output = `
    /*no-convert-rem*/
    h1 {
       margin: 0 0 2.66667vw 2.66667vw;
       font-size: 32px; /*no-convert*/
       line-height: 1.2;
       letter-spacing: 0.13333vw;
    }`;
    const processed = postcss(
      pxtorem({
        keepRuleComment: 'no-convert',
        commentOfDisableRem: 'no-convert-rem',
      })
    ).process(input).css;

    expect(processed).toBe(output);
  });

  it('should not convert to vw in whole file with disabled comment at the top and some property with disabled comment', () => {
    const input = `
    /*disable-convert-vw*/
    h1 {
       margin: 0 0 20px 20px;
       font-size: 32px; /*no*/
       line-height: 1.2;
       letter-spacing: 1px;
    }`;
    const output = `
    /*disable-convert-vw*/
    h1 {
       margin: 0 0 0.26667rem 0.26667rem;
       font-size: 32px; /*no*/
       line-height: 1.2;
       letter-spacing: 0.01333rem;
    }`;
    const processed = postcss(pxtorem()).process(input).css;

    expect(processed).toBe(output);
  });

  it('should not convert to vw in whole file with new disabled comment at the top and some property with new disabled comment', () => {
    const input = `
    /*no-convert-vw*/
    h1 {
       margin: 0 0 20px 20px;
       font-size: 32px; /*no-convert*/
       line-height: 1.2;
       letter-spacing: 1px;
    }`;
    const output = `
    /*no-convert-vw*/
    h1 {
       margin: 0 0 0.26667rem 0.26667rem;
       font-size: 32px; /*no-convert*/
       line-height: 1.2;
       letter-spacing: 0.01333rem;
    }`;
    const processed = postcss(
      pxtorem({
        keepRuleComment: 'no-convert',
        commentOfDisableVW: 'no-convert-vw',
      })
    ).process(input).css;

    expect(processed).toBe(output);
  });

  it('should not convert to rem while `rem` in baseSize is undefined', () => {
    const input = `
   h1 {
      margin: 0 0 20px 20px;
      font-size: 32px;
      line-height: 1.2;
      letter-spacing: 1px;
   }`;
    const output = `
   h1 {
      margin: 0 0 1.33333vw 1.33333vw;
      font-size: 2.13333vw;
      line-height: 1.2;
      letter-spacing: 0.06667vw;
   }`;
    const processed = postcss(
      pxtorem({
        baseSize: {
          vw: 15,
        },
      })
    ).process(input).css;

    expect(processed).toBe(output);
  });

  it('should not convert to vw while `vw` in baseSize is undefined', () => {
    const input = `
   h1 {
      margin: 0 0 20px 20px;
      font-size: 32px;
      line-height: 1.2;
      letter-spacing: 1px;
   }`;
    const output = `
   h1 {
      margin: 0 0 0.53333rem 0.53333rem;
      font-size: 0.85333rem;
      line-height: 1.2;
      letter-spacing: 0.02667rem;
   }`;
    const processed = postcss(
      pxtorem({
        baseSize: {
          rem: 37.5,
        },
      })
    ).process(input).css;

    expect(processed).toBe(output);
  });
});
