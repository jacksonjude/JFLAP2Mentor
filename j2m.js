#!/usr/bin/env node

const { ArgumentParser } = require('argparse')
const fs = require('fs')
const path = require('path')

const convertJFLAPToMentor = require('./src/convert')
const Constants = require('./src/constants')

var argumentParser = new ArgumentParser()
argumentParser.add_argument('-i', '--input', {type: 'str', help: "Input .jff file / directory containing .jff files"})
argumentParser.add_argument('-o', '--output', {type: 'str', help: "Output file / directory"})
argumentParser.add_argument('-s', '--selector', {type: 'str', help: "Input file selectors in RegEx style (ex. '1.*')"})
argumentParser.add_argument('-f', '--format', {type: 'str', help: "Output file format (ex. 'dfa', 'nfa')"})
argumentParser.add_argument('-a', '--alphabet', {type: 'str', help: "Output comma-separated alphabet (ex. 'a,b')"})

var arguments = argumentParser.parse_args()

if (arguments.input === undefined || arguments.input === null)
{
  console.log("ERR: No input file provided")
  return
}

var inputJFLAPPath = arguments.input
var outputMentorPath = arguments.output
var inputSelector = arguments.selector
var outputFormat = arguments.format
var outputAlphabet = (arguments.alphabet || "").split(",")

if (!fs.existsSync(inputJFLAPPath))
{
  console.log("ERR: Input file \'" + inputJFLAPPath + "\' does not exist")
  return
}

var selectorTester
if (inputSelector !== undefined)
{
  selectorTester = new RegExp(inputSelector)
}

var jflapHashes = {}

if (fs.lstatSync(inputJFLAPPath).isDirectory())
{
  var jflapHashPath = path.join(inputJFLAPPath, Constants.jflapHashFile)
  jflapHashes = getJFLAPHashes(jflapHashPath)

  fs.readdirSync(inputJFLAPPath).filter(file => {
    return path.extname(file).toLowerCase() == Constants.jflapExtension && (selectorTester === null || selectorTester.test(file))
  }).forEach(filePath => {
    convertJFLAPToMentor(path.join(inputJFLAPPath, filePath), path.join(outputMentorPath || inputJFLAPPath, path.basename(filePath, Constants.jflapExtension) + "." + (outputFormat || defaultMentorExtension)), outputAlphabet, jflapHashes)
  })

  setJFLAPHashes(jflapHashPath, jflapHashes)
}
else
{
  var jflapHashPath = path.join(path.dirname(inputJFLAPPath), Constants.jflapHashFile)
  jflapHashes = getJFLAPHashes(jflapHashPath)

  convertJFLAPToMentor(inputJFLAPPath, outputMentorPath, outputAlphabet, jflapHashes)

  setJFLAPHashes(jflapHashPath, jflapHashes)
}

function getJFLAPHashes(jflapHashPath)
{
  if (fs.existsSync(jflapHashPath))
  {
    return JSON.parse(fs.readFileSync(jflapHashPath, {encoding:'utf8'}))
  }
  return {}
}

function setJFLAPHashes(jflapHashPath, jflapHashes)
{
  fs.writeFileSync(jflapHashPath, JSON.stringify(jflapHashes))
}
