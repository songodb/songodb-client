
class SongoDBDoc {

  constructor(client, db, collection, id, options) {
    this.client = client
    this.db = db
    this.collection = collection
    this.id = id
    this.options = options || { }
  }

  async insert(doc, options) {
    options = options || { }
    doc = doc || { }
    doc["_id"] = this.id
    return await this.collection.insertOne(doc, options)
  }

  async find(query, options) {
    query = query || { }
    query["_id"] = this.id
    return await this.collection.findOne(query, options)
  }

  async update(up, options) {
    options = options || { }
    let filter = { "_id": this.id }
    return await this.collection.updateOne(filter, up, options)
  }

  async replace(doc, options) {
    options = options || { }
    let filter = { "_id": this.id }
    return await this.collection.replaceOne(filter, doc, options)
  }

  async delete(options) {
    options = options || { }
    let filter = { "_id": this.id }
    return await this.collection.deleteOne(filter, options)
  }
}

module.exports = exports = {
  SongoDBDoc
}