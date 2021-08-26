import path from 'path';
import pkg from './package.json';
import babel from '@rollup/plugin-babel';

export default {
  input: path.resolve(__dirname, './src/index.js'),
  output: {
    file: path.resolve(__dirname, pkg.main),
    format: 'cjs',
    exports: 'auto',
  },
  plugins: [babel({ babelHelpers: 'bundled' })],
};
