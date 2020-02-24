"use strict"

// core
const fs = require("fs")
const cnt = fs.readFileSync("index.html")
// console.log(cnt.length)

var vfile = require("to-vfile")
var report = require("vfile-reporter")
var unified = require("unified")
var parse = require("rehype-parse")
// var rehype2remark = require('rehype-remark')
// var sanitize = require('rehype-sanitize')
var stringify = require("rehype-stringify")
// const visit = require('unist-util-visit')
// const sel = require('unist-util-select')
const sel2 = require("hast-util-select")

const heha = () => {
  return transformer
  function transformer(tree, file) {
    const t1 = sel2.select("title", tree)
    // console.log("t1", t1)
    t1.children[0].value = "${htmlTitle}"
    const t2 = sel2.select("h2.subtitle", tree)
    t2.children[0].value = "${pageTitle}"
    const t3 = sel2.select("#cnt", tree)
    // console.log("cnt-a", t3.type)
    // console.log("cnt-b", t3.tagName)
    // console.log("cnt-c", t3.properties)
    // t3
    t3.children = [
      {
        type: "text",
        value: "${content}",
      },
    ]
  }
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

// console.log('tree', tree.children[1].children[2])

// const ggg1 = sel2.select('[id=cnt]', tree)
// const ggg1 = sel2.select('title', tree)
// const ggg1 = sel2.select('#cnt', tree)
// console.log('ggg1', ggg1)

/*
const heha = () => {
  return (tree, file) => {

  }
}

// {emitParseErrors: true, duplicateAttribute: false}

unified()
  .use(parse, { emitParseErrors: true })
  //.use(sanitize)
  // .use(rehype2remark)
  .use(stringify)
  .process(vfile.readSync('index.html'), function(err, file) {
    console.error(report(err || file))
    console.log(String(file))
  })
*/
