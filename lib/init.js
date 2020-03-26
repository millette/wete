"use strict"

const freshTemplate = require("./init-template")
const freshCss = require("./init-css")
const freshJs = require("./init-js")

const init = async () => Promise.all([freshTemplate(), freshCss(), freshJs()])

module.exports = init
