const { SongoDBCollection } = require('./collection')
const { Cursor, DeleteCursor } = require('./cursor')

class SongoDB {

  constructor(client, name, options) {
    this.client = client
    this.name = name
    this.options = options || { }
  }

  collection(name) {
    return new SongoDBCollection(this.client, this, name)
  }

  listCollections(filter, options) {
    return new Cursor(this.listCollectionsRequest.bind(this), [ filter, options || { } ])
  }

  async listCollectionsRequest(filter, options) {
    options = options || { }
    let url = `${this.name}/system/namespaces`
    let response = await this.client.request({
      url,
      method: 'GET',
      params: { 
        filter: JSON.stringify(filter), 
        options: JSON.stringify(options)
      }
    })
    return response.data
  }

  async dropDatabase(options) {
    options = options || { }
    let cursor = new DeleteCursor(this.dropDatabaseRequest.bind(this), [ options ])
    return await cursor.complete()
  }

  async dropDatabaseRequest(options) {
    options = options || { }
    let url = `${this.name}`
    let response = await this.client.request({
      url,
      method: 'DELETE',
      params: { 
        // no filter param means to drop rather than clear contents
        options: JSON.stringify(options)
      }
    })
    return response.data
  }
}


module.exports = exports = {
  SongoDB
}