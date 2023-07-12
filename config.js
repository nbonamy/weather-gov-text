
const YAML = require('yaml')
const fs = require('fs')

FILENAME = 'config.yml'

module.exports = class {

  constructor() {
    this.reload()
  }

  reload() {
    this._init()
    this._load()
  }

  _init() {
  }

  _load() {

    try {
      var config = fs.readFileSync(FILENAME, { encoding: 'utf8' })
      Object.assign(this, YAML.parse(config))
    } catch (err) {
    }

  }

  save() {
    //console.log(this)
    fs.writeFileSync(FILENAME, YAML.stringify(this))
  }

}
