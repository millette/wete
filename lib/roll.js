"use strict"

// npm
const { rollup } = require("rollup")
const resolve = require("@rollup/plugin-node-resolve")
const commonjs = require("@rollup/plugin-commonjs")
const { terser } = require("rollup-plugin-terser")

const inputOptions = {
  input: "main.js",
  plugins: [
    resolve(),
    commonjs({
      namedExports: {
        "js-cookie": ["Cookies"],
      },
    }),
  ],
}

const outputOptions = {
  file: "dist/main.min.js",
  plugins: [terser()],
  format: "iife", // esm
  globals: {
    "pell/src/pell": "pell",
    neverland: "neverland",
  },
}

const oy = async () => {
  const bundle = await rollup(inputOptions)
  console.log(bundle.watchFiles) // an array of file names this bundle depends on
  const { output } = await bundle.generate(outputOptions)
  await bundle.write(outputOptions)
}

oy().catch(console.error)
