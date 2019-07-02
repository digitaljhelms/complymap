const argv = require('yargs').argv
const http = require('http')
const request = require('request')
const xml2js = require('xml2js').Parser()
const json2html = require('node-json2html')

const options = {
  url: argv.url,
  root: (argv.root || 'urlset'),
  entry: (argv.entry || 'url')
}

module.export = request(options.url, (err, res, body) => {
  if (!err && res.statusCode == 200) {
    xml2js.parseString(body, function (err, result) {
      let json = JSON.parse(JSON.stringify(result))[options.root][options.entry]
      // console.log(json)

      const transform = {
        'item': {
          '<>': 'li',
          'html': [{
            '<>': 'a',
            'href': '${loc}',
            'html': '${loc}'
          }]
        },
        'template': {
          '<>': 'html',
          'html': [{
            '<>': 'body',
            'html': [{
              '<>': 'ol',
              'html': function () {
                return (json2html.transform(json, transform.item));
              }
            }]
          }]
        }
      }

      const html = json2html.transform({}, transform.template)

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
