require('colors');
var Diff = require('diff');
const execSync = require('child_process').execSync;
const axios = require('axios');
const fs = require('fs');

const getArchiveDirNameName = (option) => option.dir || "history";
const getFileName = (option) => option.baseFileName || option.url;


const checkChanges = (options) => {
  if(!Array.isArray(options)) {
    options = [options];
  }

  options.forEach(async (o) => {
    const dName = getArchiveDirNameName(o);
    const fName = getFileName(o);

    // creates the dir if not exists
    execSync(`mkdir -p ${dName}/${fName}`);

    // reads all the previous saved files
    let files = fs.readdirSync(`./${dName}/${fName}/`).filter(name => !name.endsWith('.html'));
    files = files.sort();
    let lastFile
    if(files.length) {
      lastFile = fs.readFileSync(`${dName}/${fName}/${files[files.length - 1]}`);
      lastFile = String(lastFile);
    }

    // scrapes the content
    const response = await axios.get(o.url);
    const newFile = response.data;

    // saves the file
    const newFileName = `${dName}/${fName}/${fName}-${Date.now()}`;
    if(!lastFile)
      fs.writeFileSync(newFileName, newFile);

    // @see https://github.com/kpdecker/jsdiff
    if(lastFile) {
      // compare the files
      const diff = Diff.diffLines(lastFile, newFile);

      if(diff.length) {
        const parts = [];
        let htmlContent = '';
        let somethingChanged = false;
        diff.forEach(function(part){
          // green for additions, red for deletions
          // grpaey for common parts
          let print = part.added || part.removed;
          var color = part.added ? 'green' :
            part.removed ? 'red' : 'grey';
          print && process.stderr.write(part.value[color]);
          somethingChanged = somethingChanged || print;
          parts.push(part);

          htmlContent += `<span style="background-color:${print ? color : ''};color:${print ? 'white' : ''};">${part.value}</span>`;
        });

        if(somethingChanged) {
          fs.writeFileSync(newFileName, newFile);

          const htmlTemplate = `
          <html>
            <body>
              <pre>
                ${htmlContent}
              </pre>
            </body>
          </html>
          `;

          fs.writeFileSync(`${newFileName}.html`, htmlTemplate);
        }
      }
    }
  });
};

module.exports = checkChanges;
