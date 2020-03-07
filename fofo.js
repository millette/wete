"use strict"

// npm
const Vfile = require("vfile")

// self
const makeProcessor = require("./make-processor")
const diff = require("./diff")

const prefixed = (p, ...rest) => [p, ...rest].join(":")

const processor = makeProcessor()

const vfile2obj = (vf) => {
  // if (!vf) return vf
  if (!(vf instanceof Vfile)) throw new Error("Expecting Vfile.")
  return {
    ...vf.data,
    contents: vf.contents,
    pathname: vf.pathname,
  }
}

const doit = (vf) => {
  const value = vfile2obj(vf)
  const type = "put"
  const page = value.pathname.slice(1)
  const key = prefixed("page-version", page, value.updatedAt)
  return [
    {
      type,
      key,
      value,
    },
    {
      type,
      key: prefixed("page", page),
      value: key,
    },
    {
      type,
      key: prefixed("change", value.updatedAt, page),
      value: value.editor,
    },
  ]
}

const obj2vfile = (doc) => {
  if (doc instanceof Vfile) return doc

  if (typeof doc !== "object") throw new Error("Wrong doc type (object).")
  const { updatedAt, editor, contents, pathname } = doc
  if (updatedAt && typeof updatedAt !== "number")
    throw new Error(
      "Wrong updatedAt type, expecting timestamp (number, defaults to now)."
    )

  if (!editor || typeof editor !== "string")
    throw new Error("Missing editor (string).")
  if (!contents || typeof contents !== "string")
    throw new Error("Missing contents (string).")

  // empty string is allowed
  if (typeof pathname !== "string")
    throw new Error("Missing pathname (string).")

  return new Vfile({
    contents,
    pathname: pathname[0] === "/" ? pathname : `/${pathname}`,
    data: {
      editor,
      updatedAt: updatedAt || Date.now(),
    },
  })
}

const updatePage = async (newDoc, oldDoc) => {
  if (oldDoc && !(oldDoc instanceof Vfile))
    throw new Error("Wrong oldDoc type (Vfile).")
  newDoc = obj2vfile(newDoc)
  newDoc.data.creator = oldDoc ? oldDoc.data.creator : newDoc.data.editor
  newDoc.data.createdAt = oldDoc ? oldDoc.data.createdAt : newDoc.data.updatedAt
  if (oldDoc) newDoc.data.editOf = oldDoc.data.updatedAt

  return processor(newDoc)

  // diff
}

module.exports = {
  updatePage,
  vfile2obj,
  doit,
}
