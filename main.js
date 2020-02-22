// npm
// import { exec, init } from "pell/src/pell"
import { neverland as $, render, html, useState, useEffect } from "neverland"
// import { html as h2 } from 'lighterhtml'
// import { render, html } from "lighterhtml"
import Cookies from "js-cookie"

// getCookie
// const verifyCookie = (name) => {
const getCookie = (name) => {
  // Cookies.get(`${name}-signed`)
  // check signature using public key
  // if bad, remove it
  // Cookies.remove(name)
  // Cookies.remove(`${name}-signed`)
  return Cookies.get(name)
}

/*
const showActions = () => {
  const c = html`
    <div class="tabs is-boxed is-right is-large">
      <ul>
        <li class="is-active"><a>View</a></li>
        <li><a>Edit</a></li>
      </ul>
    </div>`

  const $cnt = document.getElementById("cnt")
  const $it = $cnt.parentNode.insertBefore(document.createElement("div"), $cnt)

  render($it, c)
}
*/

const Actions = $((un) => {
  const [aa, bb] = useState()
  console.log("PING-Actions", aa)

  useEffect(() => {
    console.log("EFFECT", aa)
    document.getElementById("cnt").style = aa
      ? "display: none"
      : "display: block"
  }, [aa])

  const clickEdit = (ev) => {
    if (aa) return
    ev.preventDefault()
    console.log("clickEdit")
    bb(true)
  }

  const clickView = (ev) => {
    if (!aa) return
    ev.preventDefault()
    console.log("clickView")
    bb(false)
  }

  const c = html`
    <div
      id="app-actions"
      class="tabs is-toggle is-toggle-rounded is-right is-large"
    >
      <ul>
        <li class=${aa ? "" : "is-active"}>
          <a onclick=${clickView} href="#">${aa ? "Cancel" : "View"}</a>
        </li>
        <li class=${aa ? "is-active" : ""}>
          <a href="#" onclick=${clickEdit}
            >Edit&nbsp;<small>(as ${un})</small></a
          >
        </li>
      </ul>
    </div>
  `

  return c
})

const showActions = (un) => {
  // const $p = document.getElementById("cnt").parentNode
  // const $fc = $p.firstChild

  /*
  let editMode = false

  const clickEdit = (ev) => {
    ev.preventDefault()
    console.log("clickEdit")
    editMode = true
  }

  const clickView = (ev) => {
    ev.preventDefault()
    console.log("clickView")
    editMode = false
  }

  const c = html`
    <div id="app-actions" class="tabs is-boxed is-right is-large">
      <ul>
        <li class=${editMode ? "" : "is-active"}><a onclick=${clickView} href="#">View</a></li>
        <li class=${editMode ? "is-active" : ""}><a href="#" onclick=${clickEdit}>Edit</a></li>
      </ul>
    </div>`
  */

  const c = Actions(un)

  const $cnt = document.getElementById("cnt")
  const $x = $cnt.parentNode.insertBefore(document.createElement("div"), $cnt)

  render($x, c)
}

const hideActions = () => {
  const $p = document.getElementById("app-actions")
  // console.log("P", $p)
  // console.log("PP", $p && $p.parentNode)
  if ($p) $p.parentNode.removeChild($p)

  /*
  const $p = document.getElementById("cnt").parentNode
  const $fc = $p.firstChild
  console.log("P", $p)
  console.log("FC", $fc, $fc.tagName)
  if ($fc.tagName === "DIV") $p.removeChild($p.firstChild)
  */
}

const Connected = () => {
  const username = getCookie("connected")

  const con = () => {
    Cookies.set("connected", "bob")
    Connected()
  }

  const discon = () => {
    Cookies.remove("connected")
    Connected()
  }

  const yup = html`
    <button onclick=${discon} class="button is-warning">
      Logout (${username})
    </button>
  `

  const nope = html`
    <div id="is-connected" class="buttons">
      <button class="button is-primary">
        <strong>Sign up</strong>
      </button>
      <button class="button is-light" onclick=${con}>
        Log in
      </button>
    </div>
  `

  if (username) {
    render(document.getElementById("is-connected"), yup)
    showActions(username)
  } else {
    render(document.getElementById("is-connected"), nope)
    hideActions()
  }
}

// Connected($isConnected, Cookies.get("connected"))
Connected()

/*
const Connected = $((connected) => {
  // const connected = Cookies.get('connected')
  const [connected666, setConnected666] = useState()
  console.log("PING", connected)
  // console.log("PING", initialState, connected)
  // const orig = html.for(orig2.innerHTML)

  const discon = (ev) => {
    ev.preventDefault()
    console.log("discon", connected, connected666)
    // setConnected("")
    Cookies.remove("connected")
    setConnected666()
    setTimeout(() => console.log("discon2", connected, connected666), 500)
  }



  const con = (ev) => {
    ev.preventDefault()
    console.log("con", connected, connected666)
    Cookies.set("connected", "bob")
    setConnected666("bob")
    setTimeout(() => console.log("con2", connected, connected666), 500)
    // setConnected("")
  }


  // if (!connected) return html`<p>Thing</p>`
  if (!connected666)
    return html`
      <div id="is-connected" class="buttons">
        <button class="button is-primary">
          <strong>Sign up</strong>
        </button>
        <button class="button is-light" onclick=${con}>
          Log in
        </button>
      </div>
    `

  return html`
    <button onclick=${discon} class="button is-warning">
      Logout (${connected} --- ${connected666})
    </button>
  `
})

const x = render($isConnected, Connected(Cookies.get('connected')))

console.log("XXX1")
console.log(x)
console.log("XXX2", typeof x)
console.log("XXX3", Object.keys(x))
*/

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

// todo($isConnected)
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

/*
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
*/

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
