class MyFunction {
  // 千分符
  thsMark(num) {
    if (Number(num) != num) { console.warn('请输入"数字"'); return num; }
    let str = num.toString();
    let arr = str.split('.');
    let res = arr[0].toString().replace(/(\d{1,3})(?=(\d{3})+$)/g, '$1,');
    if (arr[1]) {
      res += '.' + arr[1];
    }
    return res;
  }
}