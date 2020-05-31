const { SongoDBDoc } = require('./doc')
const { Cursor, UpdateCursor, DeleteCursor } = require('./cursor')

class SongoDBCollection {
  
  constructor(client, db, name, options) {
    this.client = client
    this.db = db
    this.name = name
    this.options = options || { }
  }

  doc(id) {
    return new SongoDBDoc(this.client, this.db, this, id)
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

  find(query, options) {
    return new Cursor(this.findRequest.bind(this), [ query, options || { } ])
  }

  async findOne(query, options) {
    options = options || { }
    options.limit = 1
    if (options['sort']) {
      // we actually have to get everything, then sort, then pull the first one
      let docs = await this.find(query, options).toArray()
      return docs[0]
    } else {
      // we just return the first thing the iterator returns
      let iterator = this.find(query, options).list()
      for await (const doc of iterator) {
        return doc
      }
      return null
    }
  }

  async findRequest(query, options) {
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

  updateMany(filter, update, options) {
    return new UpdateCursor(this.updateRequest.bind(this), [ filter, update, options || { } ])
  }

  async updateOne(filter, update, options) {
    options = options || { }
    options.limit = 1
    let iterator = this.updateMany(filter, update, options).iterator()
    let results = [ ]
    for await (const result of iterator) {
      results.push(result)
      if (result && result.matchedCount > 0) {
        return results
      }
    }
    return results
  }

  async updateRequest(filter, update, options) {
    options = options || { }
    let url = `${this.db.name}/${this.name}`
    let response = await this.client.request({
      url,
      method: 'PATCH',
      data: { filter, update, options }
    })
    return response.data
  }


  async replaceOne(filter, doc, options) {
    let iterator = new UpdateCursor(this.replaceRequest.bind(this), [ filter, doc, options || { } ]).iterator()
    let results = [ ]
    for await (const result of iterator) {
      results.push(result)
      if (result && result.matchedCount > 0) {
        return results
      }
    }
    return results
  }

  async replaceRequest(filter, doc, options) {
    options = options || { }
    let url = `${this.db.name}/${this.name}`
    let response = await this.client.request({
      url,
      method: 'PUT',
      data: { filter, doc, options }
    })
    return response.data
  }

  deleteMany(filter, options) {
    return new DeleteCursor(this.deleteRequest.bind(this), [ filter, options || { } ])
  }

  async deleteOne(filter, options) {
    options = options || { }
    options.limit = 1
    let iterator = this.deleteMany(filter, options).iterator()
    let results = [ ]
    for await (const result of iterator) {
      results.push(result)
      if (result && result.deletedCount > 0) {
        return results
      }
    }
    return results
  }
  
  async deleteRequest(filter, options) {
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

  async drop(options) {
    let results = await this.deleteMany(null, options).complete()
    return results
  }
}

module.exports = exports = {
  SongoDBCollection
}