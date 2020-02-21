// npm
// import { exec, init } from "pell/src/pell"
import { neverland as $, render, html, useState } from "neverland"
// import { html as h2 } from 'lighterhtml'

const $isConnected = document.getElementById("is-connected")
// const orig2 = $isConnected.cloneNode()

/*
// const tada = $($isConnected)
const tada = html`<p>Bobobo</p>`

const x = render($isConnected, tada)

console.log("XXX1")
console.log(x)
console.log("XXX2", typeof x)
console.log("XXX3", Object.keys(x))
*/

todo($isConnected)
// todo(document.body.lastChild)

function todo(node, items = []) {
  render(
    node,
    html`
      <ul>
        ${items.map(
          (what, i) => html`
            <li data-i=${i} onclick=${remove}>${what}</li>
          `
        )}
      </ul>
      <button onclick=${add}>add</button>
    `
  )
  function add() {
    items.push(prompt("do"))
    todo(node, items)
  }
  function remove(e) {
    items.splice(e.currentTarget.dataset.i, 1)
    todo(node, items)
  }
}

const Connected = $(() => {
  const [connected, setConnected] = useState("")
  console.log("PING", connected)
  // console.log("PING", initialState, connected)
  // const orig = html.for(orig2.innerHTML)

  const discon = (ev) => {
    ev.preventDefault()
    console.log("DONG", connected)
    setConnected("")
  }

  // if (!connected) return html`<p>Thing</p>`
  if (!connected)
    return html`
      <div id="is-connected" class="buttons">
        <button class="button is-primary">
          <strong>Sign up</strong>
        </button>
        <button class="button is-light" onclick=${() => setConnected("robin")}>
          Log in
        </button>
      </div>
    `

  return html`
    <button onclick=${discon} class="button is-warning">
      Logout (${connected})
    </button>
  `
})

// const zaza = html`<div>There ${Connected("robin")}</div>`
// render($isConnected, zaza) // "robin"

// const tada = h2.node($isConnected.innerHTML)

/*
const tada = $isConnected.innerHTML
console.log("TADA", tada)
render($isConnected, tada)
*/

/*
const Counter = $((initialState) => {
  const [count, setCount] = useState(initialState)
  return html`
  <button onclick=${() => setCount(count + 1)}>
    Count: ${count}
  </button>`
})

const heha = document.getElementById("heha")

const theThing = () => html`
  <div>
    A bounce of counters.<hr>
    ${Counter(0)} ${Counter(1)}
  </div>
`

render(heha, theThing())
*/

// basic example, show two independent counters

/*
render(heha, html`
  <div>
    A bounce of counters.<hr>
    ${Counter(0)} ${Counter(1)}
  </div>
`)
*/

// self
// import h2m from "./h2m"
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

/*
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
*/
