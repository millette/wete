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
    this._knownPaths = new Set()
  }

  isKnown(page) {
    return this._knownPaths.has(page)
  }

  addKnown(page) {
    return this._knownPaths.add(page)
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

const diff = (a, b) => {
  const ret = new Map()
  a.forEach((x) => b.indexOf(x) === -1 && ret.set(x, "removed"))
  b.forEach((x) => a.indexOf(x) === -1 && ret.set(x, "added"))
  const out = {}
  ret.forEach((k, v) => {
    if (!out[k]) out[k] = []
    out[k].push(v)
  })
  return out
}

const yaya = (context) => {
  return (tree, file) => {
    file.data.newLinks = new Map()
    const currentPath = file.path

    const knownLinks = new Set(
      file.data.originalLinks && file.data.originalLinks.map(({ path }) => path)
    )
    delete file.data.originalLinks

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

            const selfLink = currentPath === href.pathname || undefined

            if (selfLink) {
              if (!properties.class) properties.class = []
              properties.class.push("wiki-is-selflink")
            }

            if (
              !context.isKnown(href.pathname) &&
              !knownLinks.has(href.pathname)
            ) {
              file.data.newLinks.set(href.pathname, text)
            }

            if (!file.data.internalLinks) file.data.internalLinks = []
            file.data.internalLinks.push({
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

    file.data.linkChanges = diff(
      Array.from(knownLinks.keys()),
      file.data.internalLinks
        ? file.data.internalLinks.map(({ path }) => path)
        : []
    )

    if (file.data.internalLinks && file.data.internalLinks.length)
      file.info(
        `Found ${file.data.internalLinks.length} local links (${file.data.newLinks.size} new).`
      )
    if (file.data.externalLinks && file.data.externalLinks.length)
      file.info(`Found ${file.data.externalLinks.length} external links.`)
  }
}

const prefixed = (p, ...rest) => [p, ...rest].join(":")

const toBatch = (vf, batch) => {
  if (!batch) throw new Error("Required batch array")
  delete vf.data.newLinks
  const page = vf.path.slice(1)
  const date = vf.data.updatedAt

  const type = "put"
  const key = prefixed("page-version", page, date)
  const editor = vf.data.editor
  batch.push(
    {
      type,
      key,
      value: {
        ...vf.data,
        contents: vf.toString(),
      },
    },
    {
      type,
      key: prefixed("page", page),
      value: { key },
    }
  )
  /*
  const batch = [
    {
      type,
      key,
      value: {
        ...vf.data,
        contents: vf.toString(),
      },
    },
    {
      type,
      key: prefixed("page", page),
      value: { key },
    },
  ]
  */
  if (!vf.data.stub)
    batch.push({
      type,
      key: prefixed("change", date, page),
      value: editor,
    })

  if (vf.data.linkChanges) {
    // console.log("Batching", page, vf.data.linkChanges)
    if (vf.data.linkChanges.added)
      vf.data.linkChanges.added.forEach((elPath) =>
        batch.push({
          type,
          key: prefixed("backlink", elPath.slice(1), page),
          value: { date, editor },
        })
      )

    if (vf.data.linkChanges.removed)
      vf.data.linkChanges.removed.forEach((elPath) =>
        batch.push({
          type: "del",
          key: prefixed("backlink", elPath.slice(1), page),
        })
      )
    delete vf.data.linkChanges
  }

  return batch
}

const makeProcessor = (context) => {
  const p = unified()
    .use(parse)
    .use(sanitize)
    .use(yaya, context)
    .use(stringify).process

  const ppp = async (contents, editor, lulu, newPage) => {
    if (!lulu) throw new Error("Expecting a non-empty string or a Vfile.")

    const updatedAt = Date.now()
    let page
    if (typeof lulu === "string") {
      page = lulu[0] === "/" ? lulu.slice(1) : lulu
      if (!page) throw new Error("Expecting non-empty string.")
      lulu = newPage
        ? { data: { createdAt: updatedAt, creator: editor } }
        : await context.getContents(page)
    } else if (lulu instanceof Vfile) {
      if (newPage)
        throw new Error("newPage can't be true when page is a Vfile.")
      page = lulu.path.slice(1)
    } else {
      throw new Error("Expecting a non-empty string or a Vfile.")
    }

    const wholeBatch = []

    if (lulu.data.internalLinks) {
      lulu.data.originalLinks = lulu.data.internalLinks
    }
    context.addKnown(`/${page}`)
    const out = await p(
      new Vfile({
        path: `/${page}`,
        cwd: "/",
        extname: "",
        data: {
          title: page,
          ...lulu.data,
          editor,
          editOf: lulu.data.updatedAt,
          updatedAt,
          internalLinks: undefined,
          externalLinks: undefined,
        },
        contents,
      })
    )

    const docs = new Map()

    out.data.newLinks.forEach(async (v, path) => {
      context.addKnown(path)
      const out222 = await p(
        new Vfile({
          path,
          cwd: "/",
          extname: "",
          data: {
            title: path.slice(1),
            stub: true,
            creator: editor,
            editor,
            createdAt: updatedAt,
            updatedAt,
          },
          contents: `<p>Stub of <code>${path.slice(
            1
          )}</code> from <code><a href="/${page}">${page} (${v})</a></code> by <code>${editor}</code>.</p>`,
        })
      )
      toBatch(out222, wholeBatch)
      docs.set(path, out222)
    })

    toBatch(out, wholeBatch)
    docs.set(out.path, out)
    return { docs, wholeBatch }
  }
  return ppp
}

module.exports = {
  Context,
  makeProcessor,
}
