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

  bracket(type, { page, keyOnly, ...opts } = {}) {
    const p = prefixed(type, page)
    const op = keyOnly ? "createKeyStream" : "createReadStream"
    return this._db[op]({
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
        else reject(new Error("Not found."))
      }

      this.bracket("page-version", { page, reverse: true, limit: 1 })
        .once("data", done)
        .once("end", done)
        .once("error", done)
    })
  }

  async pageVersions(page, keyOnly) {
    return toArray(
      this.bracket("page-version", { page, keyOnly, reverse: true })
    )
  }

  async pageBacklinks(page) {
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