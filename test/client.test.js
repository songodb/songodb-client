require('dotenv').config()
const { SongoDBClient } = require('../lib/client')

const BASE_URL = process.env.SONGODB_URL

describe('SongoDBClient', () => {
  const instanceid = "somekey"
  it ('should successfully connect to an instance using a url', async () => {
    let client = await SongoDBClient.connect(`${BASE_URL}/${instanceid}`)
    expect(client).toBeTruthy()
  })
  it ('should successfully return a db instance', async () => {
    let client = await SongoDBClient.connect(`${BASE_URL}/${instanceid}`)
    let db = client.db("somedb")
    expect(db).toBeTruthy()
  })
})