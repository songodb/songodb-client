require('dotenv').config()
const { SongoDBClient } = require('../lib/client')

const BASE_URL = process.env.SONGODB_URL

describe('SongoDBCollection', () => {
  const instanceid = "somekey"
  const dbname = "somedb"
  const collectionname = "somecollection"
  let collection = null
  beforeAll(async () => {
    let client = await SongoDBClient.connect(`${BASE_URL}/${instanceid}`)
    collection = client.db(dbname).collection(collectionname)
  })
  afterEach(async () => {
    await collection.deleteMany({})
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
