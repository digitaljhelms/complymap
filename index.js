const argv = require('yargs').argv
const fs = require('fs')
const http = require('http')
const json2html = require('node-json2html')
const pretty = require('pretty')
const request = require('request')
const xml2js = require('xml2js').parseString
const noop = () => {}

if (!argv.url) {
  console.log('htmlmap: [ERR] No sitemap.xml URL supplied, please see README')
  process.exit(1)
}

if (!argv.text && !argv.html) {
  console.log('htmlmap: [ERR] Invalid output format provided, defaulting to HTML\n')
}

const options = {
  format: (argv.text ? 'text' : 'html'),
  url: argv.url,
  root: (argv.root || 'urlset'),
  entry: (argv.entry || 'url'),
  location: (argv.location || 'loc'),
  timestamp: (argv.timestamp || null),
  sort: (argv.sortasc || argv.sortdesc || 'loc'),
  reverse: (argv.sortdesc ? true : false),
  ignore: (argv.ignore ? true : false),
  ignorelist: (argv.ignore ? ((typeof argv.ignore === 'string') ? argv.ignore : 'ignore-list.txt') : null),
  save: (argv.save || false),
  outputfile: (argv.save ? (argv.text ? 'sitemap.txt' : 'sitemap.html') : null),
  port: (argv.port || 3000)
}

if (argv.user && argv.pass) {
  options.headers = {
    'Authorization': 'Basic ' + Buffer.from(argv.user + ':' + argv.pass).toString('base64'),
  }
}

console.log('htmlmap: [ARGS] Configuration being used\n', options, '\n')

Array.prototype.remove = function (key, value) {
  const index = this.findIndex(obj => obj[key] === value)
  return (index >= 0 ? [
    ...this.slice(0, index),
    ...this.slice(index + 1)
  ] : this)
}

const sort_by = (field, reverse, primer) => {
  const key = primer ? x => primer(x[field]) : x => x[field]
  reverse = !reverse ? 1 : -1

  return (a, b) => (a = key(a), b = key(b), reverse * ((a > b) - (b > a)))
}

const validURL = (val) => {
  let url
  try {
    url = new URL(val)
  } catch (_) {
    return false
  }
  return url.protocol === "http:" || url.protocol === "https:"
}

// 1 FQ URL per-line, no EOF carriage return
let ignoreList = ''
if (options.ignore) {
  if (validURL(options.ignorelist)) {
    request.get(options.ignorelist, (err, res, body) => {
      if (!err && res.statusCode == 200) {
        ignoreList = body.toString().split('\n')
      } else {
        console.log('httpmap: [WARN] Remote ignore list could not be retrieved, skipping\n')
      }
    })
  } else {
    try {
      ignoreList = fs.readFileSync(options.ignorelist).toString().split('\n')
    } catch (err) {
      console.log('httpmap: [WARN] Ignore list not found or not accessible, skipping\n')
    }
  }
}

console.log('htmlmap: [HTTP] Retrieving sitemap.xml\n')

module.exports.htmlmap = request.get(options, (err, res, body) => {
  if (!err && res.statusCode == 200) {
    xml2js(body, { explicitArray: false }, function (err, result) {
      let json = JSON.parse(JSON.stringify(result))[options.root][options.entry]

      json.sort(sort_by(options.sort, options.reverse, function (a) {
        return (a ? a.toString().toUpperCase() : null )
      }))

      if (options.ignore) {
        try {
          ignoreList.forEach(function (val) {
            json = json.remove(options.location, val)
          })
          console.log(`httpmap: [JSON] Removed URLs found in ${options.ignorelist}\n`)
        } catch (err) {
          console.log('httpmap: [WARN] Ignore list could not be properly parsed, skipping\n')
        }
      }

      let output = ''

      if (options.format === 'html') {
        const transform = {
          'item': {
            '<>': 'li',
            'text': function (obj) {
              if (options.timestamp && obj[options.timestamp]) {
                return '(' + obj[options.timestamp].toString() + ') '
              }
            },
            'html': [{
              '<>': 'a',
              'href': '${' + options.location + '}',
              'html': '${' + options.location + '}'
            }]
          },
          'template': {
            '<>': 'html',
            'lang': 'en',
            'html': [{
              '<>': 'head',
              'html': [{
                '<>': 'title',
                'text': 'HTMLMAP',
              },{
                '<>': 'style',
                'text': 'body { font-family: sans-serif; }'
              }]
            },
            {
              '<>': 'body',
              'html': [{
                '<>': 'main',
                'html': [{
                  '<>': 'ol',
                  'html': function () {
                    return (json2html.render(json, transform.item))
                  }
                }]
              }]
            }]
          }
        }

        output = pretty(json2html.render({}, transform.template))
      } else {
        json.forEach(function (val) {
          output += val[options.location].toString() + '\n'
        })
      }

      if (options.save) {
        fs.writeFile(options.outputfile, output.trim(), (err) => {
          if (err) throw err
          console.log(`htmlmap: [SAVE] Output saved to ${options.outputfile}`)
        })
      } else {
        const contentType = (options.format === 'html' ? 'text/html' : 'text/plain')
        http.createServer(function (req, res) {
          res.writeHead(200, {
            'Content-Type': contentType
          });
          res.end(output)
        }).listen(options.port)

        console.log('htmlmap: [SERV] Listening on http://localhost:3000')
      }
    })
  } else {
    console.log('htmlmap: [ERR] An error occurred')
    throw err
  }
})
