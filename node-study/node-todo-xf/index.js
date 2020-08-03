const homedir = require('os').homedir();
const home = process.env.HOME || homedir;
const path = require('path');
const fs = require('fs');
const dbPath = path.join(home, '.todo');

module.exports.add = (title) => {
  fs.readFile(dbPath, { flag: 'a+' }, (error, data) => {
    if (error) return false;
    let list;
    try {
      list = JSON.parse(data);
    } catch (error2) {
      list = [];
    }

    const task = { title, done: 'false' };
    list.push(task);
    const string = JSON.stringify(list);

    fs.writeFile(dbPath, string, (error3) => {
      if (error3) console.log(error3);
    });

  })
};

module.exports.clear = () => { };
