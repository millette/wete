// npm
import { exec, init } from "pell/src/pell"

// self
import h2m from "./h2m"
/*
import cry from "./crypto"

console.log("hi")

const enc = new TextEncoder()

cry()
.then(({ publicKey, privateKey }) => {
  const a = JSON.stringify(publicKey).length
  const b = JSON.stringify(privateKey).length

  window.crypto.subtle.sign(
    {name:"ECDSA", hash: "SHA-256"},
    privateKey,
    enc.encode("it went very well")
  )
  .then((g) => {
    console.log("GGG-t", typeof g)
    console.log("GGG", g)
  })
  return [a, b]
})
.then(console.log)
.catch(console.error)
*/

const element = document.getElementById("editor")
const cntEl = document.getElementById("cnt")
const cnt = cntEl.innerHTML
// element.innerHTML = ""

const editor = init({
  element,
  onChange: (html) => {
    // textContent = html
    h2m(html)
      .then((x) => {
        document.getElementById("html-output").textContent = x.contents
      })
      .catch(console.error)
  },
  defaultParagraphSeparator: "p",
  actions: [
    "ulist",
    "bold",
    "italic",
    {
      name: "image",
      result: () => {
        const url = window.prompt("Enter the image URL")
        if (url) exec("insertImage", url)
      },
    },
    {
      name: "link",
      result: () => {
        const url = window.prompt("Enter the link URL")
        if (url) exec("createLink", url)
      },
    },
  ],
  classes: {
    // actionbar: 'pell-actionbar-custom-name',
    // button: 'pell-button-custom-name',
    content: "pell-content content",
    // selected: 'pell-button-selected-custom-name'
  },
})

// editor.content<HTMLElement>
// To change the editor's content:
// editor.content.innerHTML = '<b><u><i><a href="/yo" data-embed>Initial</a> content!</i></u></b>'

editor.content.innerHTML = cnt
