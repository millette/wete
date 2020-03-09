"use strict"

// npm
const Vfile = require("vfile")
const unified = require("unified")
const parse = require("rehype-parse")
const sanitize = require("rehype-sanitize")
const stringify = require("rehype-stringify")
const { selectAll } = require("hast-util-select")

const baseUrl = new URL("file:")

class Context {
  constructor() {
    this._allPages = new Set()
  }

  isStub(page) {
    if (!this._allPages.has(page)) return true
  }
  // isPage (page) { return this._allPages.has(page) }
  addPage(page) {
    return this._allPages.add(page)
  }

  // FIXME: fake it till you make it
  async getContents(page) {
    if (page === "niet") throw new Error("Not found.")
    const createdAt = Date.now() - 98765
    const updatedAt = createdAt
    return new Vfile({
      path: `/${page}`,
      cwd: "/",
      extname: "",
      data: { editor: "al", creator: "al", createdAt, updatedAt, stub: true },
      contents: `<p>content of ${page}</p>.`,
    })
  }
}

const yaya = (context) => {
  /*
  return async (tree, file) => {
    const allPages = await context.getAllPages()
    console.log("TR", allPages)
  }
  */

  return (tree, file) => {
    // console.log("TR", file.path)
    const currentPage = file.path

    selectAll("a", tree).forEach(
      ({ properties, children: [{ value: text }] }) => {
        if (!text)
          return file.message(
            `Skipped link ${properties.href.pathname}, only text children are supported.`
          )

        const href = new URL(properties.href, baseUrl)
        switch (href.protocol) {
          case "file:":
            // TODO: optional base path
            // fix local links to start with /
            // FIXME: don't allow "." or "" or "/"
            if (properties.href === ".") properties.href = "/"
            else if (properties.href[0] !== "/")
              properties.href = `/${properties.href}`

            const selfLink = currentPage === href.pathname || undefined
            // const stub = !context.isPage(href.pathname) || undefined
            const stub = context.isStub(href.pathname)

            if (selfLink) {
              if (!properties.class) properties.class = []
              properties.class.push("wiki-is-selflink")
            }

            if (!file.data.internalLinks) file.data.internalLinks = []
            file.data.internalLinks.push({
              stub,
              selfLink,
              href: properties.href,
              path: href.pathname,
              text,
            })
            break

          case "http:":
          case "https:":
            // enhance external links
            properties.target = "_blank"
            if (!properties.rel) properties.rel = []
            properties.rel.push("noopener", "noreferrer")

            if (!file.data.externalLinks) file.data.externalLinks = []
            file.data.externalLinks.push({
              href: properties.href,
              text,
            })
            break

          default:
            file.message(`Link protocol not supported: ${href.protocol}`)
            return
        }
      }
    )
    if (file.data.internalLinks && file.data.internalLinks.length)
      file.info(`Found ${file.data.internalLinks.length} local links.`)
    if (file.data.externalLinks && file.data.externalLinks.length)
      file.info(`Found ${file.data.externalLinks.length} external links.`)
  }
}

const makeProcessor = (context) => {
  const p = unified()
    .use(parse)
    .use(sanitize)
    .use(yaya, context)
    .use(stringify).process

  const p2 = async (contents, editor, page, newPage) => {
    if (!page || typeof page !== "string")
      throw new Error("Expecting non-empty string.")
    if (page[0] === "/") page = page.slice(1)
    if (!page) throw new Error("Expecting non-empty string.")

    const updatedAt = Date.now()
    const lulu = newPage
      ? { data: { createdAt: updatedAt, creator: editor } }
      : await context.getContents(page)
    context.addPage(page)
    // console.log("OrigDoc", lulu)
    const vf = new Vfile({
      path: `/${page}`,
      cwd: "/",
      extname: "",
      data: {
        ...lulu.data,
        editor,
        stub: undefined,
        editOf: lulu.data.updatedAt,
        updatedAt,
      },
      contents,
    })
    return p(vf)
  }

  return p2
}

module.exports = {
  Context,
  makeProcessor,
}
