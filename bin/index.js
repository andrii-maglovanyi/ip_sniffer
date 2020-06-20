#!/usr/bin/env node

try {
  require("../dist/index");
} catch (err) {
  require("@babel/register")({ extensions: [".js", ".ts"] });
  require("../src/index");
}
