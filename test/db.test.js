require('dotenv').config()
const { SongoDBClient } = require('../lib/client')

const BASE_URL = process.env.SONGODB_URL

describe('SongoDB', () => {
  const instanceid = "somekey"
  const dbname = "somedb"
  let db = null
  beforeAll(async () => {
    let client = await SongoDBClient.connect(`${BASE_URL}/${instanceid}`)
    db = client.db(dbname)
  })
  it ('should successfully return a collection instance', async () => {
    let collection = db.collection("somecollection")
    expect(collection).toBeTruthy()
  })
})