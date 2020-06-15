/**
 * EventHub
 * 目的: 多个模块之间通讯
 * 发布/订阅模式
 */

class EventHub {

  private cache: { [key: string]: Array<(data: unknown) => void> } = {}; // {'name1':[fn1, fn2]}

  on(eventName: string, fn: (data?: unknown) => void) {
    // 存 fn
    this.cache[eventName] ? this.cache[eventName].push(fn) : this.cache[eventName] = [fn];
  }

  emit(eventName: string, data?: unknown) {
    // 找 fn
    let array = this.cache[eventName];
    if (!array) return false;
    array.forEach(fn => fn(data));
  }

  off(eventName: string, fn: (data?: unknown) => void) {
    // 删 fn
    let array = this.cache[eventName] || [];
    let index = array.indexOf(fn);
    if (index === undefined) return false;
    array.splice(index, 1);
  }
};

export default EventHub;

/**
 * 辅助函数 indexOf
 * @param arr
 * @param item
 */

function indexOf(arr, item) {
  let index = -1;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === item) index = i;
  }
  return index;
}
