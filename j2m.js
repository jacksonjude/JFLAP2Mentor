#!/usr/bin/env node

const { ArgumentParser } = require('argparse')
const fs = require('fs')
const path = require('path')

const convertJFLAPToMentor = require('./src/convert')
const Constants = require('./src/constants')

const j2mEnvironmentPath = path.join(__dirname, Constants.j2mEnvironmentFile)
var j2mEnvironment = getJSONFromFile(j2mEnvironmentPath)

var argumentParser = new ArgumentParser()
argumentParser.add_argument('-i', '--input', {type: 'str', help: "Input .jff file / directory containing .jff files"})
argumentParser.add_argument('-o', '--output', {type: 'str', help: "Output file / directory"})
argumentParser.add_argument('-s', '--selector', {type: 'str', help: "Input file selectors in RegEx style (ex. '1.*')"})
argumentParser.add_argument('-f', '--format', {type: 'str', help: "Output file format (ex. 'dfa', 'nfa')"})
argumentParser.add_argument('-a', '--alphabet', {type: 'str', help: "Output comma-separated alphabet (ex. 'a,b')"})
argumentParser.add_argument('-e', '--environment', {action: 'store_true', help: "Set passed in arguments to the environment"})
argumentParser.add_argument('-ep', '--environment-print', {action: 'store_true', help: "Print the current environment arguments"})

var arguments = argumentParser.parse_args()

var environmentPrint = arguments.environment_print
if (environmentPrint)
{
  for (let argumentKey in j2mEnvironment)
  {
    console.log("\'" + argumentKey + "\' = \'" + j2mEnvironment[argumentKey] + "\'")
  }
  return
}

var setEnvironment = arguments.environment

if (setEnvironment)
{
  j2mEnvironment = {}
}

var inputJFLAPPath = arguments.input || j2mEnvironment.input
var outputMentorPath = arguments.output || j2mEnvironment.output
var inputSelector = arguments.selector || j2mEnvironment.selector
var outputFormat = arguments.format || j2mEnvironment.format
var outputAlphabet = (arguments.alphabet || j2mEnvironment.alphabet || "").split(",")

if (setEnvironment)
{
  j2mEnvironment = arguments
  delete j2mEnvironment.environment
  writeJSONToFile(j2mEnvironmentPath, j2mEnvironment)
  return
}

if (inputJFLAPPath == null)
{
  console.log("ERR: No input file provided")
  return
}

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
  jflapHashes = getJSONFromFile(jflapHashPath)

  fs.readdirSync(inputJFLAPPath).filter(file => {
    return path.extname(file).toLowerCase() == Constants.jflapExtension && (selectorTester == null || selectorTester.test(file))
  }).forEach(filePath => {
    convertJFLAPToMentor(path.join(inputJFLAPPath, filePath), path.join(outputMentorPath || inputJFLAPPath, path.basename(filePath, Constants.jflapExtension) + "." + (outputFormat || Constants.defaultMentorExtension)), outputAlphabet, jflapHashes)
  })

  writeJSONToFile(jflapHashPath, jflapHashes)
}
else
{
  var jflapHashPath = path.join(path.dirname(inputJFLAPPath), Constants.jflapHashFile)
  jflapHashes = getJSONFromFile(jflapHashPath)

  convertJFLAPToMentor(inputJFLAPPath, outputMentorPath, outputAlphabet, jflapHashes)

  writeJSONToFile(jflapHashPath, jflapHashes)
}

function getJSONFromFile(jflapHashPath)
{
  if (fs.existsSync(jflapHashPath))
  {
    return JSON.parse(fs.readFileSync(jflapHashPath, {encoding:'utf8'}))
  }
  return {}
}

function writeJSONToFile(jflapHashPath, jflapHashes)
{
  fs.writeFileSync(jflapHashPath, JSON.stringify(jflapHashes))
}
