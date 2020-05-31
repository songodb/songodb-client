const FIND_PARAMS = [ 
  "filter",
  "sort",
  "skip",
  "limit",
  "projection",
  "cursor",
  "maxScan"
]

function encodeFindParams(options) {
  return FIND_PARAMS.reduce((find, key) => {
    let val = options[key]
    if (val) {
      find[key] = (typeof val === 'string') && val || JSON.stringify(val)
    }
    return find
  }, { })
}

function extractNonFindOptions(options) {
  let keys = Object.keys(options).filter(key => !FIND_PARAMS.includes(key))
  return keys.reduce((extract, key) => {
    extract[key] = options[key]
    return extract
  }, { })
}

module.exports = exports = {
  encodeFindParams,
  extractNonFindOptions
}