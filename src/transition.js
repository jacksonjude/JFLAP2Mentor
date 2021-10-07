const Constants = require('./constants')

class Transition
{
  constructor(transitionData, stateArray, transitionSourceMap)
  {
    this.sourceID = transitionData[Constants.transitionFormat.source]
    this.destinationID = transitionData[Constants.transitionFormat.destination]
    this.value = transitionData[Constants.transitionFormat.value]
    if (this.value === "") { this.value = Constants.emptyStringValue }

    this.sourceName = (stateArray.find((state) => state.id == this.sourceID) || {}).name
    this.destinationName = (stateArray.find((state) => state.id == this.destinationID) || {}).name

    var transitionSourceArray = (transitionSourceMap[this.sourceName] || [])
    transitionSourceArray.push(this)
    transitionSourceMap[this.sourceName] = transitionSourceArray
  }
}

module.exports = Transition
