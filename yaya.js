"use strict"

const { selectAll } = require("hast-util-select")

const baseUrl = new URL("file:")

// npm
// const yaya = ({ allPages = [] }) => (tree, file) => {
const yaya = (opts = {}) => (tree, file) => {
  // const { allPages } = opts
  const allPages = opts.allPages
    ? Array.isArray(opts.allPages)
      ? new Set(opts.allPages)
      : opts.allPages
    : new Set()

  const currentPage = file.pathname
  // allPages.push(currentPage)
  allPages.add(currentPage)
  file.data = {
    internalLinks: [],
    externalLinks: [],
    ...file.data,
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
          // TODO: optional base path
          // fix local links to start with /
          if (properties.href === ".") properties.href = "/"
          else if (properties.href[0] !== "/")
            properties.href = `/${properties.href}`

          const selfLink = currentPage === href.pathname || undefined
          // const missing = (allPages.indexOf(href.pathname) === -1) || undefined
          const missing = !allPages.has(href.pathname) || undefined
          if (missing) {
            if (!properties.class) properties.class = []
            properties.class.push("wiki-is-missing")
          }

          if (selfLink) {
            if (!properties.class) properties.class = []
            properties.class.push("wiki-is-selflink")
          }

          file.data.internalLinks.push({
            missing,
            selfLink,
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
  if (file.data.internalLinks.length)
    file.info(`Found ${file.data.internalLinks.length} local links.`)
  if (file.data.externalLinks.length)
    file.info(`Found ${file.data.externalLinks.length} external links.`)
}

module.exports = yaya
