const axios = require("axios");
const fs = require("fs");
const axiosMockAdapter = require("axios-mock-adapter");
const delay = require("timeout-as-promise");
const rimraf = require("rimraf");
const checker = require("../index");
const constants = require("../constants");

describe("URL Content Changes Checker tests", () => {
  let axiosMock;

  beforeAll(() => {
    axiosMock = new axiosMockAdapter(axios);
    axiosMock.onGet("/http://example.com/schema").reply(
      200,
      `
    schema {
      query: ActivitySchema
    }

    type ActivitySchema {
      activity_id: String
      activity_type: Int
      user_id: String
      input_wallet_ids: [String]
      output_wallet_ids: [String]
      vins: [TransactionInputSchema]
      vouts: [TransactionOutputSchema]
      address_ids: [String]
      crypto_amount: BigInt
      transaction_id: String
      mining_fee: Int
      created_at: DateTime
      ask_id: String
      bid_id: String
      currency: String
      fiat_amount: Int
      implicit_fees: Float
      explicit_fees: Float
      shift: Float
    }

    `
    );
  });

  afterAll(() => {
    axiosMock.reset();
  });

  it("Should create the corresponding file system at the first call", async () => {
    const list = {
      url: "http://example.com/schema",
      dir: "example-schema",
      fileNamePrefix: "schema"
    };

    checker(list);

    await delay(100); // await the files are flushed
    const files = fs.readdirSync(`${constants.ROOT_DIR}/${list.dir}`);
    expect(files).toEqual(expect.arrayContaining([expect.any(String)]));

    rimraf.sync(constants.ROOT_DIR);
  });
  // test con singola opzione
  // test con multipla opzione
  // test con diversa rootDir
  // test con opzione e diversa fileNamePrefix
  // test con lettura iniziale (deve creare file e cartelle)
  // test con stesso contenuto riletto (non deve creare nuovi file)
  // test con contenuto modificto (deve creare niovi file e deve creare l'html)
});
