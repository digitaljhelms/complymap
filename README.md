`npm run start -- --url=http://www.example.com/sitemap.xml` would fetch `sitemap.xml`, transform the XML into a simple HTML page of links, and serve the output over HTTP port 3000.

```XML
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"> 
  <url>
    <loc>http://www.example.com/foo.html</loc>
    <lastmod>2018-06-04</lastmod>
  </url>
</urlset>
```

_Note: The `lastmod` node is ignored._

The rendered HTML output:

```HTML
<html>
  <body>
    <ol>
      <li><a href="http://www.example.com/foo.html">http://www.example.com/foo.html</a></li>
    </ol>
  </body>
</html>
```

`urlset` and `url` are the default nodes searched for in the XML structure, however, additional CLI arguments can be specified:

* `root`: The root/top-level document node
* `entry`: The parent node for each URL

These arguments are useful for addressing differences in XML structure; for example:

```XML
<sitemapindex xmlns="http://www.google.com/schemas/sitemap/0.84">
  <sitemap>
    <loc>https://www.google.com/gmail/sitemap.xml</loc>
  </sitemap>
</sitemapindex>
```

For the above structure, the following command arguments would be necessary:
`npm run start -- --url=https://www.google.com/sitemap.xml --root=sitemapindex --entry=sitemap`
