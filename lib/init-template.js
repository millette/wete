"use strict"

// core
const fs = require("fs").promises

// self
const { mtime } = require("./init-utils")

// npm
const unified = require("unified")
const parse = require("rehype-parse")
const stringify = require("rehype-stringify")
// const { select, selectAll } = require("hast-util-select")
const { select } = require("hast-util-select")

const heha = () => (tree) => {
  select("link[rel=stylesheet]", tree).properties.href = "/static/style.min.css"
  select("script", tree).properties.src = "/static/main.min.js"
  select("title", tree).children[0].value = "${htmlTitle}"
  select("h2.subtitle", tree).children[0].value = "${pageTitle}"
  select("#cnt", tree).children = [
    {
      type: "text",
      value: "${content}",
    },
  ]

  // const gagaga = selectAll("aside.menu > ul > li", tree)
  // console.log("GAGAGA", gagaga)
  // console.log("GAGAGA-J", JSON.stringify(gagaga, null, 2))

  /*
  const rara = select("aside.menu > ul", tree)

  const fofo = "${page ? 'AAA' : 'BBB'}"
  rara.children = [{
    type: "text",
    value: fofo
  }]
  */

  /*
  selectAll("aside.menu > ul > li", tree)
    // .forEach(({children: [{properties: { href }}]}) => {
    .forEach(({children}) => {
      children[0].properties.href = "/yoyo"
    })
  */

  /*
  <ul class="menu-list">
    <li><a class="is-active" href="/bibi2">View</a></li>
    <li><a href="/_backlinks/bibi2">Backlinks</a></li>
    <li><a href="/_versions/bibi2">History</a></li>
  </ul>
  */
}

const processor = unified()
  .use(parse, { emitParseErrors: true })
  .use(heha)
  .use(stringify).process

const elOutput = (vf) =>
  "module.exports = (page, htmlTitle, pageTitle, content) => `" +
  vf.toString().replace(/`/g, "`") +
  "`"

const write = (ret2) => fs.writeFile("tadam.js", ret2)

const tmpl = () =>
  fs.readFile("index.html", "utf-8").then(processor).then(elOutput).then(write)

/*
const mtime = async (fn) =>
  fs
    .stat(fn)
    .then(({ mtimeMs }) => mtimeMs)
    .catch(() => 0)
*/

const freshTemplate = async () => {
  const fn1 = "tadam.js"
  const fn2 = "index.html"
  const zaza1 = await mtime(fn1)
  const zaza2 = await mtime(fn2)
  if (zaza2 >= zaza1) return tmpl()
}

module.exports = freshTemplate
