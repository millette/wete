"use strict"

const prefixed = (p, ...rest) =>
  [p, ...rest].filter((x) => x !== undefined).join(":")

module.exports = prefixed
