"use strict"

// core
const fs = require("fs").promises

// self
const { mtime } = require("./init-utils")

// npm
const { rollup } = require("rollup")
const resolve = require("@rollup/plugin-node-resolve")
const commonjs = require("@rollup/plugin-commonjs")
const { terser } = require("rollup-plugin-terser")

const input = "main.js"
const file = "dist/main.min.js"

const inputOptions = {
  input,
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
  file,
  plugins: [terser()],
  format: "iife", // esm
  globals: {
    "pell/src/pell": "pell",
    neverland: "neverland",
  },
}

const oy = async () => {
  const bundle = await rollup(inputOptions)
  // console.log(bundle.watchFiles) // an array of file names this bundle depends on
  // const { output } = await bundle.generate(outputOptions)
  await bundle.write(outputOptions)
}

const freshJs = async () => {
  // console.log("freshJs")

  // const fn1 = "tadam.js"
  // const fn2 = "index.html"
  const zaza1 = await mtime(file)
  const zaza2 = await mtime(input)
  if (zaza2 >= zaza1) return oy()
  // return oy()
  // TODO:
  // 1. rollup js (minifies and writes to dist/main.min.js)
}

module.exports = freshJs
