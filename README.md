- [url-content-changes-checker](#url-content-changes-checker)
- [What it does](#what-it-does)
- [Example](#example)
- [Options](#options)
- [Why](#why)
- [Notes](#notes)

# url-content-changes-checker

A Node.js script to read and compare a remote resource content.

# What it does

This package:

- reads a remote text-based resource
- compares it with the previous one
- if it changed saves the latest version...
- ... logs the comparison...
  ![alt text](screenshots/terminal-diff.jpg?raw=true)
- ... and saves a readable HTML file
  ![alt text](screenshots/html-diff.jpg?raw=true)

# Example

```javascript
const checker = require("url-content-changes-checker");

checker([
  {
    url: "http://example.com/schema",
    dir: "example-schema",
    fileNamePrefix: "schema"
  }
]);
```

produces the following file system

```****
history
└───example-schema
│   │   schema-1550135407094
│   │   schema-1550136769927
│   │   schema-1550136769927.html
│   │   schema-1550136789201
│   │   schema-1550136789201.html

```

# Options

`checker(list, options)`

- `list`: an array of
  - `url`: the utl to be fetched
  - `dir`: the directory where the different versions of the content are stored
  - `fileNamePrefix`: the prefix for the version files (default: `item`)
  - `resourceReader`: a custom resource fetcher (`Axios.get` is be used by default) that must returns a Promise resolving with a `{data}` object
- `options`
  - `rootDir`: the dir where **every** file is persisted (default: `history`)

If you want to dive more check the `tests` directory.

# Why

I developed this script because I needed to check some text resources (GraphQL schemas, Elastic Search mappings, JSONs etc.) from some private (VPN protected) endpoints. A pipelined solution would be better but, at the time I wrote this script, I can't leverage my backend and devops colleagues.

# Notes

- The comparison is based on [jsdiff](https://github.com/kpdecker/jsdiff).
