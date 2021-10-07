const jflapExtension = ".jff"
const jflapHashFile = ".jflap-hashes"

const jflapCodes = {
  finiteAutomata: "fa"
}

const defaultMentorExtension = "nfa"

const emptyStringValue = "_"
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

const logStarCount = 15

module.exports = {
  jflapExtension: jflapExtension,
  jflapHashFile: jflapHashFile,
  jflapCodes: jflapCodes,
  defaultMentorExtension: defaultMentorExtension,
  emptyStringValue: emptyStringValue,
  attributePrefix: attributePrefix,
  stateFormat: stateFormat,
  transitionFormat: transitionFormat,
  logStarCount: logStarCount
}
