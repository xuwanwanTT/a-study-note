const db = require('./db.js');
const { select, input } = require('@inquirer/prompts');

module.exports.add = async (title) => {
  // 读取数据
  const list = await db.read();

  // 处理数据
  list.push({ title, done: false });

  // 写入数据
  await db.write(list);
}

module.exports.clear = async () => {
  await db.write([]);
}

const markAsDone = async (list, index) => {
  list[index].done = true;
  await db.write(list);
};

const markAsUndone = async (list, index) => {
  list[index].done = false;
  await db.write(list);
};

const updateTitle = async (list, index) => {
  const inputTitle = await input({ message: '请输入新的任务', default: list[index].title });
  list[index].title = inputTitle;
  await db.write(list);
};

const remove = async (list, index) => {
  list.splice(index, 1);
  await db.write(list);
};

const askForAction = async (list, index) => {
  const actionFns = { markAsDone, markAsUndone, updateTitle, remove };

  const action = await select({
    message: '请选择操作',
    choices: [
      { name: '退出', value: 'quite' },
      { name: '已完成', value: 'markAsDone' },
      { name: '未完成', value: 'markAsUndone' },
      { name: '改标题', value: 'updateTitle' },
      { name: '删除', value: 'remove' },
    ]
  });

  const fn = actionFns[action];
  fn && fn(list, index);
};

const askForAddTask = async (list) => {
  const inputAdd = await input({ message: '输入任务名称' });
  list.push({ title: inputAdd, done: false });
  await db.write(list);
};

const printTasks = async (list) => {
  const index = await select({
    message: '请选择你要操作的任务',
    choices: [
      { name: '退出', value: -1 },
      ...list.map((item, index) => {
        return {
          name: `${item.done ? '[x]' : '[_]'} ${index + 1} - ${item.title}`,
          value: index,
        };
      }),
      { name: '创建任务', value: -2 }
    ],
  });

  if (index === -1) {
    return false;
  } else if (index === -2) {
    askForAddTask(list);
  } else {
    askForAction(list, index);
  }
};

module.exports.showAll = async () => {
  const list = await db.read();

  printTasks(list);
};
