import { style, globalFontFace, globalStyle } from '@vanilla-extract/css';

export const base = style({
  border: 0,
  boxSizing: 'border-box',
  fontSize: '100%',
  lineHeight: 'normal',
  margin: 0,
  padding: 0,
  textAlign: 'left',
  verticalAlign: 'baseline',
  WebkitTapHighlightColor: 'transparent',
});

globalStyle('@import url("https://at.alicdn.com/t/c/font_4714049_v2ep5icmokp.css")', {});
globalStyle('@import url("https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap")', {});

globalFontFace('SwitzerBold', {
  src: `url('https://d13t1x9bdoguib.cloudfront.net/static/fonts/Switzer-Semibold.ttf') format('truetype')`,
});
globalFontFace('SwitzerMedium', {
  src: `url('https://d13t1x9bdoguib.cloudfront.net/static/fonts/Switzer-Medium.ttf') format('truetype')`,
});
globalFontFace('SwitzerLight', {
  src: `url('https://d13t1x9bdoguib.cloudfront.net/static/fonts/Switzer-Light.ttf') format('truetype')`,
});
globalFontFace('Switzer', {
  src: `url('https://d13t1x9bdoguib.cloudfront.net/static/fonts/Switzer-Regular.ttf') format('truetype')`,
});

const list = style({
  listStyle: 'none',
});

const quote = style({
  quotes: 'none',
  selectors: {
    '&:before, &:after': {
      content: "''",
    },
  },
});

const table = style({
  borderCollapse: 'collapse',
  borderSpacing: 0,
});

const appearance = style({
  appearance: 'none',
});

// biome-ignore format: design system keys
const field = style([
  appearance,
  {
    '::placeholder': {
      opacity: 1,
    },
    'outline': 'none',
  },
]);

const mark = style({
  backgroundColor: 'transparent',
  color: 'inherit',
});

// biome-ignore format: design system keys
const select = style([
  field,
  {
    ':disabled': {
      opacity: 1,
    },
    'selectors': {
      '&::-ms-expand': {
        display: 'none',
      },
    },
  },
]);

const input = style([
  field,
  {
    selectors: {
      '&::-ms-clear': {
        display: 'none',
      },
      '&::-webkit-search-cancel-button': {
        WebkitAppearance: 'none',
      },
    },
  },
]);

const button = style({
  background: 'none',
  cursor: 'pointer',
  textAlign: 'left',
});

const a = style({
  color: 'inherit',
  textDecoration: 'none',
});

export const element = {
  a,
  blockquote: quote,
  button,
  input,
  mark,
  ol: list,
  q: quote,
  select,
  table,
  textarea: field,
  ul: list,
};
