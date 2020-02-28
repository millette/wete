// core
const fs = require("fs").promises

// npm
const level = require("level")
const unified = require("unified")
const parse = require("rehype-parse")
const sanitize = require("rehype-sanitize")
const stringify = require("rehype-stringify")
const { selectAll } = require("hast-util-select")

const baseUrl = new URL("http://localhost/")

const db = level("db", {
  valueEncoding: "json",
})

const yaya = () => (tree, file) => {
  console.log(Object.keys(file))
  const x = selectAll("a", tree).map(
    ({ properties, children: [{ value }] }) => ({
      properties: {
        ...properties,
        href: new URL(properties.href, baseUrl),
      },

      value,
    })
  )
  console.log(JSON.stringify(x, null, 2))
}

const process2 = unified()
  .use(parse)
  .use(sanitize)
  .use(yaya)
  .use(stringify).process

const run = async () => {
  // const cnt = await fs.readFile("written/wiki.html", "utf-8")
  const cnt = await fs.readFile("written/ikiw.html", "utf-8")
  console.log(cnt.length)

  // const oy = await db.get(["page", "ikiw"].join(":"))
  // console.log(Object.keys(oy))

  const p2 = await process2(cnt)
  // console.log(p2)
}

run().catch(console.error)
