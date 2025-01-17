import fs from 'fs';
import path from 'path';
import ts from 'rollup-plugin-ts';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [
  {
    input: 'src/background/index.ts',
    output: {
      file: 'build/background/index.js',
      format: 'es',
    },
    plugins: getTsPlugins(),
    watch: {
      clearScreen: false,
    },
  },
  {
    input: 'src/contentScript/index.ts',
    output: {
      file: 'build/contentScript/index.js',
      format: 'iife',
    },
    plugins: getTsPlugins(),
    watch: {
      clearScreen: false,
    },
  },
  {
    input: 'src/injection/index.ts',
    output: {
      file: 'build/injection/index.js',
      format: 'iife',
    },
    plugins: getTsPlugins(),
    watch: {
      clearScreen: false,
    },
  },
  {
    input: 'rollup.unused.js',
    output: {
      file: 'unused/link.js',
    },
    plugins: [
      link(),
    ],
    watch: false,
    watch: {
      clearScreen: false,
    },
  },
];

function getTsPlugins() {
  return [
    commonjs(),
    replace({
      preventAssignment: true,
      'process.env.DEV': 'true',
    }),
    ts({
      tsconfig: {
        resolveJsonModule: true,
        allowSyntheticDefaultImports: true,
      },
    }),
    nodeResolve(),
    json({
      namedExports: false,
    }),
  ];
}

function link() {
  let done = false;

  return {
    name: 'link',
    buildStart() {
      if (done) {
        return;
      }

      const srcDir = path.resolve(__dirname, 'src');
      const dstDir = path.resolve(__dirname, 'build');
      if (!fs.existsSync(dstDir)) {
        fs.mkdirSync(dstDir);
      }

      const popupSrcDir = path.resolve(srcDir, 'popup/build');
      const popupDstDir = path.resolve(dstDir, 'popup');
      if (!fs.existsSync(popupDstDir)) {
        fs.symlinkSync(popupSrcDir, popupDstDir, 'dir');
      }

      const manifestSrc = path.resolve(srcDir, 'manifest.json');
      const manifestDst = path.resolve(dstDir, 'manifest.json');
      if (!fs.existsSync(manifestDst)) {
        fs.symlinkSync(manifestSrc, manifestDst, 'file');
      }

      const assetSrcDir = path.resolve(srcDir, 'assets');
      const assetDstDir = path.resolve(dstDir, 'assets');
      if (!fs.existsSync(assetDstDir)) {
        fs.symlinkSync(assetSrcDir, assetDstDir, 'dir');
      }

      done = true;
    },
  };
}
