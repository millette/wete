"use strict"

// npm
const unified = require("unified")
const parse = require("rehype-parse")
const sanitize = require("rehype-sanitize")
const stringify = require("rehype-stringify")

// self
const yaya = require("./yaya")

const makeProcessor = (allPages) => {
  return unified()
    .use(parse)
    .use(sanitize)
    .use(yaya, { allPages })
    .use(stringify).process
}

module.exports = makeProcessor
