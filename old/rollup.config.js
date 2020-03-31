import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import { terser } from "rollup-plugin-terser"

export default {
  input: "main.js",
  output: {
    file: "dist/main.min.js",
    plugins: [terser()],
    format: "iife", // esm
    globals: {
      "pell/src/pell": "pell",
      neverland: "neverland",
    },
  },
  plugins: [
    resolve(),
    commonjs({
      namedExports: {
        "js-cookie": ["Cookies"],
      },
    }),
  ],
}
