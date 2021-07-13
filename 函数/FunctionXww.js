/**
 * 四舍五入
 * @param {number} number 需要计算的数字
 * @param {number} precision 负数表示小数点前 N 位; 正数表示小数点后 N 位
 * @returns 
 */
const round = (number, precision) => {
  if (Number(num) != num || Number(precision) != precision) { console.warn('请输入"数字"'); return num; }
  let temp1 = Math.round(+number + 'e' + precision);
  let temp2 = Math.pow(10, Math.abs(precision));
  return precision > 0 ? temp1 / temp2 : temp1 * temp2;
}

/**
 * 千分符
 * @param {number} num 需要分隔的数字
 * @param {number} len 可选 分隔间隔 默认为3
 * @param {any} symbol 可选 分隔符号 默认为 ","
 * @returns 
 */
const thsMark = (num, len = 3, symbol = ',') => {
  if (Number(num) != num) { console.warn('请输入"数字"'); return num; }
  let str = num.toString();
  let arr = str.split('.');
  let reg = new RegExp(`(\\d{1,${len}})(?=(\\d{${len}})+$)`, 'g');
  let res = arr[0].toString().replace(reg, `$1${symbol}`);
  if (arr[1]) {
    res += '.' + arr[1];
  }
  return res;
}

/**
 * uuid
 * @param {number} a 
 * @returns 
 */
const uuid = (a) => { return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuid) };


export { round, thsMark, uuid };