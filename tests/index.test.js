const axios = require("axios");
const fs = require("fs");
const axiosMockAdapter = require("axios-mock-adapter");
const delay = require("timeout-as-promise");
const rimraf = require("rimraf");
const checker = require("../index");
const constants = require("../constants");

const schema1 = `
type TestSchema {
  activity_id: Int
}
`;
const schema2 = `
type TestSchema {
  activity_uuid: String
}
`;
const json1 = {
  rows: [["3209.22", 1550130036000]]
};
const json2 = {
  rows: [["3209.23", 1550130036001]]
};

const runChecker = async (...rest) => {
  checker(...rest);
  await delay(10); // to be sure the file system is consistent
};

describe("URL Content Changes Checker tests", () => {
  let axiosMock;

  beforeEach(() => {
    axiosMock = new axiosMockAdapter(axios);
  });

  afterEach(() => {
    axiosMock.reset();
    rimraf.sync(constants.ROOT_DIR);
  });

  it("Should create the corresponding file system at the first call", async () => {
    const list = {
      url: "http://example.com/schema",
      dir: "example-schema"
    };
    axiosMock.onGet(list.url).reply(200, schema1);

    await runChecker(list);

    const files = fs.readdirSync(`${constants.ROOT_DIR}/${list.dir}`);
    expect(files).toHaveLength(1);
  });

  it("Should save two versions of the file if it changes and a HTML version containing the differences", async () => {
    const list = {
      url: "http://example.com/schema",
      dir: "example-schema"
    };

    axiosMock.onGet(list.url).reply(200, schema1);
    await runChecker(list);

    axiosMock.onGet(list.url).reply(200, schema2);
    await runChecker(list);

    const files = fs.readdirSync(`${constants.ROOT_DIR}/${list.dir}`);
    expect(files).toHaveLength(3);
    const htmlFiles = files.filter(item => item.endsWith(".html"));
    expect(htmlFiles).toHaveLength(1);
  });

  it("Should work with two contents to be checked", async () => {
    const list = [
      {
        url: "http://example.com/schema",
        dir: "example-schema"
      },
      {
        url: "http://example.com/json",
        dir: "example-json"
      }
    ];
    axiosMock.onGet(list[0].url).reply(200, schema1);
    axiosMock.onGet(list[1].url).reply(200, schema2);

    await runChecker(list);

    let files = fs.readdirSync(`${constants.ROOT_DIR}/${list[0].dir}`);
    expect(files).toHaveLength(1);
    files = fs.readdirSync(`${constants.ROOT_DIR}/${list[1].dir}`);
    expect(files).toHaveLength(1);
  });

  it("Should work with a custom root directory", async () => {
    const list = {
      url: "http://example.com/schema",
      dir: "example-schema"
    };
    const options = {
      rootDir: "archive"
    };
    axiosMock.onGet(list.url).reply(200, schema1);

    await runChecker(list, options);

    const files = fs.readdirSync(`${options.rootDir}/${list.dir}`);
    expect(files).toHaveLength(1);
    rimraf.sync(options.rootDir);
  });

  it("Should save the files accordingly to a custom prefix", async () => {
    const list = {
      url: "http://example.com/schema",
      dir: "example-schema",
      fileNamePrefix: "schema"
    };
    axiosMock.onGet(list.url).reply(200, schema1);

    await runChecker(list);

    const files = fs.readdirSync(`${constants.ROOT_DIR}/${list.dir}`);
    expect(files).toHaveLength(1);
    expect(files.filter(item => item.startsWith(list.fileNamePrefix))).toHaveLength(1);
  });

  it("Should not create two version of the same content if it didn't changed", async () => {
    const list = {
      url: "http://example.com/schema",
      dir: "example-schema"
    };
    axiosMock.onGet(list.url).reply(200, schema1);

    await runChecker(list);
    await runChecker(list);

    const files = fs.readdirSync(`${constants.ROOT_DIR}/${list.dir}`);
    expect(files).toHaveLength(1);
  });

  it("Should throw an error if an item hasn't the mandatory settings", async () => {
    let list = {
      dir: "example-schema"
      // missing url
    };
    expect(() => checker(list)).toThrow();

    list = {
      url: "http://example.com/schema"
      // missing dir
    };
    expect(() => checker(list)).toThrow();
  });
});
