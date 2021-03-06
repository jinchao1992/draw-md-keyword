const fs = require('fs')
const chalk = require('chalk')
const path = require('path')
const log = console.log
const commonMark = require('commonMark')

const keywordPadding = 10

const happyLog = message => {
  log(chalk.green(message))
}

const errorLog = message => {
  log(chalk.red(message))
}

const formatDate = (date, format) => {
  const map = {
    mm: date.getMonth() + 1,
    dd: date.getDate(),
    yy: date.getFullYear().toString().slice(-2),
    yyyy: date.getFullYear()
  }

  return format.replace(/mm|dd|(yyyy|yy)/gi, matched => {
    return map[matched]
  })
}

const getMarkDownName = (filePath, format) => {
  try {
    const fullPath = path.resolve(process.cwd(), filePath)
    const dirnamePath = path.dirname(fullPath)
    const markDownName = fullPath.replace(`${dirnamePath}/`, '').split('.')[0]
    return `${formatDate(new Date(), format)}-${markDownName}`
  } catch (error) {
    errorLog(error.message)
    return Date.now()
  }
}

const getUserConfig = path => {
  if (!fs.existsSync(path)) {
    return errorLog(`please run 'dmk init' to initialize a config file`)
  }
  return require(path)
}

const parseMarkDownKeyword = (markdown, types = ['code', 'strong']) => {
  let parsed = new commonMark.Parser().parse(markdown)
  let walker = parsed.walker()
  let event
  let codeNodes = []
  let strongNodes = []
  while ((event = walker.next())) {
    let node = event.node
    if (node.type === 'code' && node.literal && types.includes('code')) {
      codeNodes.push(node)
    }
    if (node.type === 'strong' && node.firstChild._literal && types.includes('strong')) {
      strongNodes.push(node)
    }
  }

  const codeKeys = codeNodes.map(node => node.literal.trim())
  const strongKeys = strongNodes.map(node => node.firstChild.literal.trim())
  const allKeywords = [...new Set([...codeKeys, ...strongKeys])]
  return allKeywords
}

const pickKeywords = filePath => {
  if (!fs.existsSync(filePath)) {
    return errorLog(`${filePath} does not exist, please confirm and execute again `)
  }
  const markdown = fs.readFileSync(filePath, { encoding: 'utf8' })
  return parseMarkDownKeyword(markdown)
}

const random = (min, max) => Math.floor(Math.random() * (max - min) + min)

const calculateKeywords = (fontSize, keywords, max, singleKeywordMaxLength, ctx) => {
  const fonts = ['paint', 'hollow', 'cartoon', 'brush']
  // ??????????????????????????????????????????font
  const originKeywords = keywords.length > max ? keywords.splice(0, max) : keywords
  const handledKeywords = originKeywords.map(keyword => {
    return keyword.length > singleKeywordMaxLength ? `${keyword.substr(0, singleKeywordMaxLength)}...` : keyword
  })

  const applyKeywords = handledKeywords.map(keyword => {
    const fontRandomIndex = random(0, 4)
    ctx.font = `${fontSize}px ${fonts[fontRandomIndex]}`
    const width = ctx.measureText(keyword).width + keywordPadding
    return {
      width,
      circleRadius: width / 2,
      keyword,
      font: fonts[fontRandomIndex]
    }
  })
  return applyKeywords
}

const calculateOffsetX = (radius, width) => {
  return radius - width / 2 + keywordPadding / 2
}

exports.getUserConfig = getUserConfig
exports.happyLog = happyLog
exports.errorLog = errorLog
exports.pickKeywords = pickKeywords
exports.random = random
exports.calculateKeywords = calculateKeywords
exports.calculateOffsetX = calculateOffsetX
exports.getMarkDownName = getMarkDownName
