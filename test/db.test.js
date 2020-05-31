require('dotenv').config()
const { SongoDBClient } = require('../lib/client')

const BASE_URL = process.env.SONGODB_URL

describe('collection', () => {
  const instanceid = "db"
  const dbname = "db"
  beforeAll(async () => {
    let client = await SongoDBClient.connect(`${BASE_URL}/${instanceid}`)
    db = client.db(dbname)
  })
  afterAll(async () => {
    await db.dropDatabase()
  })
  it ('should successfully return a collection instance', async () => {
    let collection = db.collection("somecollection")
    expect(collection).toBeTruthy()
  })
})

describe('dropDatabase', () => {
  const instanceid = "db"
  const dbname = "db"
  let client = null
  beforeEach(async () => {
    client = await SongoDBClient.connect(`${BASE_URL}/${instanceid}`)
    await client.db(dbname).collection('col1').insertOne({ hello: "world" })
    await client.db(dbname).collection('col1').insertOne({ hello: "foo" })
  })
  afterEach(async () => {
    await client.db(dbname).dropDatabase()
  })
  it ('should successfully drop database in one scan', async () => {
    let result = await client.db(dbname).dropDatabase()
    expect(result[0]).toMatchObject({
      deletedCount: 2, 
      dropped: true
    })
  })
  it ('should successfully drop database in multiple scans', async () => {
    let result = await client.db(dbname).dropDatabase({ MaxKeys: 1 })
    expect(result[1]).toMatchObject({
      deletedCount: 1, 
      dropped: true
    })
  })
})

describe('listCollections', () => {
  const instanceid = "db"
  const dbname = "db"
  let client = null
  beforeAll(async () => {
    client = await SongoDBClient.connect(`${BASE_URL}/${instanceid}`)
  })
  afterEach(async () => {
    try {
      await client.db(dbname).dropDatabase()
    } catch (err) { }
  })
  it ('should return no collections on non-existent database', async () => {
    let result = await client.db(dbname).listCollections().toArray()
    expect(result).toEqual([])
  })
  it ('should return all collections', async () => {
    await client.db(dbname).collection('col1').insertOne({ hello: "world" })
    await client.db(dbname).collection('col2').insertOne({ foo: "bar" })
    let result = await client.db(dbname).listCollections().toArray()
    expect(result).toEqual([ { name: "col1" }, { name: "col2" } ])
  })
  it ('should return collections using filter', async () => {
    await client.db(dbname).collection('col1').insertOne({ hello: "world" })
    await client.db(dbname).collection('col2').insertOne({ foo: "bar" })
    let result = await client.db(dbname).listCollections({ name: { "$in": [ 'col1' ] } }).toArray()
    expect(result).toEqual([ { name: "col1" } ])
  })
  it ('should only return collection names with nameOnly param', async () => {
    await client.db(dbname).collection('col1').insertOne({ hello: "world" })
    await client.db(dbname).collection('col2').insertOne({ foo: "bar" })
    let result = await client.db(dbname).listCollections({}, { nameOnly: true }).toArray()
    expect(result).toEqual([ "col1", "col2" ])
  })
})

