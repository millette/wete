"use strict"

// npm
const vfile = require("to-vfile")
const visit = require("unist-util-visit")
const unified = require("unified")
const markdown = require("remark-parse")
const remark2rehype = require("remark-rehype")
const html = require("rehype-stringify")
const remarkAttr = require("remark-attr")
const sanitize = require("rehype-sanitize")
const merge = require("deepmerge")
const gh = require("hast-util-sanitize/lib/github")

const move = (options) => {
  const expected = (options || {}).extname
  if (!expected) throw new Error("Missing `extname` in options")

  return (tree, file) => {
    if (file.extname !== expected) file.extname = expected
  }
}

const visitor = (node) => {
  if (
    node.type === "link" &&
    node.data &&
    node.data.hProperties &&
    node.data.hProperties["data-embed"] === ""
  )
    node.data.hProperties["data-embed"] = true
}

const embedder = () => (tree, file) => {
  if (!file.contents) throw new Error("empty")
  visit(tree, visitor)
}

const a = ["data-embed"]
const mdOpts = { footnotes: true, gfm: true, commonmark: true }
const process = unified()
  .use(markdown, mdOpts)
  .use(remarkAttr, { scope: "extended", extend: { link: a } })
  .use(move, { extname: ".html" })
  .use(embedder)
  .use(remark2rehype, mdOpts)
  .use(html, mdOpts)
  .use(sanitize, merge(gh, { attributes: { a } })).process

const trFile = async (fn) => {
  const a = typeof fn === "string" ? await vfile.read(fn) : new vfile(fn)
  const b = await process(a)
  await vfile.write(b)
  return b
}

module.exports = trFile
