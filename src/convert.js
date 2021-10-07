const xmlParser = require('fast-xml-parser')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const State = require('./state')
const Transition = require('./transition')
const Constants = require('./constants')

function convertJFLAPToMentor(inputJFLAPPath, outputMentorPath, fullAlphabet, jflapHashes)
{
  var outputMentorPath = outputMentorPath || (path.basename(inputJFLAPPath) + "." + Constants.defaultMentorExtension)

  console.log("*".repeat(Constants.logStarCount-1) + " " + path.basename(outputMentorPath) + " " + "*".repeat(Constants.logStarCount-1))

  var xmlJFLAPString = fs.readFileSync(inputJFLAPPath, {encoding:'utf8'})

  var currentHash = crypto.createHash('md5').update(xmlJFLAPString + "--" + outputMentorPath + "--" + JSON.stringify(fullAlphabet)).digest('hex')
  var previousHash = jflapHashes[path.basename(inputJFLAPPath)]
  jflapHashes[path.basename(inputJFLAPPath)] = currentHash

  if (currentHash === previousHash && fs.existsSync(outputMentorPath))
  {
    console.log("SKIPPED: Hashes identical")
    console.log("*".repeat(Constants.logStarCount) + "*".repeat(path.basename(outputMentorPath).length) + "*".repeat(Constants.logStarCount) + "\n")
    return
  }

  var jsonJFLAPData = xmlParser.parse(xmlJFLAPString, {
    attributeNamePrefix: Constants.attributePrefix,
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

  switch (automatonType)
  {
    case Constants.jflapCodes.finiteAutomata:
    var stateArray = convertObjectToArrayIfNeeded(automatonData.state)
    var transitionArray = convertObjectToArrayIfNeeded(automatonData.transition)

    var stateObjects = stateArray.map((stateData) => {
      return new State(stateData)
    })

    var transitionSourceMap = {}
    var transitionObjects = transitionArray.map((transitionData) => {
      return new Transition(transitionData, stateObjects, transitionSourceMap)
    })

    var outputAlphabet = [...new Set(transitionObjects.map((transition) => {
      return transition.value.toString()
    }).concat(fullAlphabet))].filter((character) => {
      return character !== null && character !== undefined && character.toString().length > 0 && character !== Constants.emptyStringValue
    }).sort()
    var outputAlphabetString = convertArrayToMentorString(outputAlphabet)

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

    var mentorOutputString = "alphabet: " + outputAlphabetString + "\nstart: " + initialStateName + "\naccepting: " + finalStatesString + "\n" + transitionsString

    console.log(mentorOutputString)
    fs.writeFileSync(outputMentorPath, mentorOutputString)
    break

    default:
    console.log("ERR: Unsupported automaton type \'" + automatonType + "\'")
    return
  }

  console.log("*".repeat(Constants.logStarCount) + "*".repeat(path.basename(outputMentorPath).length) + "*".repeat(Constants.logStarCount) + "\n")
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

module.exports = convertJFLAPToMentor
