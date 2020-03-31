"use strict"

// core
const fs = require("fs").promises

const mtime = async (fn) =>
  fs
    .stat(fn)
    .then(({ mtimeMs }) => mtimeMs)
    .catch(() => 0)

module.exports = { mtime }
