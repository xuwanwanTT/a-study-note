const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

const assert = chai.assert;

const deepClone = require('../src/index');

describe('deepClone', () => {
  it('是一个函数', () => {
    assert.isFunction(deepClone);
  });

  it('能够复制基本类型', () => {
    const t = 123;
    const ct = deepClone(t);
    assert(t === ct);

    const t1 = 'abc';
    const ct1 = deepClone(t1);
    assert(t1 === ct1);

    const t2 = true;
    const ct2 = deepClone(t2);
    assert(t2 === ct2);

    const t3 = undefined;
    const ct3 = deepClone(t3);
    assert(t3 === ct3);

    const t4 = null;
    const ct4 = deepClone(t4);
    assert(t4 === ct4);

  });

  describe('对象', () => {
    it('能够复制普通对象', () => {
      const a = { name: 'aaa', child: { name: 'bbb' } };
      const ca = deepClone(a);
      assert(a !== ca);
      assert(a.name === ca.name);
      assert(a.child !== ca.child);
      assert(a.child.name === ca.child.name);
    });

    it('能够复制数组对象', () => {
      const t = [[11, 12], [21, 22], [31, 32]];
      const ct = deepClone(t);
      assert(t !== ct);
      assert(t[0] !== ct[0]);
      assert(t[1] !== ct[1]);
      assert(t[2] !== ct[2]);
      assert(t[0][0] === ct[0][0]);
      assert(t[0][1] === ct[0][1]);
      assert(t[1][0] === ct[1][0]);
      assert(t[1][1] === ct[1][1]);
      assert(t[2][0] === ct[2][0]);
      assert(t[2][1] === ct[2][1]);
    });

    it('能够复制函数', () => {
      const t = function () {
        return 1;
      };
      t.xxx = { yyy: { zzz: '000' } };
      const ct = deepClone(t);
      assert(t !== ct);
      assert(t.xxx !== ct.xxx);
      assert(t.xxx.yyy !== ct.xxx.yyy);
      assert(t.xxx.yyy.zzz === ct.xxx.yyy.zzz);
      assert(t() === ct());
    });

    it('能够复制数组对象', () => { });
    it('能够复制数组对象', () => { });
    it('能够复制数组对象', () => { });
  });


});
