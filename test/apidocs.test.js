require('dotenv').config()
const { SongoDBClient } = require('../lib/client')

const BASE_URL = process.env.SONGODB_URL

describe('insert', () => {
  const instanceid = "apidocs"
  const db = "store"
  const collection = "inventory"
  let instance = null
  beforeAll(async () => {
    instance = await SongoDBClient.connect(`${BASE_URL}/${instanceid}`)
  })
  afterAll(async () => {
    await instance.db(db).dropDatabase()
  })
  it ('should successfully insert a document', async () => {
    let inventory = instance.db('store').collection('inventory')
    let result = await inventory.insertOne({ 
      item: "canvas",
      qty: 100, 
      tags: [ "cotton" ],
      size: { 
        h: 28, 
        w: 35.5, 
        uom: "cm" 
      }
    })
    console.log(JSON.stringify(result, null, 2))
  })
  it ('should insert multiple documents', async () => {
    let inventory = instance.db('store').collection('inventory')
    let result = await inventory.insertMany([
      { item: "journal", qty: 25, tags: ["blank", "red"], size: { h: 14, w: 21, uom: "cm" } },
      { item: "mat", qty: 85, tags: ["gray"], size: { h: 27.9, w: 35.5, uom: "cm" } },
      { item: "mousepad", qty: 25, tags: ["gel", "blue"], size: { h: 19, w: 22.85, uom: "cm" } }
    ])
    console.log(JSON.stringify(result, null, 2))
  })
})

describe('find', () => {
  const instanceid = "apidocs"
  const db = "store"
  const collection = "inventory"
  let instance = null
  beforeAll(async () => {
    instance = await SongoDBClient.connect(`${BASE_URL}/${instanceid}`)
    await instance.db('store').collection('inventory').insertMany([
      { 
        item: "canvas",
        qty: 100, 
        tags: [ "cotton" ],
        size: { 
          h: 28, 
          w: 35.5, 
          uom: "cm" 
        }
      },
      { item: "journal", qty: 25, tags: ["blank", "red"], size: { h: 14, w: 21, uom: "cm" } },
      { item: "mat", qty: 85, tags: ["gray"], size: { h: 27.9, w: 35.5, uom: "cm" } },
      { item: "mousepad", qty: 25, tags: ["gel", "blue"], size: { h: 19, w: 22.85, uom: "cm" } }
    ])
  })
  afterAll(async () => {
    await instance.db(db).dropDatabase()
  })
  it ('should successfully find one document', async () => {
    let inventory = instance.db('store').collection('inventory')
    let result = await inventory.findOne({ item: "canvas" })
    console.log(JSON.stringify(result, null, 2))
  })
  it ('should successfully find multiple documents', async () => {
    let inventory = instance.db('store').collection('inventory')
    let result = await inventory.find({ qty: { "$lte": 50 } })
    console.log(JSON.stringify(result, null, 2))
  })
  // it ('should insert multiple documents', async () => {
  //   let inventory = instance.db('store').collection('inventory')
  //   let result = await inventory.insertMany([
  //     { item: "journal", qty: 25, tags: ["blank", "red"], size: { h: 14, w: 21, uom: "cm" } },
  //     { item: "mat", qty: 85, tags: ["gray"], size: { h: 27.9, w: 35.5, uom: "cm" } },
  //     { item: "mousepad", qty: 25, tags: ["gel", "blue"], size: { h: 19, w: 22.85, uom: "cm" } }
  //   ])
  //   console.log(JSON.stringify(result, null, 2))
  // })
})

describe('update', () => {
  const instanceid = "apidocs"
  const db = "store"
  const collection = "inventory"
  let instance = null
  beforeAll(async () => {
    instance = await SongoDBClient.connect(`${BASE_URL}/${instanceid}`)
    await instance.db('store').collection('inventory').insertMany([
      { 
        item: "canvas",
        qty: 100, 
        tags: [ "cotton" ],
        size: { 
          h: 28, 
          w: 35.5, 
          uom: "cm" 
        }
      },
      { item: "journal", qty: 25, tags: ["blank", "red"], size: { h: 14, w: 21, uom: "cm" } },
      { item: "mat", qty: 85, tags: ["gray"], size: { h: 27.9, w: 35.5, uom: "cm" } },
      { item: "mousepad", qty: 25, tags: ["gel", "blue"], size: { h: 19, w: 22.85, uom: "cm" } }
    ])
  })
  afterAll(async () => {
    await instance.db(db).dropDatabase()
  })
  it ('should successfully update one document', async () => {
    let inventory = instance.db('store').collection('inventory')
    let result = await inventory.updateOne({ item: "canvas" }, { "$inc": { qty: 25 } })
    console.log(JSON.stringify(result, null, 2))
  })
  it ('should successfully update multiple documents', async () => {
    let inventory = instance.db('store').collection('inventory')
    let result = await inventory.updateMany({ item: { "$in": [ "journal", "mousepad" ] } }, { "$inc":  100 })
    console.log(JSON.stringify(result, null, 2))
  })
  it ('should replace a document', async () => {
    let inventory = instance.db('store').collection('inventory')
    let result = await inventory.replaceOne(
      { item: "mat" }, 
      { item: "mat", qty: 100, tags: ["blue"], size: { h: 10.5, w: 20.5, uom: "cm" } })
    console.log(JSON.stringify(result, null, 2))
  })
})

