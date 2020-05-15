
class SongoDBCollection {
  
  constructor(client, db, name, options) {
    this.client = client
    this.db = db
    this.name = name
    this.options = options || { }
  }

  async insertMany(docs, options) {
    options = options || { }
    let url = `${this.db.name}/${this.name}`
    let response = await this.client.request({
      url,
      method: 'POST',
      data: { docs, options }
    })
    return response.data
  }

  async insertOne(doc, options) {
    options = options || { }
    let url = `${this.db.name}/${this.name}`
    let response = await this.client.request({
      url,
      method: 'POST',
      data: { doc, options }
    })
    return response.data
  }

  async find(query, options) {
    options = options || { }
    let url = `${this.db.name}/${this.name}`
    let response = await this.client.request({
      url,
      method: 'GET',
      params: { 
        query: JSON.stringify(query),
        options: JSON.stringify(options)
      }
    })
    return response.data
  }

  async findOne(query, options) {
    options = options || { }
    options.one = true
    return await this.find(query, options)
  }

  async updateMany(filter, update, options) {
    options = options || { }
    let url = `${this.db.name}/${this.name}`
    let response = await this.client.request({
      url,
      method: 'PATCH',
      data: { filter, update, options }
    })
    return response.data
  }

  async updateOne(filter, update, options) {
    options = options || { }
    options.one = true
    return await this.updateMany(filter, update, options)
  }

  async replaceOne(filter, doc, options) {
    options = options || { }
    let url = `${this.db.name}/${this.name}`
    let response = await this.client.request({
      url,
      method: 'PUT',
      data: { filter, doc, options }
    })
    return response.data
  }

  async deleteMany(filter, options) {
    options = options || { }
    let url = `${this.db.name}/${this.name}`
    let response = await this.client.request({
      url,
      method: 'DELETE',
      params: { 
        filter: JSON.stringify(filter),
        options: JSON.stringify(options)
      }
    })
    return response.data
  }

  async deleteOne(filter, options) {
    options = options || { }
    options.one = true
    return await this.deleteMany(filter, options)
  }
}

module.exports = exports = {
  SongoDBCollection
}