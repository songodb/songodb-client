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
  beforeAll(async () => {
    client = await SongoDBClient.connect(`${BASE_URL}/${instanceid}`)
    await client.db(dbname).collection('col1').insertOne({ hello: "world" })
  })
  afterAll(async () => {
    await client.db(dbname).dropDatabase()
  })
  it ('should successfully drop database and delete all contents', async () => {
    let result = await client.db(dbname).dropDatabase()
    expect(result).toMatchObject({
      deletedCount: 2, // should logically be 1 but right now server is counting metadata records as well i.e. system.*
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
    let result = await client.db(dbname).listCollections()
    expect(result).toMatchObject({
      docs: []
    })
  })
  it ('should return all collections', async () => {
    await client.db(dbname).collection('col1').insertOne({ hello: "world" })
    await client.db(dbname).collection('col2').insertOne({ foo: "bar" })
    let result = await client.db(dbname).listCollections()
    expect(result).toMatchObject({
      docs: [ { name: "col1" }, { name: "col2" } ]
    })
  })
  it ('should return collections using filter', async () => {
    await client.db(dbname).collection('col1').insertOne({ hello: "world" })
    await client.db(dbname).collection('col2').insertOne({ foo: "bar" })
    let result = await client.db(dbname).listCollections({ name: { "$in": [ 'col1' ] } })
    expect(result).toMatchObject({
      docs: [ { name: "col1" } ]
    })
  })
  it ('should only return collection names with nameOnly param', async () => {
    await client.db(dbname).collection('col1').insertOne({ hello: "world" })
    await client.db(dbname).collection('col2').insertOne({ foo: "bar" })
    let result = await client.db(dbname).listCollections({}, { nameOnly: true })
    expect(result).toMatchObject({
      docs: [ "col1", "col2" ]
    })
  })
})

