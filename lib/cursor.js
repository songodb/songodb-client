const { sort } = require('@songodb/mongojs')

class Cursor {

  constructor(fn, args) {
    // what is the intial operation are we doing
    this.fn = fn
    this.args = args
    let options = this.args[this.args.length-1]
    this.sort = options['sort'] || false
  }

  // returns a generator which auto pages ala Stripe auto-pagination
  // https://stripe.com/docs/api/pagination
  // In Node 10:
  // for await (const customer of stripe.customers.list({limit: 3})) {
  //   // Do something with customer
  // }
  // returns an individual document
  // will not guarantee sort order
  list() {
    return fetchDocuments(this.fn, this.args)
  }

  pages() {
    return fetchPages(this.fn, this.args)
  }

  // Returns an array of documents
  // https://mongodb.github.io/node-mongodb-native/3.6/api/Cursor.html#toArray
  async toArray() {
    let docs = [ ]
    let iterator = fetchPages(this.fn, this.args)
    for await (const result of iterator) {
      if (result && result.length > 0) {
        docs.push(...result)
      }
    }
    return this.sortDocs(docs)
  }

  sortDocs(docs) {
    return this.sort && docs.sort(sort(this.sort)) || docs
  }
}

async function* fetchPages(fn, args) {
  let IsTruncated = true
  let NextContinuationToken = null

  while (IsTruncated) {
    if (NextContinuationToken) {
      let options = args[args.length-1] // assume options is always the last arg
      options.cursor = NextContinuationToken
    }
    let result = await fn(...args)
    IsTruncated = result.explain.s3.IsTruncated
    NextContinuationToken = result.explain.s3.NextContinuationToken
    yield result.docs 
  }
}

async function* fetchDocuments(fn, args) {
  let result = await fn(...args) // is it bad form to fetch outside of the while loop?
  let i = 0
  let docs = result.docs
  let IsTruncated = result.explain.s3.IsTruncated
  let NextContinuationToken = result.explain.s3.NextContinuationToken
  while (i < docs.length || IsTruncated) {
    if (i < docs.length) {
      yield docs[i]
      i += 1
    }
    if (i == docs.length && NextContinuationToken) {
      let options = args[args.length-1] // assume options is always the last arg
      options.cursor = NextContinuationToken
      let result = await fn(...args)
      docs = result.docs
      i = 0
      IsTruncated = result.explain.s3.IsTruncated
      NextContinuationToken = result.explain.s3.NextContinuationToken
    }
  }
}

class UpdateCursor {
  constructor(fn, args) {
    // what is the intial operation are we doing
    this.fn = fn
    this.args = args
  }

  iterator() {
    return scanPages(this.fn, this.args)
  }

  async complete() {
    let results = [ ]
    let iterator = scanPages(this.fn, this.args)
    for await (const result of iterator) {
      if (result) {
        results.push(result)
      }
    }
    return aggregateWriteResults(results)
  }
}

class DeleteCursor {
  constructor(fn, args) {
    // what is the intial operation are we doing
    this.fn = fn
    this.args = args
  }

  iterator() {
    return scanPages(this.fn, this.args)
  }

  async complete() {
    let results = [ ]
    let iterator = scanPages(this.fn, this.args)
    for await (const result of iterator) {
      if (result) {
        results.push(result)
      }
    }
    return aggregateWriteResults(results)
  }
}


async function* scanPages(fn, args) {
  let IsTruncated = true
  let NextContinuationToken = null

  while (IsTruncated) {
    if (NextContinuationToken) {
      let options = args[args.length-1] // assume options is always the last arg
      options.cursor = NextContinuationToken
    }
    let result = await fn(...args)
    IsTruncated = result.explain.s3.IsTruncated
    NextContinuationToken = result.explain.s3.NextContinuationToken
    yield result
  }
}


// DELETE
// deletedCount
// UPDATE
// "matchedCount": 1,
// "modifiedCount": 1,
// "upsertedCount": 0,
// "upsertedId": null,
// "explain": {
//   "executionStats": {
//     "nReturned": 1,
//     "executionTimeMillis": 1329,
//     "totalKeysExamined": 0,
//     "totalDocsExamined": 4
//   },
//   "s3": {
//     "IsTruncated": false,
//     "KeyCount": 4,
//     "MaxKeys": 1000,
//     "NextContinuationToken": null,
//     "TimeMillis": 1271
//   }
// }
function aggregateWriteResults(results) {
  return results.reduce((agg, result) => {
    // DELETED
    agg.deletedCount += result.deletedCount
    // UPDATE
    agg.matchedCount += result.matchedCount
    agg.modifiedCount += result.modifiedCount
    agg.upsertedCount += result.upsertedCount
    agg.upsertedId = result.upsertedId // should only be ever 1?
    // DROP
    agg.dropped = result.dropped || false
    // EXECUTIONSTATS
    agg.explain.executionStats.nReturned += result.explain.executionStats.nReturned
    agg.explain.executionStats.executionTimeMillis += result.explain.executionStats.executionTimeMillis
    agg.explain.executionStats.totalKeysExamined += result.explain.executionStats.totalKeysExamined
    agg.explain.executionStats.totalDocsExamined += result.explain.executionStats.totalDocsExamined
    // S3
    agg.explain.s3.IsTruncated = result.explain.s3.IsTruncated // only use last value
    agg.explain.s3.KeyCount += result.explain.s3.KeyCount
    agg.explain.s3.MaxKeys = result.explain.s3.MaxKeys  // only use last value
    agg.explain.s3.NextContinuationToken = result.explain.s3.NextContinuationToken // only use last value
    agg.explain.s3.TimeMillis += result.explain.s3.TimeMillis
    // keep each result
    agg["_results"].push(result)
    return agg
  }, { 
    deletedCount: 0,
    matchedCount: 0,
    modifiedCount: 0,
    upsertedCount: 0,
    upsertedId: null,
    dropped: false,
    explain: {
      executionStats: {
        nReturned: 0,
        executionTimeMillis: 0,
        totalKeysExamined: 0,
        totalDocsExamined: 0
      },
      s3: {
        IsTruncated: false,
        KeyCount: 0,
        MaxKeys: null,
        NextContinuationToken: null,
        TimeMillis: 0
      }
    },
    _results: [ ]
  })
}


module.exports = exports = {
  Cursor,
  UpdateCursor,
  DeleteCursor,
  fetchPages,
  fetchDocuments,
  scanPages,
  aggregateWriteResults
}