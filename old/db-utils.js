"use strict"

// self
const makeProcessor = require("./make-processor")
// const diff = require("./diff")

const type = "put"

const prefixed = (p, ...rest) => [p, ...rest].join(":")

const createPage = async (editor, gcontents, page = "", more = {}) => {
  if (!editor) throw new Error("Editor required.")
  if (!gcontents) throw new Error("Contents required.")

  const pages = more.pages || []
  delete more.pages
  const processor = makeProcessor(pages)

  const date = more.date || Date.now()
  delete more.date
  const key = prefixed("page-version", page, date)
  const { contents, data } = await processor({
    pathname: `/${page}`,
    contents: gcontents,
  })

  return [
    {
      type,
      key,
      value: {
        ...data,
        editor,
        contents,
        ...more,
      },
    },
    {
      type,
      key: prefixed("page", page),
      value: { key },
    },
    {
      type,
      key: prefixed("change", date, page),
      value: editor,
    },
  ]
}

const cnt = `<p>Hi there. <a href="bob">rel</a> and <a href="/#there">abs</a>.
`

const log = (x) => console.log(JSON.stringify(x, null, 2))
createPage("yo", cnt, "", { pages: ["/bob"] }).then(log)
