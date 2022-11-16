## Usage

`npm run start -- --url=http://www.example.com/sitemap.xml` would fetch `sitemap.xml`, transform the XML into a simple HTML page of links, and serve the output over HTTP port 3000.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"> 
  <url>
    <loc>http://www.example.com/foo.html</loc>
    <lastmod>2018-06-04</lastmod>
  </url>
</urlset>
```

The rendered HTML output:

```html
<html lang="en">
  <head>
    <title>HTMLMAP</title>
    <style>body { font-family: sans-serif; }</style>
  </head>
  <body>
    <main>
      <ol>
        <li><a href="http://www.example.com/foo.html">http://www.example.com/foo.html</a></li>
      </ol>
    </main>
  </body>
</html>
```

## Custom XML Structure

`urlset` and `url` are the default nodes searched for in the XML structure, however, additional CLI arguments can be specified.

These arguments are useful for addressing differences in XML structure; for example:

```xml
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://www.example.com/foo.html</loc>
    <pubDate>2022-01-01T01:00:00+00:00</pubDate>
    <changefreq>daily</changefreq>
    <priority>1.00</priority>
  </sitemap>
</sitemapindex>
```

For the above structure, the following command arguments would be necessary:
`npm run start -- --url=https://www.example.com/sitemap.xml --root=sitemapindex --entry=sitemap`

Additionally, `--sortasc` or `--sortdesc` could be used to sort by `pubDate`, `changefreq`, or `priority`.

---

Note: To prevent a URL found in the fetched `sitemap.xml` from being rendered in the HTML output, use the `ignore-list.txt` file – a single, fully-qualified URL, per-line, with no EOF carriage return – and pass the `--ignore` option.

---

## CLI Options

Options must be passed after `npm run start -- `, prefixed with `--`, and a value preceeding an equal (`=`) symbol.



| Option | Default | Description |
| ------ | ------- | ----------- |
| `root` | `urlset` | The root/top-level document node |
| `entry` | `url` | The parent node for each URL |
| `loc` | `loc` | The primary node containing each URL |
| `sortasc` | `loc` | What XML node to use for sorting (ascending) |
| `sortdesc` | none | What XML node to use for sorting (descending) |
| `timestamp` | none | To display the date/time stamp of last modified or published (if it exists in the XML) pass the value of the XML node itself (ex: `--dtstamp=lastmod`) |
| `user` | none | Basic authentication username |
| `pass` | none | Basic authentication password |
| `ignore` | none | Remove URLs found in `ignore-list.txt` file |

Note: When using `sortasc` or `sortdesc` only one option can be passed; if both are passed, `sortasc` will take precedence and `sortdesc` will be ignored.
