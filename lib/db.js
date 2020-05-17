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

  async listCollections(filter, options) {
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