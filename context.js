"use strict"

// npm
const Vfile = require("vfile")

class Context {
  constructor() {
    this._knownPaths = new Set()
  }

  isKnown(page) {
    return this._knownPaths.has(page)
  }

  addKnown(page) {
    return this._knownPaths.add(page)
  }

  async processBatch(batch) {
    // empty
  }

  async close() {
    // empty
  }

  // FIXME: replace page with path
  // fake it till you make it
  async getContents(page) {
    if (typeof page !== "string") throw new Error("Expecting non-empty string.")
    if (page[0] === "/") page = page.slice(1)
    if (!page) throw new Error("Expecting non-empty string.")
    if (page === "niet") throw new Error("Not found.")
    const createdAt = Date.now() - 98765
    const updatedAt = createdAt
    return new Vfile({
      path: `/${page}`,
      cwd: "/",
      extname: "",
      data: { title: page, editor: "al", creator: "al", createdAt, updatedAt },
      contents: `<p>content of ${page}</p>.`,
    })
  }
}

module.exports = Context
