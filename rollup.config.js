import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import copy from 'rollup-plugin-copy'
import pkg from './package.json';

export default [
  {
    input: 'src/index.js',
    external: ['react'],
    output: [
      // CommonJS
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
      },
      // ES module
      {
        file: pkg.module,
        format: 'es',
        sourcemap: true,
      },
      // UMD
      {
        file: pkg.browser,
        format: 'umd',
        name: 'CalendarHeatmap',
        globals: {
          react: 'React',
        },
      },
    ],
    plugins: [
      nodeResolve(),
      babel({
        exclude: ['node_modules/**'],
      }),
      // Setting correct NODE_ENV for react
      replace({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      }),
      // Needs to happen after babel plugin
      commonjs(),
      copy({
        targets: [
          { src: 'src/types/index.d.ts', dest: 'dist/' },
        ]
      })
    ],
  },
];
