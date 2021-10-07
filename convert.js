#!/usr/bin/env node

const xmlParser = require('fast-xml-parser')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { ArgumentParser } = require('argparse')
// const gitignoreParser = require('@gerhobbelt/gitignore-parser')


// Begin Definitions

const jflapExtension = ".jff"
const jflapHashFile = ".jflap-hashes"

const defaultMentorExtension = "nfa"

const attributePrefix = "@"
const stateFormat = {
  id: attributePrefix + "id",
  name: attributePrefix + "name",
  initial: "initial",
  final: "final"
}
const transitionFormat = {
  source: "from",
  destination: "to",
  value: "read",
}
const emptyStringValue = "_"

class State
{
  constructor(stateData)
  {
    this.id = stateData[stateFormat.id]
    this.name = stateData[stateFormat.name]
    this.initial = stateData[stateFormat.initial] !== undefined
    this.final = stateData[stateFormat.final] !== undefined
  }
}

class Transition
{
  constructor(transitionData, stateArray, transitionSourceMap)
  {
    this.sourceID = transitionData[transitionFormat.source]
    this.destinationID = transitionData[transitionFormat.destination]
    this.value = transitionData[transitionFormat.value]
    if (this.value === "") { this.value = emptyStringValue }

    this.sourceName = (stateArray.find((state) => state.id == this.sourceID) || {}).name
    this.destinationName = (stateArray.find((state) => state.id == this.destinationID) || {}).name

    var transitionSourceArray = (transitionSourceMap[this.sourceName] || [])
    transitionSourceArray.push(this)
    transitionSourceMap[this.sourceName] = transitionSourceArray
  }
}

// End Definitions

var argumentParser = new ArgumentParser()
argumentParser.add_argument('-i', '--input', {type: 'str', help: "Input .jff file / directory containing .jff files"})
argumentParser.add_argument('-s', '--selector', {type: 'str', help: "Input file selectors in RegEx style (ex. '1.*')"})
argumentParser.add_argument('-o', '--output', {type: 'str', help: "Output file / directory"})
argumentParser.add_argument('-f', '--format', {type: 'str', help: "Output file format (ex. 'dfa', 'nfa')"})

var arguments = argumentParser.parse_args()

if (arguments.input === undefined)
{
  console.log("ERR: No input file provided")
  return
}

var inputJFLAPPath = arguments.input
var inputSelector = arguments.selector
var outputMentorPath = arguments.output
var outputFormat = arguments.format

var selectorTester
if (inputSelector !== null)
{
  selectorTester = new RegExp(inputSelector)
  // selectorTester = gitignoreParser.compile(inputSelector) // doesn't seem to work :(
}

var jflapHashes = {}

if (!fs.existsSync(inputJFLAPPath))
{
  console.log("ERR: Input file \'" + inputJFLAPPath + "\' does not exist")
  return
}

if (fs.lstatSync(inputJFLAPPath).isDirectory())
{
  var jflapHashPath = path.join(inputJFLAPPath, jflapHashFile)
  if (fs.existsSync(jflapHashPath))
  {
    jflapHashes = JSON.parse(fs.readFileSync(jflapHashPath, {encoding:'utf8'}))
  }

  fs.readdirSync(inputJFLAPPath).filter(file => {
    return path.extname(file).toLowerCase() == jflapExtension && (selectorTester === null || selectorTester.test(file))
  }).forEach(filePath => {
    convertJFLAPToMentor(path.join(inputJFLAPPath, filePath), path.join(outputMentorPath || inputJFLAPPath, path.basename(filePath, jflapExtension) + "." + (outputFormat || defaultMentorExtension)), jflapHashes)
  })

  fs.writeFileSync(jflapHashPath, JSON.stringify(jflapHashes))
}
else
{
  var jflapHashPath = path.join(path.dirname(inputJFLAPPath), jflapHashFile)
  if (fs.existsSync(jflapHashPath))
  {
    jflapHashes = JSON.parse(fs.readFileSync(jflapHashPath, {encoding:'utf8'}))
  }

  convertJFLAPToMentor(inputJFLAPPath, outputMentorPath, jflapHashes)

  fs.writeFileSync(jflapHashPath, JSON.stringify(jflapHashes))
}

