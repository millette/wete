"use strict"

const freshTemplate = require("./init-template")
const freshCss = require("./init-css")
const freshJs = require("./init-js")

const init = async () => {
  console.log("Fresh js...")
  await freshJs()
  console.log("Fresh template and css...")
  return Promise.all([freshTemplate(), freshCss()])
  // console.log("Launching...")
  // return dbname
}

module.exports = init
