import { rollup } from 'rollup';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';
import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';
import uglify from 'rollup-plugin-uglify';

export default {
    entry: 'notebook.js',
    dest: 'dist/notebook.min.js',
    moduleName: "nb",
    format: "iife",
    plugins: [
        json(),
        nodeResolve({
            jsnext: true,
            main: true
        }),
        commonjs({
            namedExports: {
                "node_modules/katex/dist/katex.min.js": ["katex"]
            }
        }),
        globals(),
        builtins(),
        babel({
            exclude: 'node_modules/**'
        })
    ]
};
