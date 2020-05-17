require('dotenv').config()
const { SongoDBClient } = require('../lib/client')

const BASE_URL = process.env.SONGODB_URL

describe('connect', () => {
  const instanceid = "client"
  it ('should successfully connect to an instance using a url', async () => {
    let client = await SongoDBClient.connect(`${BASE_URL}/${instanceid}`)
    expect(client).toBeTruthy()
  })
})

describe('db', () => {
  const instanceid = "client"
  it ('should successfully return a db instance', async () => {
    let client = await SongoDBClient.connect(`${BASE_URL}/${instanceid}`)
    let db = client.db("somedb")
    expect(db).toBeTruthy()
  })
})

describe('listDatabases', () => {
  const instanceid = "client"
  let client = null
  let dbname = "db"
  beforeAll(async () => {
    client = await SongoDBClient.connect(`${BASE_URL}/${instanceid}`)
  })
  afterEach(async () => {
    try {
      await client.db(dbname).dropDatabase()
    } catch (err) { }
  })
  it ('should empty if no databases exist', async () => {
    let dbs = await client.listDatabases()
    expect(dbs).toMatchObject({
      docs: []
    })
  })
  it ('should return database if it exists', async () => {
    let col = client.db(dbname).collection('listDatabases')
    await col.insertOne({ hello: "world" })
    let dbs = await client.listDatabases()
    expect(dbs).toMatchObject({
      docs: [ { name: dbname } ]
    })
  })
  it ('should only return db names with nameOnly param', async () => {
    let col = client.db(dbname).collection('listDatabases')
    await col.insertOne({ hello: "world" })
    let dbs = await client.listDatabases({ nameOnly: true })
    expect(dbs).toMatchObject({
      docs: [ dbname ]
    })
  })
})