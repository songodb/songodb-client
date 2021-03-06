require('dotenv').config()
const { SongoDBClient } = require('../lib/client')

const BASE_URL = process.env.SONGODB_URL

describe('insert', () => {
  const instanceid = "collection"
  const dbname = "insert"
  const collectionname = "insert"
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
  const dbname = "find"
  const collectionname = "find"
  let collection = null
  beforeEach(async () => {
    let client = await SongoDBClient.connect(`${BASE_URL}/${instanceid}`)
    collection = client.db(dbname).collection(collectionname)
    let docs = [ 
      { _id: "2", name: "obj2", i: 2 }, 
      { _id: "3", name: "obj3", i: 3 }, 
      { _id: "1", name: "obj1", i: 1 } 
    ]
    await collection.insertMany(docs)
  })
  afterEach(async () => {
    await collection.drop()
  })
  it ('should call findOne', async () => {
    let doc = await collection.findOne({ name: { "$in": [ "obj1", "obj2" ] } }, { MaxKeys: 1 })
    expect(doc).toEqual({ _id: '1', name: 'obj1', i: 1 })
  })
  it ('should call findOne with sort', async () => {
    let doc = await collection.findOne({ }, { MaxKeys: 1, sort: [ [ "_id", -1 ] ]})
    expect(doc).toEqual({ _id: '3', name: 'obj3', i: 3 })
  })
  it ('should call find.toArray', async () => {
    let result = await collection.find({ name: { "$in": [ "obj1", "obj2" ] } }, { sort: [ [ "_id", 1 ] ] }).toArray()
    expect(result).toEqual([ 
      { "_id": "1", "name": "obj1", "i": 1 },
      { "_id": "2", "name": "obj2", "i": 2 }
    ])
  })
})

describe('update', () => {
  const instanceid = "collection"
  const dbname = "update"
  const collectionname = "update"
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
  it ('should return a list iterator', async () => {
    let iterator = collection.updateMany(
      { name: { "$in": [ "obj0", "obj9" ] } }, 
      { "$set": { i: 10 } },
      { maxScan: 1 }
    ).iterator()
    let results = [ ]
    for await (const result of iterator) {
      results.push(result)
    }
    expect(results.map(result => result.modifiedCount)).toEqual([1,0,0,0,0,0,0,0,0,1])
  }, 30 * 1000)
  it ('should wait for the update to complete', async () => {
    let result = await collection.updateMany(
      { name: { "$in": [ "obj0", "obj9" ] } }, 
      { "$set": { i: 10 } },
      { maxScan: 1 }
    ).complete()
    expect(result).toMatchObject({
      matchedCount: 2,
      modifiedCount: 2,
      explain: {
        executionStats: { 
          nReturned: 2,
          totalDocsExamined: 10
        },
        s3: {
          IsTruncated: false,
          KeyCount: 10,
        }
      }
    })
    expect(result["_results"].map(result => result.modifiedCount)).toEqual([1,0,0,0,0,0,0,0,0,1])
  }, 30 * 1000)
  it ('should only updateOne record', async () => {
    let result = await collection.updateOne(
      { name: { "$in": [  "obj9" ] } }, 
      { "$set": { i: 10 } },
      { maxScan: 1 }
    )
    expect(result).toMatchObject({
      matchedCount: 1,
      modifiedCount: 1,
      explain: {
        executionStats: { 
          nReturned: 1,
          totalDocsExamined: 10
        },
        s3: {
          IsTruncated: false,
          KeyCount: 10,
        }
      }
    })
    expect(result["_results"].map(result => result.modifiedCount)).toEqual([0,0,0,0,0,0,0,0,0,1])
  }, 30 * 1000)
  it ('should replace only one record', async () => {
    let result = await collection.replaceOne(
      { name: { "$in": [ "obj8", "obj9" ] } }, 
      { name: "rep8" },
      { maxScan: 1 }
    )
    expect(result).toMatchObject({
      matchedCount: 1,
      modifiedCount: 1,
      explain: {
        executionStats: { 
          nReturned: 1,
          totalDocsExamined: 9
        },
        s3: {
          IsTruncated: true, // client stopped scan because found first match
          KeyCount: 9,
        }
      }
    })
    expect(result["_results"].map(result => result.matchedCount)).toEqual([0,0,0,0,0,0,0,0,1])
  }, 30 * 1000)
})


describe('delete', () => {
  const instanceid = "collection"
  const dbname = "delete"
  const collectionname = "delete"
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
  it ('should return a list iterator', async () => {
    let iterator = collection.deleteMany(
      { name: { "$in": [ "obj0", "obj9" ] } }, 
      { maxScan: 1 }
    ).iterator()
    let results = [ ]
    for await (const result of iterator) {
      results.push(result)
    }
    expect(results.map(result => result.deletedCount)).toEqual([1,0,0,0,0,0,0,0,0,1])
  }, 30 * 1000)
  it ('should wait for the delete to complete', async () => {
    let result = await collection.deleteMany(
      { name: { "$in": [ "obj0", "obj9" ] } }, 
      { maxScan: 1 }
    ).complete()
    expect(result).toMatchObject({
      deletedCount: 2,
      explain: {
        executionStats: { 
          nReturned: 2,
          totalDocsExamined: 10
        },
        s3: {
          IsTruncated: false,
          KeyCount: 10,
        }
      }
    })
    expect(result["_results"].map(result => result.deletedCount)).toEqual([1,0,0,0,0,0,0,0,0,1])
  }, 30 * 1000)
  it ('should only delete one record', async () => {
    let result = await collection.deleteOne(
      { name: { "$in": [  "obj8", "obj9" ] } }, 
      { maxScan: 1 }
    )
    expect(result).toMatchObject({
      deletedCount: 1,
      explain: {
        executionStats: { 
          nReturned: 1,
          totalDocsExamined: 9
        },
        s3: {
          IsTruncated: true, // client stopped scan because found first match
          KeyCount: 9,
        }
      }
    })
    expect(result["_results"].map(result => result.deletedCount)).toEqual([0,0,0,0,0,0,0,0,1])
  }, 30 * 1000)
})

describe('drop', () => {
  const instanceid = "collection"
  const dbname = "drop"
  const collectionname = "drop"
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
  it ('should drop collection and contents', async () => {
    let result = await collection.drop({ maxScan: 1 })
    expect(result["_results"].map(result => result.dropped)).toEqual([
      false,false,false,false,false,false,false,false,false,true
    ])
  }, 30 * 1000)
})
