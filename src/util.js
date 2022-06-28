const fs = require("fs")
const chalk = require("chalk")
const log = console.log
const commonMark = require("commonMark")

const greenLog = (message) => {
  log(chalk.green(message))
}

const redLog = (message) => {
  log(chalk.red(message))
}

const getUserConfig = (path) => {
  if (!fs.existsSync(path)) {
    return redLog(`please run 'dk init' to initialize a config file`)
  }
  return require(path)
}

const parseMarkDownKeyword = (markdown, types = ["code", "strong"]) => {
  let parsed = new commonMark.Parser().parse(markdown)
  let walker = parsed.walker()
  let event
  let codeNodes = []
  let strongNodes = []
  while ((event = walker.next())) {
    let node = event.node
    if (node.type === "code" && node.literal && types.includes("code")) {
      codeNodes.push(node)
    }
    if (node.type === "strong" && node.firstChild._literal && types.includes("strong")) {
      strongNodes.push(node)
    }
  }

  const codeKeys = codeNodes.map((node) => node.literal.trim())
  const strongKeys = strongNodes.map((node) => node.firstChild.literal.trim())
  const allKeywords = [...new Set([...codeKeys, ...strongKeys])]
  return allKeywords
}

const pickKeywords = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return redLog(`${filePath} does not exist, please confirm and execute again `)
  }
  const markdown = fs.readFileSync(filePath, { encoding: "utf8" })
  return parseMarkDownKeyword(markdown)
}

exports.getUserConfig = getUserConfig
exports.greenLog = greenLog
exports.redLog = redLog
exports.pickKeywords = pickKeywords
