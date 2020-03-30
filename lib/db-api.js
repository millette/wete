"use strict"

// npm
// const level = require("level")
const { toArray } = require("streamtoarray")

// self
const prefixed = require("./prefixed")

class DbApi {
  constructor(db) {
    this._db = db
  }

  /*
  bracket(type, { page, keyOnly, ...opts } = {}) {
    const p = prefixed(type, page)
    const op = keyOnly ? "createKeyStream" : "createReadStream"
    console.log("page, keyOnly, op", page, keyOnly, op)

    return this._db[op]({
      gt: prefixed(p, ""),
      lt: prefixed(p, "\ufff0"),
      ...opts,
    })
  }
  */

  bracket(type, { page, ...opts } = {}) {
    const p = prefixed(type, page)
    // const op = keyOnly ? "createKeyStream" : "createReadStream"
    // console.log("page, keyOnly, op", page, keyOnly, op)

    return this._db.createReadStream({
      gt: prefixed(p, ""),
      lt: prefixed(p, "\ufff0"),
      ...opts,
    })
  }

  async recentChanges() {
    return toArray(this.bracket("change", { reverse: true }))
  }

  async allPages() {
    return toArray(this.bracket("page"))
  }

  async pageLatest(page) {
    return new Promise((resolve, reject) => {
      let isDone
      const done = (x) => {
        if (x instanceof Error) {
          isDone = true
          return reject(x)
        }
        if (isDone) return
        isDone = true
        if (x) resolve(x)
        else reject(Object.assign(new Error("Not found."), { statusCode: 404 }))
      }

      this.bracket("page-version", { page, reverse: true, limit: 1 })
        .once("data", done)
        .once("end", done)
        .once("error", done)
    })
  }

  /*
  async pageVersions(page, keyOnly) {
    if (!page) throw Object.assign(new Error("Not found."), { statusCode: 404 })
    console.log("page, keyOnly", page, keyOnly)
    return toArray(
      this.bracket("page-version", { page, keyOnly, reverse: true })
    )
  }
  */

  async pageVersions(page) {
    if (!page) throw Object.assign(new Error("Not found."), { statusCode: 404 })
    return toArray(this.bracket("page-version", { page, reverse: true }))
  }

  async pageBacklinks(page) {
    if (!page) throw Object.assign(new Error("Not found."), { statusCode: 404 })
    return toArray(this.bracket("backlink", { page }))
  }

  async pageLinks(page) {
    const {
      value: { internalLinks },
    } = await pageLatest(page)
    return internalLinks
  }
}

module.exports = DbApi
