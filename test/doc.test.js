require('dotenv').config()
const { SongoDBClient } = require('../lib/client')

const BASE_URL = process.env.SONGODB_URL


describe('doc', () => {
  const instanceid = "doc"
  const dbname = "doc"
  const collectionname = "doc"
  const docid = "doc"
  let doc = null
  beforeEach(async () => {
    let client = await SongoDBClient.connect(`${BASE_URL}/${instanceid}`)
    doc = client.db(dbname).collection(collectionname).doc(docid)
    await doc.insert({ hello: "world" })
  })
  afterEach(async () => {
    await doc.delete()
  })
  it ('should call find on the doc', async () => {
    let data = await doc.find()
    expect(data).toEqual({ "_id": docid, hello: "world" })
  })
  it ('should update the doc', async () => {
    await doc.update({ "$set": { hello: "foo" } })
    let data = await doc.find()
    expect(data).toEqual({ "_id": docid, hello: "foo" })
  })
  it ('should replace the doc', async () => {
    await doc.replace({ hello: "foo" })
    let data = await doc.find()
    expect(data).toEqual({ "_id": docid, hello: "foo" })
  })
  it ('should delete the doc', async () => {
    await doc.delete()
    let data = await doc.find()
    expect(data).toBe(null)
  })
})