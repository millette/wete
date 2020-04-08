// npm
import { exec, init } from "pell/src/pell"
import { neverland as $, render, html, useState, useEffect } from "neverland"
import Cookies from "js-cookie"

// let elEditor

const nm1 = document.querySelector(".navbar-burger")
const nm2 = document.querySelector(".navbar-menu")

nm1.addEventListener("click", (ev) => {
  ev.preventDefault()
  nm1.classList.toggle("is-active")
  nm2.classList.toggle("is-active")
})

const refele = $((initialState) => {
  const [np, setNp] = useState(initialState.selObj.toLowerCase())
  const [active, setActive] = useState(initialState.active)
  const [data, setData] = useState([])

  console.log("REFELE", active, initialState, new Date())

  const change = (ev) => {
    console.log("CHANGE", np, ev.target.value)
    setNp(ev.target.value)
  }

  const cancel = () => {
    console.log("CANCEL")
    setActive(false)
  }

  const close = (url) => {
    console.log("CLOSE", url)
    if (url) initialState.zap(url)
    cancel()
  }

  const save = (ev) => {
    ev.preventDefault()
    console.log("SAVE", np)
    close(np)
  }

  useEffect(() => {
    console.log("NOW ACTIVE?", active, initialState)
    if (active) {
      ;(async () => {
        console.log("FETCHING...")
        const resp = await fetch("/", {
          headers: { accept: "application/json" },
        })
        console.log("FETCHING-got-Resp...")
        const json = await resp.json()
        console.log("EL-JSON", json)
        setData(json)
      })()
    }
  }, [active])

  const elModal = html`
    <div class="modal${active ? " is-active" : ""}">
    <form onsubmit=${save}>
      <div class="modal-background" onclick=${cancel}></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Linking <b>"${
            initialState.selObj
          }"</b> to local page:</p>
        </header>
        <section class="modal-card-body">

            <div class="field is-horizontal">
              <div class="field-label is-normal">
                <label class="label">New</label>
              </div>

              <div class="field-body">
                <div class="field">
                  <p class="control is-expanded">
                    <input autofocus class="input" type="text" value="${np}" onchange=${change}>
                  </p>
                </div>
              </div>
            </div>

            <div class="field is-horizontal">
              <div class="field-label is-normal">
                <label class="label">Existing</label>
              </div>

              <div class="field-body">
                <div class="field">
                  <p class="control is-expanded">
                    <ul>
                      ${data.map(
                        (m) => html`<li>
                          <button
                            onclick=${() => close(m)}
                            type="button"
                            class="button is-text"
                          >
                            ${m}
                          </button>
                        </li>`
                      )}
                    </ul>
                  </p>
                </div>
              </div>
            </div>


        </section>
        <footer class="modal-card-foot">
          <input type="submit" class="button is-success" value="Save changes" />
          <button onclick=${cancel} class="button">Cancel</button>
        </footer>

      </div>
      <button onclick=${cancel} class="modal-close is-large" aria-label="close"></button>
      </form>
    </div>
  `

  // if (!active) setTimeout(() => setActive(true), 1000)
  // setTimeout(() => setActive(false), 3000)
  console.log("REFELE-return", new Date()) // , active
  return elModal
})

/*
const makeModal = () => {
  const elModal = html`
    <div class="modal-background"></div>
    <div class="modal-card">
      <div class="modal-card-head">
        <p class="modal-card-title">Fee Fii Foo</p>
      </div>
    </div>
    <button class="modal-close is-large" aria-label="close"></button>
  `

  const elbod = document.querySelector("body")
  const ccc = document.createElement("div")
  ccc.className = "modal"
  elbod.append(ccc)
  render(ccc, elModal)
  return ccc
}

const elModal = makeModal()
*/

/*
setTimeout(() => {
  elModal.classList.add("is-active")
  setTimeout(() => {
    elModal.classList.remove("is-active")
  }, 2000)
}, 2000)
*/

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
        "heading1",
        "heading2",
        "quote",
        "code",
        "ulist",
        "olist",
        "bold",
        "italic",
        /*
        {
          name: "image",
          result: () => {
            const url = window.prompt("Enter the image URL")
            if (url) exec("insertImage", url)
          },
        },
        */
        {
          name: "link",
          result: () => {
            const sel = window.getSelection()
            console.log("SEL", sel)
            const r0 = sel.getRangeAt(0)
            console.log("SEL-R0", r0)

            const selObj = sel.toString().trim()
            if (!selObj) return
            console.log("LINKING!!!", selObj)

            let mod = document.getElementById("rym-link-mod")

            if (!mod) {
              const elbod = document.querySelector("body")
              mod = document.createElement("div")
              mod.id = "rym-link-mod"
              elbod.append(mod)
            }

            const zap = (url) => {
              if (!url) return
              // only tested on firefox
              // FIXME: doesn't work on chrome
              // this is crazy shit anyway
              const sel2 = window.getSelection()
              console.log(sel2.anchorNode, sel2)
              if (sel2.anchorNode) sel.addRange(r0)
              exec("createLink", url)
            }

            render(mod, refele({ zap, selObj, active: true }))

            /*




const elModal = html`
  <div class="modal-background"></div>
  <div class="modal-card">
    <div class="modal-card-head">
      <p class="modal-card-title">Fee Fii Foo</p>
    </div>
  </div>
  <button class="modal-close is-large" aria-label="close"></button>
`

const elbod = document.querySelector("body")
const ccc = document.createElement("div")
ccc.className = "modal is-active"
elbod.append(ccc)
render(ccc, elModal)

setTimeout(() => {
  ccc.classList.remove("is-active")
}, 2000)




*/

            /*
            if (selObj) {
              const str = `<div class="modal-background"></div>
    <div class="modal-content"> Fee Fii Foo
    </div>
    <button class="modal-close is-large" aria-label="close"></button>

  `
              const ddd = document.createElement("div")
              ddd.classList.add("modal")
              ddd.classList.add("is-active")
              ddd.innerHTML = str
              $par.appendChild(ddd)
              setTimeout(() => ddd.classList.remove("is-active"), 1000)

              // render(ddd, str)
            }
            */
          },
        },

        {
          name: "elink",
          icon: "&#x1F5D7;",
          title: "External link",
          result: () => {
            const url = window.prompt("Enter the external link URL")
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
