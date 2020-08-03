const { program } = require('commander');
program.version('0.0.1');
const api = require('./index.js');

program
  .option('-x, --xxx', '描述')

program
  .command('add')
  .description('添加')
  .action((...args) => {
    let word = args[0].args.join(' ');
    api.add(word);
  });

program
  .command('clear')
  .description('清空')
  .action((...args) => {
    let word = args[0].args.join(' ');
    console.log(word);
  });


program.parse(process.argv);
