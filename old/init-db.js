"use strict"

// core
const {
  constants: { R_OK },
  readFileSync,
  accessSync,
} = require("fs") // promises: fs,

// npm
const level = require("level")
const prompts = require("prompts")

// self
const goodPassword = require("./weak")

const prodMode = true

const createNewDb = () =>
  new Promise((resolve, reject) => {
    const done = (err, db) => (err ? reject(err) : resolve(db))
    level("db", { errorIfExists: true, valueEncoding: "json" }, done)
  })

const type = "put"

const createBacklink = (b, to, from) => {
  b.push({
    type,
    key: ["backlink", to, from].join(":"),
    value: Date.now(),
  })
}

const createPage = (b, editor, contents, page = "", more = {}) => {
  const date = Date.now()
  const key = ["page-version", page, date].join(":")
  b.push(
    {
      type,
      key,
      value: {
        internalLinks: [],
        externalLinks: [],
        editor,
        contents,
        ...more,
      },
    },
    {
      type,
      key: ["page", page].join(":"),
      value: { key },
    },
    {
      type,
      key: ["change", date, page].join(":"),
      value: true,
    }
  )
}

const createSandbox = (b, editor) => {
  const contents =
    "<h2>This is the sandbox</h2><p>Play at will. Here's a link to the <a href='/'>Homepage</a>.</p>"
  createPage(b, editor, contents, "sandbox", {
    internalLinks: [
      {
        href: "/",
        page: "/",
        text: "Homepage",
      },
    ],
  })
}

const createAdmin = (b, username, password) => {
  b.push({
    type,
    key: ["_user", username].join(":"),
    value: {
      date: Date.now(),
      password,
    },
  })
}

const validateHomepage = (str) => {
  if (!str) str = "homepage.html"
  try {
    accessSync(str, R_OK)
    return true
  } catch (e) {
    return e.message
  }
}

const readHomepage = (path) => {
  if (!path) path = "homepage.html"
  // console.log("readHomepage", path)
  try {
    const cnt = readFileSync(path, "utf-8").trim()
    if (cnt) return cnt
    throw new Error("File should not be blank")
  } catch (e) {
    return Object.assign(e, { path })
  }
}

const questions = [
  {
    type: "text",
    name: "admin",
    initial: "admin",
    message: "Admin username?",
  },
  {
    type: "password",
    name: "password",
    message: "Admin password?",
    validate: goodPassword,
  },
  {
    type: "password",
    name: "password2",
    message: "Repeat password:",
  },
  {
    type: "text",
    name: "homepage",
    format: readHomepage,
    validate: validateHomepage,
    message: "Homepage file path? Leave empty for 'homepage.html'",
  },
  {
    type: "confirm",
    name: "sandbox",
    initial: true,
    message: "Create sandbox page?",
  },
]

const initDb = async () => {
  const db = await createNewDb()
  console.log("step 2")
  console.log(Object.keys(db))
  console.log("step 3")

  const { admin, password, password2, homepage, sandbox } = await prompts(
    questions
  )
  if (password !== password2) throw new Error("Passwords don't match.")
  if (homepage instanceof Error) throw homepage

  const batch = []

  createAdmin(batch, admin, password), createPage(batch, admin, homepage)
  if (sandbox) {
    createSandbox(batch, admin)
    createBacklink(batch, "", "sandbox")
  }
  //return [db, batch]
  return Promise.all([db, db.batch(batch)])
}

initDb()
  .then(([db, batch]) => {
    console.log("step 2")
    console.log(Object.keys(db))
    console.log("step 3", batch)
  })
  .catch((eee) => console.error(prodMode ? eee.toString() : eee))
