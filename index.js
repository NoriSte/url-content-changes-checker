const checkChanges = require("./check-changes");

checkChanges([{
    url: 'https://www.unixtimestamp.com/',
    baseFileName: "unixtimestamp"
}
, {
    url: 'http://backoffice2.staging.aws.conio.com/api/utilities/schema',
    baseFileName: "backoffice2-graphql-schema-2"
}
]);
