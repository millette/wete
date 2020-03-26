"use strict"

const freshTemplate = require("./init-template")
const freshCss = require("./init-css")
const freshJs = require("./init-js")

const init = async () => {
  await freshJs()
  return Promise.all([freshTemplate(), freshCss()])
}

module.exports = init
