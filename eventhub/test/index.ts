import EventHub from '../src/index';

type TestCase = (message: string) => void;

const eventHub = new EventHub();

const test1: TestCase = message => {
  console.assert(eventHub instanceof Object === true, 'eventHub 是个对象');
  console.log(message);
};

const test2: TestCase = message => {
  // on emit
  let called = false;
  const f = s => {
    called = true;
    console.assert(s === 'hello world');
  };

  eventHub.on('xxx', f);

  eventHub.emit('xxx', 'hello world');

  eventHub.off('xxx', f);

  setTimeout(() => {
    console.assert(called === true);
    console.log(message);
  }, 1000);
};

const test3: TestCase = message => {
  const eventHub2 = new EventHub();

  let called = false;

  const f2 = s => {
    called = true;
    console.assert(s === 'hello world');
  };

  eventHub2.on('xxx', f2);

  eventHub2.off('xxx', f2);

  eventHub2.emit('xxx', 'hello world');

  setTimeout(() => {
    console.assert(called === false);
    console.log(message);
  }, 1000);

};

test1('EventHub 可以创建对象');
test2('on 之后，使用 emit 触发');
test3('off 有效');
