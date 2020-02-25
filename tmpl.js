"use strict"

// core
const fs = require("fs")

const cnt = fs.readFileSync("index.html")

const unified = require("unified")
const parse = require("rehype-parse")
const stringify = require("rehype-stringify")
const { select } = require("hast-util-select")

const heha = () => (tree, file) => {
  select("link[rel=stylesheet]", tree).properties.href = "/static/style.css"
  select("script", tree).properties.src = "/static/main.js"
  select("title", tree).children[0].value = "${htmlTitle}"
  select("h2.subtitle", tree).children[0].value = "${pageTitle}"
  select("#cnt", tree).children = [
    {
      type: "text",
      value: "${content}",
    },
  ]
}

const processor = unified()
  .use(parse, { emitParseErrors: true })
  .use(heha)
  .use(stringify).process

const elOutput = ({ contents }) => {
  console.log("module.exports = (htmlTitle, pageTitle, content) =>")
  console.log("`" + contents.replace(/`/g, "`") + "`")
}

processor(cnt)
  .then(elOutput)
  .catch(console.error)
