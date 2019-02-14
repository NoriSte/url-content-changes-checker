const checker = require("./index");

checker([
  {
    url: 'http://backoffice2.staging.aws.conio.com/api/utilities/schema',
    dir: "backoffice2-graphql-schema-2",
    fileNamePrefix: "schema",
  },
  {
    url: 'https://mobile.conio.com/api/v1.0/price/btc/last',
    dir: "btc",
    fileNamePrefix: "fiat",
  }
], {
  // rootDir: "differences"
});
