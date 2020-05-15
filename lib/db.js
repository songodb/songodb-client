const { SongoDBCollection } = require('./collection')

class SongoDB {

  constructor(client, name, options) {
    this.client = client
    this.name = name
    this.options = options || { }
  }

  collection(name) {
    return new SongoDBCollection(this.client, this, name)
  }
}


module.exports = exports = {
  SongoDB
}