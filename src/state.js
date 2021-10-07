const Constants = require('./constants')

class State
{
  constructor(stateData)
  {
    this.id = stateData[Constants.stateFormat.id]
    this.name = stateData[Constants.stateFormat.name]
    this.initial = stateData[Constants.stateFormat.initial] !== undefined
    this.final = stateData[Constants.stateFormat.final] !== undefined
  }
}

module.exports = State