function convertJFLAPToMentor(inputJFLAPPath, outputMentorPath, jflapHashes)
{
  var outputMentorPath = outputMentorPath || (path.basename(inputJFLAPPath) + "." + defaultMentorExtension)

  const logStarCount = 15
  console.log("*".repeat(logStarCount-1) + " " + path.basename(outputMentorPath) + " " + "*".repeat(logStarCount-1))

  var xmlJFLAPString = fs.readFileSync(inputJFLAPPath, {encoding:'utf8'})

  var currentHash = crypto.createHash('md5').update(xmlJFLAPString + "--" + outputMentorPath).digest('hex')
  var previousHash = jflapHashes[path.basename(inputJFLAPPath)]
  jflapHashes[path.basename(inputJFLAPPath)] = currentHash

  if (currentHash === previousHash && fs.existsSync(outputMentorPath))
  {
    console.log("SKIPPED: Hashes identical")
    console.log("*".repeat(logStarCount) + "*".repeat(path.basename(outputMentorPath).length) + "*".repeat(logStarCount) + "\n")
    return
  }

  var jsonJFLAPData = xmlParser.parse(xmlJFLAPString, {
    attributeNamePrefix: attributePrefix,
    ignoreAttributes: false
  })

  var baseStructureObject = jsonJFLAPData.structure || {}
  var automatonType = baseStructureObject.type
  var automatonData = baseStructureObject.automaton

  if (automatonData == null)
  {
    console.log("ERR: No automaton data")
    return
  }

  const finiteAutomataCode = "fa"

  switch (automatonType)
  {
    case finiteAutomataCode:
    var stateArray = convertObjectToArrayIfNeeded(automatonData.state)
    var transitionArray = convertObjectToArrayIfNeeded(automatonData.transition)

    var stateObjects = stateArray.map((stateData) => {
      return new State(stateData)
    })

    var transitionSourceMap = {}
    var transitionObjects = transitionArray.map((transitionData) => {
      return new Transition(transitionData, stateObjects, transitionSourceMap)
    })

    // TODO: Ask for user input to complete alphabet if needed
    var partialAlphabet = [...new Set(transitionObjects.map((transition) => {
      return transition.value
    }))].filter((character) => {
      return character !== null && character.toString().length > 0 && character !== emptyStringValue
    }).sort()
    var partialAlphabetString = convertArrayToMentorString(partialAlphabet)

    var initialStateName = stateObjects.find((state) => state.initial).name

    var finalStateNameArray = stateObjects.filter((state) => state.final).map((state) => state.name).sort()
    var finalStatesString = convertArrayToMentorString(finalStateNameArray)

    var transitionsString = Object.keys(transitionSourceMap).map(sourceName => {
      var sourceString = sourceName

      var transitionsWithSource = transitionSourceMap[sourceName]
      transitionsWithSource.forEach(transition => {
        sourceString += " (" + transition.value + " -> " + transition.destinationName + ")"
      })

      return sourceString
    }).sort().reduce((previousString, nextElement) => {
      return previousString + "\n" + nextElement
    }, "")

    var mentorOutputString = "alphabet: " + partialAlphabetString + "\nstart: " + initialStateName + "\naccepting: " + finalStatesString + "\n" + transitionsString

    console.log(mentorOutputString)
    fs.writeFileSync(outputMentorPath, mentorOutputString)
    break

    default:
    console.log("ERR: Unsupported automaton type \'" + automatonType + "\'")
    return
  }

  console.log("*".repeat(logStarCount) + "*".repeat(path.basename(outputMentorPath).length) + "*".repeat(logStarCount) + "\n")
}

function convertObjectToArrayIfNeeded(data)
{
  if (data instanceof Array)
  {
    return data
  }
  return [data]
}

function convertArrayToMentorString(array)
{
  return "{" + array.reduce((previousString, nextElement) => {
    return previousString + nextElement + ", "
  }, "").slice(0, -2) + "}"
}
