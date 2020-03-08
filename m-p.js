"use strict"

// npm
const unified = require("unified")
const parse = require("rehype-parse")
const sanitize = require("rehype-sanitize")
const stringify = require("rehype-stringify")

// self
const yaya2 = require("./yaya2")

const makeProcessor = () => {
  const p = unified()
    .use(parse)
    .use(sanitize)
    .use(yaya)
    .use(stringify).process

  return async (x) => {
    const ret = await p(x)
    return WikiFile(ret)
  }
}

module.exports = makeProcessor
