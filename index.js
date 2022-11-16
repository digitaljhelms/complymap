const argv = require('yargs').argv
const fs = require('fs')
const http = require('http')
const json2html = require('node-json2html')
const request = require('request')
const xml2js = require('xml2js').parseString

if (!argv.url) {
  console.log('htmlmap: [ERR] No sitemap.xml URL supplied, please see README')
  process.exit(1)
}

const options = {
  url: argv.url,
  root: (argv.root || 'urlset'),
  entry: (argv.entry || 'url'),
  loc: (argv.loc || 'loc'),
  timestamp: argv.timestamp,
  sort: (argv.sortasc || argv.sortdesc || 'loc'),
  reverse: (argv.sortdesc ? true : false),
  ignore: (argv.ignore || false)
}

if (argv.user && argv.pass) {
  options.headers = {
    'Authorization': 'Basic ' + Buffer.from(argv.user + ':' + argv.pass).toString('base64'),
  }
}
console.log(options)

Array.prototype.remove = function (key, value) {
  const index = this.findIndex(obj => obj[key] === value);
  return index >= 0 ? [
    ...this.slice(0, index),
    ...this.slice(index + 1)
  ] : this;
}

const sort_by = (field, reverse, primer) => {
  const key = primer ? x => primer(x[field]) : x => x[field]
  reverse = !reverse ? 1 : -1

  return (a, b) => (a = key(a), b = key(b), reverse * ((a > b) - (b > a)))
}

module.export = request.get(options, (err, res, body) => {
  if (!err && res.statusCode == 200) {
    xml2js(body, function (err, result) {
      let json = JSON.parse(JSON.stringify(result))[options.root][options.entry]
      // console.log(json)

      json.sort(sort_by(options.sort, options.reverse, function (a) {
        return (a ? a.toString().toUpperCase() : null )
      }))
      
      // 1 FQ URL per-line, no EOF carriage return
      if (options.ignore) {
        try {
          const ignoreList = fs.readFileSync('ignore-list.txt').toString().split('\n')

          ignoreList.forEach(function (val) {
            json = json.remove(options.loc, val)
          })
          console.log('httpmap: [JSON] Removing URLs found in ignore-list.txt file.')
        } catch (err) {
          console.log('httpmap: [ERR] No ignore-list.txt file found.')
        }
      }

      const transform = {
        'item': {
          '<>': 'li',
          'text': function(obj) {
            if (options.timestamp && obj[options.timestamp]) {
              // console.log(obj[options.timestamp].toString())
              return '(' + obj[options.timestamp].toString() + ') '
            }
          },
          // 'text': '(${' + options.timestamp + '} )',
          'html': [{
            '<>': 'a',
            'href': '${' + options.loc + '}',
            'html': '${' + options.loc + '}'
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

      const html = json2html.render({}, transform.template)
      // console.log(html)

      http.createServer(function (req, res) {
        res.writeHead(200, {
          'Content-Type': 'text/html'
        });
        res.end(html)
      }).listen(3000)

      console.log(`htmlmap: [HTTP] Listening on http://localhost:3000`)
    })
  } else {
    // console.log(err)
    throw err
  }
})
