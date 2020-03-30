"use strict"

// npm
import unified from "unified"
import parse from "rehype-dom-parse"
import rehype2remark from "rehype-remark"
import sanitize from "rehype-sanitize"
import stringify from "remark-stringify"

const processor = unified()
  .use(parse)
  .use(sanitize)
  .use(rehype2remark)
  .use(stringify).process

export default processor
