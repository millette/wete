// npm
import { exec, init } from "pell/src/pell"
import { neverland as $, render, html, useState, useEffect } from "neverland"
import Cookies from "js-cookie"

let elEditor

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

const Actions = $((un) => {
  const [aa, bb] = useState()
  console.log("PING-Actions", aa)

  useEffect(() => {
    console.log("EFFECT", aa)
    document.getElementById("cnt").style = aa
      ? "display: none"
      : "display: block"

    if (!aa) {
      const $pel = document.querySelector(".pell")
      if ($pel) {
        $pel.parentNode.removeChild($pel)
      }
      return
    }

    const $par = document.getElementById("cnt").parentNode
    if ($par.querySelector(".pell")) return

    const element = document.createElement("div")
    element.className = "pell"
    $par.appendChild(element)

    elEditor = init({
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
    elEditor.content.innerHTML = document.getElementById("cnt").innerHTML
  }, [aa])

  const clickEdit = (ev) => {
    ev.preventDefault()
    if (aa) {
      console.log("MUST SAVE")
      console.log(elEditor)
      console.log(elEditor.content.innerHTML)
      console.log(Object.keys(elEditor))
      bb(false)
      document.getElementById("cnt").innerHTML = elEditor.content.innerHTML
      return
    }
    console.log("clickEdit")
    bb(true)
  }

  const clickView = (ev) => {
    ev.preventDefault()
    if (!aa) return
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
        <li><a href="#">Export</a></li>
        <li class=${aa ? "is-active" : ""}>
          <a href="#" onclick=${clickEdit}
            >${aa ? "Save" : "Edit"}&nbsp;<small class="rym-bg"
              >as 👤 ${un}</small
            ></a
          >
        </li>
      </ul>
    </div>
  `

  return c
})

const showActions = (un) => {
  const c = Actions(un)
  const $cnt = document.getElementById("cnt")
  const $x = $cnt.parentNode.insertBefore(document.createElement("div"), $cnt)
  render($x, c)
}

const hideActions = () => {
  const $p = document.getElementById("app-actions")
  if ($p) $p.parentNode.removeChild($p)
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
    <div id="is-connected" class="buttons">
      <div class="button is-static">👤 ${username}</div>
      <button onclick=${discon} class="button is-warning">
        Logout
      </button>
    </div>
  `

  const nope = html`
    <div id="is-connected" class="buttons">
      <button class="button is-info">
        Sign up
      </button>
      <button class="button is-success" onclick=${con}>
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

Connected()
