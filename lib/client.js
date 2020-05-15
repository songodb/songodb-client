const { SongoDB } = require('./db')
const axios = require('axios').default;

class SongoDBClient {

  constructor(axios, options) {
    this.axios = axios
    this.options = options || { }
  }

  static async connect(url, options) {
    // TODO: some kind of auth/validation here
    let axiosOptions = {
      baseURL: url,
      timeout: 30000,
      headers: { }
    }
    return new SongoDBClient(axios.create(axiosOptions), options)
  }

  db(name) {
    return new SongoDB(this, name)
  }

  async request(config) {
    return await this.axios.request(config)
  }
}

module.exports = exports = { 
  SongoDBClient
}
