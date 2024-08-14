const fs = require('fs');
const p = require('path');

const home = process.env.home || require('os').homedir();
const dbPath = p.join(home, '.todo');

const db = {
  read(path = dbPath) {
    return new Promise((resolve, reject) => {
      fs.readFile(path, { flag: 'a+' }, (error, data) => {
        if (error) {
          return reject(error);
        }
        let list;
        try {
          list = JSON.parse(data);
        } catch (err) {
          list = [];
        }
        resolve(list);
      })
    })
  },

  write(list, path = dbPath) {
    const string = JSON.stringify(list);

    return new Promise((resolve, reject) => {
      fs.writeFile(path, string, (error) => {
        if (error) {
          return reject(error);
        }
        resolve();
      })
    })
  }
};

module.exports = db;
