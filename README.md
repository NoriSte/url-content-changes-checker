# url-content-changes-checker
A Node.js script to read and compare a remote resource content.

**!!!THE PACKAGE ISN'T READY YET!!!**

I developed this script because I needed to check some text resources (GraphQL schemas, Elastic Search mappings, JSONs etc.) from some private (VPN protected) endpoints. A pipelined solution would be better but, at the time I wrote this script, I can't leverage my backend and devops colleauges.

I then developed this simple utility, open the `index.js` file to see how to use my script, you have the following options:
- `dir`: where to put the scraped files (default to "history")
- `url`: the file will be scraped by default with an `Axios.get` call
- `baseFileName`: the file will be saved with this prefix (defailt to the `url` option)

The comparison is based on [jsdiff](https://github.com/kpdecker/jsdiff).
