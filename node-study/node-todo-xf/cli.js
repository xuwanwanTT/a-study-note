#!/usr/bin/env node

const { Command } = require('commander');
const api = require('./index.js');

const program = new Command();

program
  .version('0.0.1');

program
  .command('add')
  .argument('<arg...>')
  .description('new todo')
  .action((arg) => {
    const worlds = arg.join(' ');
    api.add(worlds);
  });

program
  .command('clear')
  .description('clear all todo')
  .action(() => {
    api.clear();
  });

program
  .command('ls')
  .description('show all')
  .action(() => {
    api.showAll();
  });

program.parse(process.argv);
