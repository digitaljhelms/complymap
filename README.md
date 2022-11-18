## Usage

`npm run {output} --url==http://www.example.com/sitemap.xml`

### Output

Two output options are available: `html` and `text`

Each output option is outlined below using the following example XML input.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"> 
  <url>
    <loc>http://www.example.com/foo.html</loc>
    <lastmod>2018-06-04</lastmod>
  </url>
  <url>
    <loc>http://www.example.com/bar.html</loc>
    <lastmod>2018-06-04</lastmod>
  </url>
  <url>
    <loc>http://www.example.com/baz.html</loc>
    <lastmod>2018-06-04</lastmod>
  </url>
</urlset>
```

Note: It is possible to pass the script output in as an option using `npm run start` as well, example: `npm run start -- --text --url=http://www.example.com/sitemap.xml` However, if this is used, and the output option is invalid (not `--html` or `--text`) the output will default to using `html`.

#### `html`

`npm run html -- --url=http://www.example.com/sitemap.xml` will fetch `sitemap.xml`, transform the XML into a simple HTML page with links, and serve the output over HTTP port 3000.

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
        <li>
          <a href="http://www.example.com/foo.html">http://www.example.com/foo.html</a>
        </li>
        <li>
          <a href="http://www.example.com/bar.html">http://www.example.com/bar.html</a>
        </li>
        <li>
          <a href="http://www.example.com/baz.html">http://www.example.com/baz.html</a>
        </li>
      </ol>
    </main>
  </body>
</html>
```

####  `text`

`npm run text -- --url=http://www.example.com/sitemap.xml` will fetch `sitemap.xml`, transform the XML into a plain text file URLs, and serve the output over HTTP port 3000.

The rendered text output:

```
http://www.example.com/foo.html
http://www.example.com/bar.html
http://www.example.com/baz.html
```

## Custom XML Structure

`urlset` and `url` are the default nodes searched for in the XML structure, however, additional CLI options can be specified.

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

```
npm run html -- --url=https://www.example.com/sitemap.xml --root=sitemapindex --entry=sitemap
```

Additionally, `--sortasc` or `--sortdesc` could be used to sort by `pubDate`, `changefreq`, or `priority`.

## CLI Options

* Options can be passed after `npm run {function} -- `
* Each option must be prefixed with `--` and the corresponding value (if required) must be preceeded by an equal (`=`) symbol

| Option | Default Value | Description |
| ------ | ------- | ----------- |
| `root` | `urlset` | The root/top-level document node |
| `entry` | `url` | The parent node for each URL |
| `location` | `loc` | The primary node containing each URL |
| `sortasc` | `loc` | What XML node to use for sorting (ascending) |
| `sortdesc` | none | What XML node to use for sorting (descending) |
| `timestamp` | none | To display the date/time stamp of last modified or published (if it exists in the XML) pass the value of the XML node itself (ex: `--timestamp=lastmod`) |
| `user` | none | Basic authentication username |
| `pass` | none | Basic authentication password |
| `ignore` | none | Omit URLs found in an ignore list file (see [Ignore Lists](#ignore-lists) below) |
| `save` | none | Saves the output to `sitemap.html` or `sitemap.txt` based on the function being executed (does not launch a local HTTP server for viewing output) |
| `port` | `3000` | HTTP port the Node server will use for localhost (ignored if the `--save` option is used) |

Note: When using `--sortasc` or `--sortdesc` only one option can be passed; if both are passed, `--sortasc` will take precedence and `--sortdesc` will be ignored.

## Ignore Lists

To omit URLs found in the fetched `sitemap.xml` from being rendered in the output simply create an `ignore-list.txt` file that contains a single fully-qualified URL, per-line, with **no EOF carriage return** at the end of the file, and use the `--ignore` option at runtime.

Additionally, if the `--ignore` option is given a value it can be used to supply a path to either a local file named something different or even a URL to remotely hosted file that is reachable by the script at runtime.

```
npm run html -- --url=https://www.example.com/sitemap.xml --ignore=/foo/bar/baz.list
npm run html -- --url=https://www.example.com/sitemap.xml --ignore=https://www.foo.bar/baz.list
```

Note: If a URL is provided, it must use an [RFC 3886](https://www.rfc-editor.org/rfc/rfc3986) valid URL scheme.