describe('delete', () => {
  const instanceid = "apidocs"
  const db = "store"
  const collection = "inventory"
  let instance = null
  beforeAll(async () => {
    instance = await SongoDBClient.connect(`${BASE_URL}/${instanceid}`)
    await instance.db('store').collection('inventory').insertMany([
      { 
        item: "canvas",
        qty: 100, 
        tags: [ "cotton" ],
        size: { 
          h: 28, 
          w: 35.5, 
          uom: "cm" 
        }
      },
      { item: "journal", qty: 25, tags: ["blank", "red"], size: { h: 14, w: 21, uom: "cm" } },
      { item: "mat", qty: 85, tags: ["gray"], size: { h: 27.9, w: 35.5, uom: "cm" } },
      { item: "mousepad", qty: 25, tags: ["gel", "blue"], size: { h: 19, w: 22.85, uom: "cm" } }
    ])
  })
  afterAll(async () => {
    await instance.db(db).dropDatabase()
  })
  it ('should successfully delete multiple documents', async () => {
    let inventory = instance.db('store').collection('inventory')
    let result = await inventory.deleteMany({ item: { "$in": [ "journal", "mousepad" ] } })
    console.log(JSON.stringify(result, null, 2))
  })
  it ('should successfully delete a single document', async () => {
    let inventory = instance.db('store').collection('inventory')
    let result = await inventory.deleteOne({ tags: "blue" })
    console.log(JSON.stringify(result, null, 2))
  })
  it ('should drop the entire collection', async () => {
    let inventory = instance.db('store').collection('inventory')
    let result = await inventory.drop()
    console.log(JSON.stringify(result, null, 2))
  })
})

describe('database', () => {
  const instanceid = "apidocs"
  const db = "store"
  const collection = "inventory"
  let instance = null
  beforeAll(async () => {
    instance = await SongoDBClient.connect(`${BASE_URL}/${instanceid}`)
    await instance.db('store').collection('inventory').insertMany([
      { 
        item: "canvas",
        qty: 100, 
        tags: [ "cotton" ],
        size: { 
          h: 28, 
          w: 35.5, 
          uom: "cm" 
        }
      },
      { item: "journal", qty: 25, tags: ["blank", "red"], size: { h: 14, w: 21, uom: "cm" } },
      { item: "mat", qty: 85, tags: ["gray"], size: { h: 27.9, w: 35.5, uom: "cm" } },
      { item: "mousepad", qty: 25, tags: ["gel", "blue"], size: { h: 19, w: 22.85, uom: "cm" } }
    ])
    await instance.db('store').collection('customers').insertOne({
      name: "Daniel Jhin Yoo"
    })
    await instance.db('store').collection('employees').insertOne({
      name: "Owen Chon"
    })
  })
  afterAll(async () => {
    await instance.db(db).dropDatabase()
  })
  it ('should successfully listCollections', async () => {
    let result = await instance.db('store').listCollections()
    console.log(JSON.stringify(result, null, 2))

    result = await instance.db('store').listCollections({ nameOnly: true })
    console.log(JSON.stringify(result, null, 2))
  })
  it ('should drop the entire database', async () => {
    let result = await instance.db('store').dropDatabase()
    console.log(JSON.stringify(result, null, 2))
  })
})

describe('database', () => {
  const instanceid = "apidocs"
  const db = "store"
  const collection = "inventory"
  let instance = null
  beforeAll(async () => {
    instance = await SongoDBClient.connect(`${BASE_URL}/${instanceid}`)
    await instance.db('store').collection('inventory').insertMany([
      { 
        item: "canvas",
        qty: 100, 
        tags: [ "cotton" ],
        size: { 
          h: 28, 
          w: 35.5, 
          uom: "cm" 
        }
      },
      { item: "journal", qty: 25, tags: ["blank", "red"], size: { h: 14, w: 21, uom: "cm" } },
      { item: "mat", qty: 85, tags: ["gray"], size: { h: 27.9, w: 35.5, uom: "cm" } },
      { item: "mousepad", qty: 25, tags: ["gel", "blue"], size: { h: 19, w: 22.85, uom: "cm" } }
    ])
    await instance.db('store').collection('customers').insertOne({
      name: "Daniel Jhin Yoo"
    })
    await instance.db('store').collection('employees').insertOne({
      name: "Owen Chon"
    })
  })
  afterAll(async () => {
    await instance.db(db).dropDatabase()
  })
  it ('should successfully listCollections', async () => {
    let result = await instance.db('store').listCollections()
    console.log(JSON.stringify(result, null, 2))

    result = await instance.db('store').listCollections({ nameOnly: true })
    console.log(JSON.stringify(result, null, 2))
  })
  it ('should drop the entire database', async () => {
    let result = await instance.db('store').dropDatabase()
    console.log(JSON.stringify(result, null, 2))
  })
})