"use strict"

// core
const fs = require("fs").promises

// self
const makeProcessor = require("./utils")
const DbContext = require("./db-context")
const DbApi = require("./db-api")

// npm
const unified = require("unified")
const parse = require("rehype-parse")
const stringify = require("rehype-stringify")
const { selectAll } = require("hast-util-select")
const toHtml = require("hast-util-to-html")

const heha = () => (tree, file) => {
  file.data.firstPage = toHtml(selectAll("#cnt *", tree)).trim()
}

const processor = unified()
  .use(parse, { emitParseErrors: true })
  .use(heha)
  .use(stringify).process

const tmpl = () =>
  fs
    .readFile("index.html", "utf-8")
    .then(processor)
    .then(({ data: { firstPage } }) => firstPage)

function abcd(err, { level }, done) {
  if (err) return done(err)

  const api = new DbApi(level)
  const ctx = new DbContext(level)

  return api
    .pageLatest("wiki")
    .catch(async () => {
      const contents = await tmpl()
      const p = makeProcessor(ctx)
      return p(contents, "admin", "wiki", true).then(({ wholeBatch }) =>
        ctx.processBatch(wholeBatch)
      )
    })
    .then(() => done())
    .catch(done)
}

module.exports = abcd
