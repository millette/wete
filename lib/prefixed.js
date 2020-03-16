"use strict"

const prefixed = (p, ...rest) => [p, ...rest].join(":")

module.exports = prefixed
