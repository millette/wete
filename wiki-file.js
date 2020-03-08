"use strict"

// npm
const Vfile = require("vfile")

// self
const makeProcessor = require("./make-processor")

class WikiFile extends Vfile {
  constructor(options, context = {}) {
    if (options instanceof WikiFile) return super(options)
    if (typeof context !== "object")
      throw new Error("Missing context (object).")

    if (typeof options !== "object")
      throw new Error("Missing options (object).")
    if (options.page) {
      if (options.page[0] === "/") throw new Error("Page can't start with a /.")
      if (!options.path) options.path = `/${options.page}`
    }
    delete options.page
    if (!options.path) throw new Error("Page or Path required.")
    if (options.path[0] !== "/") throw new Error("Path must start with a /.")

    super({
      ...options,
      data: {
        type: "wiki-file",
      },
      extname: "",
      cwd: "/",
    })
    this.data.context = context
    this.processor = makeProcessor()
  }

  get page() {
    return this.stem
  }

  set contents(cnt) {
    throw new Error(
      "Do not set contents directly. Call async setContents() instead."
    )
  }

  async setContents(cnt) {
    if (typeof cnt === "string") {
      if (!cnt) throw new Error("Contents cannot be blank.")
      const oy = await this.processor(cnt)
      console.log("OY", oy)
      super.contents = oy.contents
      return this
    }
    if (cnt !== undefined)
      throw new Error("Contents should be a string if given.")

    return this
    /*
    if (!cnt) throw new Error("Contents cannot be blank.")
    if (typeof cnt === "string") super.contents = cnt
    elseif (typeof cnt === "function") {
      const c = await cnt()
      super.contents = c
    }

    return this
    */
  }
}

// module.exports = WikiFile

const log = (x) => console.log(x.page, JSON.stringify(x, null, 2))

const wf = new WikiFile({ page: "home" })
wf.setContents("<p>rah")
  .then(log)
  .catch(console.error)
