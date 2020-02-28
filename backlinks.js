// core
const fs = require("fs").promises

// npm
const level = require("level")
const unified = require("unified")
const vfile = require("vfile")
const reporter = require("vfile-reporter")
const parse = require("rehype-parse")
const sanitize = require("rehype-sanitize")
const stringify = require("rehype-stringify")
const { selectAll } = require("hast-util-select")

/*
console.log(vfile({stem:"wiki"}))
{
  data: {},
  messages: [],
  history: [ 'wiki' ],
  cwd: '/home/millette/wete'
}
process.exit(1)
*/

// const baseUrl = new URL("http://localhost/")
const baseUrl = new URL("file:")

const db = level("db", {
  valueEncoding: "json",
})

const yaya = () => (tree, file) => {
  currentPage = file.pathname
  file.data.yaya = {
    internalLinks: [],
    externalLinks: [],
  }

  selectAll("a", tree).forEach(({ properties, children: [{ value }] }) => {
    if (!value)
      return file.message(
        `Skipped link ${properties.href.pathname}, only text children are supported.`
      )

    const href = new URL(properties.href, baseUrl)
    switch (href.protocol) {
      case "http:":
      case "https:":
        // enhance external links
        properties.target = "_blank"
        if (!properties.rel) properties.rel = []
        properties.rel.push("noopener", "noreferrer")
        file.data.yaya.externalLinks.push({
          properties: {
            ...properties,
            href,
          },
          value,
        })
        break

      case "file:":
        // fix local links to start with /
        // TODO: optional base path
        if (properties.href[0] !== "/") properties.href = `/${properties.href}`
        if (currentPage === href.pathname)
          return file.info(`Skip link to self.`)
        file.data.yaya.internalLinks.push({
          properties: {
            ...properties,
            href,
          },
          value,
        })

        break

      default:
        file.message(`Link protocol not supported: ${href.protocol}`)
        return
    }
  })
  if (file.data.yaya.internalLinks.length)
    file.info(`Found ${file.data.yaya.internalLinks.length} local links.`)
  if (file.data.yaya.externalLinks.length)
    file.info(`Found ${file.data.yaya.externalLinks.length} external links.`)
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

  const vf = vfile({ pathname: "/ikiw", contents: cnt })
  const vfout = await process2(vf)
  // const vfout = await process2(cnt)
  console.log(reporter(vfout))
  console.log(vfout)
  console.log(JSON.stringify(vfout.data, null, 2))
  console.log(vfout.data.yaya.externalLinks[0].properties.href)
}

run().catch(console.error)
