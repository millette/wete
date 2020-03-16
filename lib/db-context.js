"use strict"

// npm
const level = require("level")
const Vfile = require("vfile")

// self
const Context = require("./context")
const prefixed = require("./prefixed")

class DbContext extends Context {
  constructor(dbname) {
    super()
    this._db = level(dbname, { valueEncoding: "json" })

    // TODO: fetch all pages from db
    this._knownPaths = new Set()
  }

  async latestPageVersion(page) {
    return new Promise((resolve, reject) => {
      let ret
      const opts = {
        limit: 1,
        reverse: true,
        gt: prefixed("page-version", page, ""),
        lt: prefixed("page-version", page, "\ufff0"),
      }
      // console.log("OPTS", opts)
      this._db
        .createValueStream(opts)
        .once("data", (data) => {
          // console.log("ON-DATA", page, JSON.stringify(data, null, 2))
          ret = data
        })
        .once("end", () => {
          // console.log("DONE-DATA", page)
          if (ret) return resolve(ret)
          reject(new Error("Not found."))
        })
        .once("error", reject)
    })
  }

  async processBatch(batch) {
    return this._db.batch(batch)
  }

  async close() {
    return this._db.close()
  }

  async getContents(page) {
    console.log("getContents", page)
    if (typeof page !== "string") throw new Error("Expecting non-empty string.")
    if (page[0] === "/") page = page.slice(1)
    if (!page) throw new Error("Expecting non-empty string.")

    /*
    const opts = {
      limit: 1,
      reverse: true,
      gt: prefixed("page-version", page, ""),
      lt: prefixed("page-version", page, "\ufff0")
    }
    // console.log("OPTS", opts)
    this._db.createValueStream(opts)
    .on("data", (data) => {
      console.log("ON-DATA", page, JSON.stringify(data, null, 2))
    })
    .on("end", () => {
      console.log("DONE-DATA", page)
    })

    const pp = prefixed("page", page)
    const { key } = await this._db.get(pp)
    const { contents, ...data } = await this._db.get(key)
    */
    const { contents, ...data } = await this.latestPageVersion(page)
    return new Vfile({
      path: `/${page}`,
      cwd: "/",
      extname: "",
      data,
      contents,
    })
  }

  /*
  isKnown(page) {
    return this._knownPaths.has(page)
  }

  addKnown(page) {
    return this._knownPaths.add(page)
  }
  */

  // FIXME: replace page with path
  // fake it till you make it
  // async getContents(page) {
}

module.exports = DbContext
