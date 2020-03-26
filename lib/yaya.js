"use strict"

// npm
const { selectAll } = require("hast-util-select")

const baseUrl = new URL("file:")

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
            `Skipped link ${
              properties.href ? properties.href.pathname : "(n/a)"
            }, only text children are supported.`
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

module.exports = yaya
