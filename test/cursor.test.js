require('dotenv').config()

const { 
  Cursor,
  fetchPages,
  fetchDocuments
} = require('../lib/cursor')
const { SongoDBClient } = require('../lib/client')
const BASE_URL = process.env.SONGODB_URL

describe('Cursor', () => {
  const instanceid = "cursor"
  const dbname = "cursor"
  const collectionname = "Cursor"
  let collection = null
  beforeEach(async () => {
    let client = await SongoDBClient.connect(`${BASE_URL}/${instanceid}`)
    collection = client.db(dbname).collection(collectionname)
    let docs = [ ]
    for (let i=0; i<=9; i++) {
      docs.push({ _id: `${i}`, name: `obj${i}`, i })
    }
    await collection.insertMany(docs)
  })
  afterEach(async () => {
    await collection.drop()
  })
  it ('should return a page iterator', async () => {
    let fn = collection.findRequest.bind(collection)
    let filter = { }
    let options = { MaxKeys: 1 }
    let args = [ filter, options ]
    let cursor = new Cursor(fn, args)
    for await (const result of cursor.pages()) {
      //console.log(JSON.stringify(result, null, 2))
    }
  }, 30 * 1000)
  it ('should return a list iterator', async () => {
    let fn = collection.findRequest.bind(collection)
    let filter = { }
    let options = { MaxKeys: 1 }
    let args = [ filter, options ]
    let cursor = new Cursor(fn, args)
    for await (const result of cursor.list()) {
      //console.log(JSON.stringify(result, null, 2))
    }
  }, 30 * 1000)
  it ('should return all docs sorted using toArray', async () => {
    let fn = collection.findRequest.bind(collection)
    let filter = { }
    let options = { MaxKeys: 1, sort: [ [ "_id", -1 ] ] }
    let args = [ filter, options ]
    let cursor = new Cursor(fn, args)
    let docs = await cursor.toArray()
    expect(docs.map(doc => doc["_id"])).toEqual([ "9", "8", "7", "6", "5", "4", "3", "2", "1", "0" ])
  }, 30 * 1000)
})

describe('fetchPages', () => {
  const instanceid = "cursor"
  const dbname = "cursor"
  const collectionname = "fetchPages"
  let collection = null
  beforeEach(async () => {
    let client = await SongoDBClient.connect(`${BASE_URL}/${instanceid}`)
    collection = client.db(dbname).collection(collectionname)
    let docs = [ ]
    for (let i=0; i<=9; i++) {
      docs.push({ _id: `${i}`, name: `obj${i}`, i })
    }
    await collection.insertMany(docs)
  })
  afterEach(async () => {
    await collection.drop()
  })
  it ('should fetch pages of results', async () => {
    let fn = collection.findRequest.bind(collection)
    let filter = { }
    let options = { MaxKeys: 1 }
    let args = [ filter, options ]
    let iterator = fetchPages(fn, args)
    for await (const result of iterator) {
      //console.log(JSON.stringify(result, null, 2))
    }
  }, 30 * 1000)
  it ('should return empty pages if some fetches have no results', async () => {
    let fn = collection.findRequest.bind(collection)
    let filter = { "name": { "$in": [ "obj1", "obj2", "obj7", "obj9" ] } }
    let options = { MaxKeys: 3 }
    let args = [ filter, options ]
    let iterator = fetchPages(fn, args)
    let docs = [ ]
    for await (const result of iterator) {
      docs.push(result)
    }
    //console.log(JSON.stringify(docs, null, 2))
  }, 30 * 1000)
})

describe('fetchDocuments', () => {
  const instanceid = "cursor"
  const dbname = "cursor"
  const collectionname = "fetchDocuments"
  let collection = null
  beforeEach(async () => {
    let client = await SongoDBClient.connect(`${BASE_URL}/${instanceid}`)
    collection = client.db(dbname).collection(collectionname)
    let docs = [ ]
    for (let i=0; i<=9; i++) {
      docs.push({ _id: `${i}`, name: `obj${i}`, i })
    }
    await collection.insertMany(docs)
  })
  afterEach(async () => {
    await collection.drop()
  })
  it ('should list each document', async () => {
    let fn = collection.findRequest.bind(collection)
    let filter = { }
    let options = { MaxKeys: 3 }
    let args = [ filter, options ]
    let iterator = fetchDocuments(fn, args)
    for await (const result of iterator) {
      //console.log(JSON.stringify(result, null, 2))
    }
  }, 30 * 1000)
  it ('should not return blank documents if some fetches have no results', async () => {
    let fn = collection.findRequest.bind(collection)
    let filter = { "name": { "$in": [ "obj1", "obj2", "obj7", "obj9" ] } }
    let options = { MaxKeys: 3 }
    let args = [ filter, options ]
    let iterator = fetchDocuments(fn, args)
    let docs = [ ]
    for await (const result of iterator) {
      docs.push(result)
    }
    //console.log(JSON.stringify(docs, null, 2))
  }, 30 * 1000)
})