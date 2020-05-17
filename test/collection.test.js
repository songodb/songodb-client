require('dotenv').config()
const { SongoDBClient } = require('../lib/client')

const BASE_URL = process.env.SONGODB_URL

describe('insert', () => {
  const instanceid = "collection"
  const dbname = "somedb"
  const collectionname = "somecollection"
  let collection = null
  beforeAll(async () => {
    let client = await SongoDBClient.connect(`${BASE_URL}/${instanceid}`)
    collection = client.db(dbname).collection(collectionname)
  })
  afterEach(async () => {
    await collection.db.dropDatabase()
  })
  it ('should call insertMany', async () => {
    let docs = [ 
      { _id: "2", name: "obj2", i: 2 }, 
      { _id: "3", name: "obj3", i: 3 }, 
      { _id: "1", name: "obj1", i: 1 } 
    ]
    let result = await collection.insertMany(docs)
    expect(result).toMatchObject({
      "insertedCount": 3
    })
    expect(result.ops.map(doc => doc["_id"]).sort()).toEqual([ "1", "2", "3" ])
    expect(result.insertedIds.sort()).toEqual([ "1", "2", "3" ])
  })
})

describe('find', () => {
  const instanceid = "collection"
  const dbname = "somedb"
  const collectionname = "somecollection"
  let collection = null
  beforeAll(async () => {
    let client = await SongoDBClient.connect(`${BASE_URL}/${instanceid}`)
    collection = client.db(dbname).collection(collectionname)
  })
  afterEach(async () => {
    await collection.db.dropDatabase()
  })
  it ('should call find', async () => {
    let docs = [ 
      { _id: "2", name: "obj2", i: 2 }, 
      { _id: "3", name: "obj3", i: 3 }, 
      { _id: "1", name: "obj1", i: 1 } 
    ]
    await collection.insertMany(docs)
    let result = await collection.find({ name: { "$in": [ "obj1", "obj2" ] } }, { sort: [ [ "_id", 1 ] ] })
    expect(result).toMatchObject({
      "docs":[ 
        { "_id": "1", "name": "obj1", "i": 1 },
        { "_id": "2", "name": "obj2", "i": 2 }
      ],
      "explain": {
        "executionStats": {
          "nReturned": 2,
          "executionTimeMillis": expect.anything(),
          "totalKeysExamined": expect.anything(),
          "totalDocsExamined": expect.anything()
        },
        "s3": {
          "KeyCount": 3,
          "MaxKeys": 100,
          "NextContinuationToken": null,
          "TimeMillis": expect.anything() 
        }
      }
    })
  })
})

describe('drop', () => {
  const instanceid = "collection"
  const dbname = "somedb"
  const collectionname = "somecollection"
  let collection = null
  beforeEach(async () => {
    let client = await SongoDBClient.connect(`${BASE_URL}/${instanceid}`)
    collection = client.db(dbname).collection(collectionname)
    await collection.insertOne({ hello: "world" })
  })
  afterEach(async () => {
    try {
      await collection.db.dropDatabase() // TODO: server shouldn't return error if db doesn't exist
    } catch (err) { }
  })
  it ('should drop collection and contents', async () => {
    let result = await collection.drop()
    expect(result).toMatchObject({
      deletedCount: 1, 
      dropped: true
    })
  })
})
