"use strict"

// core
const util = require("util")
const fs = require("fs").promises

// self
const { mtime } = require("./init-utils")

// npm
// const { renderSync } = require("sass")
const sass = require("sass")
const { default: PurgeCSS } = require("purgecss")

const render = util.promisify(sass.render)

const file = "style.scss"
const outFile = "dist/style.min.css"

const purge = async (raw) => {
  // console.log(typeof raw, raw.length)
  const purgeCSSResult = await new PurgeCSS().purge({
    content: ["index.html", "dist/main.min.js"],
    css: [{ raw }],
  })
  return purgeCSSResult
}

const css = async () => {
  // console.log("REFRESH!!!!")

  const { css } = await render({
    file,
    // outFile,
    outputStyle: "compressed",
  })
  // console.log("css", css.toString().length)
  // await fs.writeFile(outFile, css)
  const ppp = await purge(css) // .toString()
  // console.log("ppp", Object.keys(ppp[0]))
  // console.log("purged", ppp[0].css.length)
  // console.log("ppp-file", ppp[0].file)
  return fs.writeFile(outFile, ppp[0].css)
}

const freshCss = async () => {
  // console.log("freshCss")
  // TODO:
  // 1. convert sass/scss to css
  // 2. purgecss
  // 3. minify
  // 4. write to dist/style.min.css

  // const fn1 = "dist/style.min.css"
  // const fn2 = "style.scss"
  const zaza1 = await mtime(outFile)
  const zaza2 = await mtime(file)
  if (zaza2 >= zaza1) return css()
}

module.exports = freshCss
