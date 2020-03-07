"use strict"

// npm
const Vfile = require("vfile")

class WikiFile extends Vfile {
  constructor(options) {
    if (options.page) {
      if (options.page[0] === "/") throw new Error("Page can't start with a /.")
      if (!options.path) options.path = `/${options.page}`
    }
    delete options.page
    if (!options.path) throw new Error("Page or Path required.")
    if (options.path[0] !== "/") throw new Error("Path must start with a /.")
    super(options)
  }
}

// module.exports = WikiFile

const wf = new WikiFile({ page: "home.html" })

const log = (x) => console.log(x.path, JSON.stringify(x, null, 2))
log(wf)
