"use strict"

// npm
const freshTemplate = require("./init-template")
const freshCss = require("./init-css")
const freshJs = require("./init-js")
const config = require("./init-config")

const init = async () => {
  await config()
  console.log("Fresh js...")
  await freshJs()
  console.log("Fresh template and css...")
  return Promise.all([freshTemplate(), freshCss()])
}

module.exports = init
