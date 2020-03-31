// npm
import { exec, init } from "pell/src/pell"
import { neverland as $, render, html, useState, useEffect } from "neverland"
import Cookies from "js-cookie"

// let elEditor

const Actions = $((un) => {
  let elEditor
  const [editing, setEditing] = useState()

  useEffect(() => {
    document.getElementById("cnt").style = editing
      ? "display: none"
      : "display: block"

    if (!editing) {
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
      onChange: () => false,
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
  }, [editing])

  const clickEdit = (ev) => {
    ev.preventDefault()
    if (!editing) return setEditing(true)
    const page = window.location.pathname
    const cnt = elEditor.content.innerHTML
    document.getElementById("cnt").innerHTML = cnt

    fetch(page, {
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
      method: "post",
      body: JSON.stringify({ cnt }),
    })
      .then((res) => Promise.all([res.json(), res.ok]))
      .then(([json, ok]) => {
        console.log("JSON-SAVE-RESPONSE", ok, json)
        setEditing(!ok)
      })
      .catch(console.error)
  }

  const clickView = (ev) => {
    ev.preventDefault()
    if (!editing) return
    setEditing(false)
  }

  const c = html`
    <div
      id="app-actions"
      class="tabs is-toggle is-toggle-rounded is-right is-large"
    >
      <ul>
        <li class=${editing ? "" : "is-active"}>
          <a onclick=${clickView} href="#">${editing ? "Cancel" : "View"}</a>
        </li>
        <li><a href="#">Export</a></li>
        <li class=${editing ? "is-active" : ""}>
          <a href="#" onclick=${clickEdit}
            >${editing ? "Save" : "Edit"}&nbsp;<small class="rym-bg"
              >as 👤 ${un}</small
            ></a
          >
        </li>
      </ul>
    </div>
  `

  return c
})

const pageRe = /^\/(_[a-zA-Z0-9]+\/)?[a-zA-Z0-9]+$/

const showActions = (un) => {
  const page = window.location.pathname // .slice(1)
  if (!pageRe.test(page)) {
    const $menu = document.querySelector("aside.menu > ul")
    $menu.innerHTML =
      page === "/"
        ? "<li><a class='is-active' href='/'>Home</a></li><li><a href='/_recent'>Recent changes</a></li>"
        : "<li><a href='/'>Home</a></li><li><a class='is-active' href='/_recent'>Recent changes</a></li>"
    return
  }

  if (page.split("/").length === 3) {
    document
      .querySelectorAll("aside.menu a.is-active")
      .forEach((el) => el.classList.remove("is-active"))
    document
      .querySelector(`aside.menu a[href="${page}"]`)
      .classList.add("is-active")
    return
  }
  const c = Actions(un)
  const $cnt = document.getElementById("cnt")
  const $x = $cnt.parentNode.insertBefore(document.createElement("div"), $cnt)
  render($x, c)
}

const hideActions = () => {
  const $p = document.getElementById("app-actions")
  if ($p) $p.parentNode.removeChild($p)
}

const getUsername = () => {
  const n = Cookies.get("connected")
  if (!n) return
  const [username] = n.split(".")
  return username
}

const Connected = () => {
  const username = getUsername()

  const con = () => {
    const name = window.prompt("Username")
    const password = window.prompt("Password")
    if (!name || !password) return

    fetch("/api/login", {
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
      method: "post",
      body: JSON.stringify({
        name,
        password,
      }),
    })
      .then((res) => Promise.all([res.json(), res.ok]))
      .then(([json, ok]) => {
        if (ok) Connected()
      })
      .catch(console.error)
  }

  const discon = () => {
    Cookies.remove("connected")
    Connected()
  }

  const yup = html`
    <div class="button is-static">👤 ${username}</div>
    <button onclick=${discon} class="button is-warning">
      Logout
    </button>
  `

  const nope = html`
    <button class="button is-info">
      Sign up
    </button>
    <button class="button is-success" onclick=${con}>
      Log in
    </button>
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
