"use strict"

const { selectAll } = require("hast-util-select")

const baseUrl = new URL("file:")

// npm
const yaya = ({ allPages }) => (tree, file) => {
  const currentPage = file.pathname
  file.data.yaya = {
    internalLinks: [],
    externalLinks: [],
  }

  console.log("knowns", currentPage, allPages)

  selectAll("a", tree).forEach(
    ({ properties, children: [{ value: text }] }) => {
      if (!text)
        return file.message(
          `Skipped link ${properties.href.pathname}, only text children are supported.`
        )

      const href = new URL(properties.href, baseUrl)
      switch (href.protocol) {
        case "file:":
          // fix local links to start with /
          // TODO: optional base path
          if (properties.href[0] !== "/")
            properties.href = `/${properties.href}`
          if (currentPage === href.pathname)
            return file.info(`Skip link to self.`)

          const missing = allPages.indexOf(href.pathname) === -1
          if (missing) {
            if (!properties.class) properties.class = []
            properties.class.push("wiki-is-missing")
          }

          file.data.yaya.internalLinks.push({
            missing,
            href: properties.href,
            page: href.pathname,
            text,
          })
          break

        case "http:":
        case "https:":
          // enhance external links
          properties.target = "_blank"
          if (!properties.rel) properties.rel = []
          properties.rel.push("noopener", "noreferrer")
          file.data.yaya.externalLinks.push({
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
  if (file.data.yaya.internalLinks.length)
    file.info(`Found ${file.data.yaya.internalLinks.length} local links.`)
  if (file.data.yaya.externalLinks.length)
    file.info(`Found ${file.data.yaya.externalLinks.length} external links.`)
}

module.exports = yaya
