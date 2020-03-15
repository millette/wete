"use strict"

// npm
const Vfile = require("vfile")
const unified = require("unified")
const parse = require("rehype-parse")
const sanitize = require("rehype-sanitize")
const stringify = require("rehype-stringify")

// self
const yaya = require("./yaya")

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

  if (!vf.data.stub)
    batch.push({
      type,
      key: prefixed("change", date, page),
      value: editor,
    })

  if (vf.data.linkChanges) {
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

module.exports = makeProcessor
