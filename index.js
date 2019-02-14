require("colors");
var Diff = require("diff");
const execSync = require("child_process").execSync;
const axios = require("axios");
const fs = require("fs");
const constants = require("./constants");

/** A callback that returns a promise resolving with a {data} object (like Axios does)
 * @name AxiosPromiseCallback
 * @function
 * @param {String} url Description
 * @returns {Promise} Promise that resolves with {data}
 */

/**
 * Scrape an online resource and compare it with the latest scrape result
 *
 * @param {Object|Object[]} list - a list of items (or a single item) to scrape and compare
 * @param {string} list[].url - the url of the resource to be fetched, it will be called with `Axios.get`
 * @param {string} list[].dir - the name of the directory where the different files are stored
 * @param {string=constants.FILE_NAME_PREFIX} list[].fileNamePrefix - the prefix for the name of every file
 * @param {AxiosPromiseCallback=undefined} list[].resourceReader - a promise that reads the remote resource and resolves with {data} (like Axios does)
 * @param {Object={}} options - some global options
 * @param {string=constants.ROOT_DIR} options.rootDir - all the files will be stored in this directory
 * @see https://github.com/axios/axios
 */
const checkChanges = (list = [], { rootDir = constants.ROOT_DIR } = {}) => {
  // list must be an array
  if (!Array.isArray(list)) {
    list = [list];
  }

  // mandatory input checks
  list.forEach(({ url, dir }) => {
    if (!url) {
      throw new Error("Missing URL");
    }
    if (!dir) {
      throw new Error("Missing directory");
    }
  });

  list.forEach(
    async ({
      url,
      dir,
      fileNamePrefix = constants.FILE_NAME_PREFIX,
      resourceReader = undefined
    }) => {
      const containingDir = `${rootDir}/${dir}`;

      // creates the dir if not exists
      // @see https://stackoverflow.com/a/48436466/700707
      !fs.existsSync(rootDir) && fs.mkdirSync(rootDir);
      !fs.existsSync(containingDir) && fs.mkdirSync(containingDir);

      // reads all the previous saved files...
      let files = fs
        .readdirSync(`./${containingDir}/`)
        .filter(name => name.startsWith(fileNamePrefix) && !name.endsWith(".html"));
      // ... and sort it by name, the goal is to retrieve the latest saved file
      files = files.sort();

      let latestContent;
      if (files.length) {
        latestContent = String(fs.readFileSync(`${containingDir}/${files[files.length - 1]}`));
      }

      let readerPromise;
      if (resourceReader) {
        readerPromise = resourceReader(url);
      } else {
        readerPromise = axios.get(url, {
          // it always needs to be text, a JSON response mustn't be parsed by Axios
          // @see https://github.com/axios/axios/issues/907#issuecomment-373988087
          transformResponse: undefined
        });
      }
      // scrapes the content
      const newContent = (await readerPromise).data;

      const newFileName = `${rootDir}/${dir}/${fileNamePrefix}-${Date.now()}`;

      // saves the file if there isn't a previous one
      if (!latestContent) {
        fs.writeFileSync(newFileName, newContent);
      } else {
        // compare the files
        // @see https://github.com/kpdecker/jsdiff
        const diff = Diff.diffLines(latestContent, newContent);

        if (diff.length) {
          let htmlContent = "";
          let somethingChanged = false;

          console.log("------------------------");
          process.stderr.write(`${dir}/${fileNamePrefix} (${url})`);
          console.log("");
          diff.forEach(function(part) {
            let isAChange = part.added || part.removed;
            let color;

            if (isAChange) {
              somethingChanged = true;

              color = part.added ? "green" : "red";

              // prints a visual
              process.stderr.write(part.value[color]);
            }

            htmlContent += `<span style="background-color:${isAChange ? color : ""};color:${
              isAChange ? "white" : ""
            };">${part.value}</span>`;
          });

          if (somethingChanged) {
            // saves the new file
            fs.writeFileSync(newFileName, newContent);
            // saves an visual version of the differences
            fs.writeFileSync(
              `${newFileName}.html`,
              `<html><body><pre>${htmlContent}</pre></body></html>`
            );
          } else {
            console.log("Nothing changed");
          }
        }
      }
    }
  );
};

module.exports = checkChanges;
