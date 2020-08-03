# ECMAScript 6

### let and const
  - 全局作用域 函数作用域 块级作用域
  - 块级作用域必须有大括号
  - 大括号写在行首, js 会将其解释为代码块, 可用小括号避免
  - Object.freeze() 冻结对象
  - ```
    function freeze(obj){
      Object.freeze(obj);
      Object.keys(obj).forEach(s=>{
        if(typeof obj[s] === 'object') freeze(obj[s]);
      })
    } 
    ```

### 解构赋值
  - 按照一定模式，从数组和对象中提取值，对变量进行赋值
  - 等号右边的值不是对象或数组，就先将其转为对象
  - 数组结构 按位置
  - 对象结构 同属性名

### 字符串
  - string.includes(xx) 是否包含 xx
  - string.startsWith(xx) 是否以 xx 开始
  - string.endsWith(xx) 是否以 xx 结束
  - string.repeat(n) 重复 n 次, 不改变原字符串
  - string.padStart(len,xx) 字符串从开头以 xx 补全总长度到 len, 不改变原字符串
  - string.padEnd(len,xx) 字符串在结尾以 xx 补全总长度到 len, 不改变原字符串
  - string.trimStart() 移除字符串头部空格, 不改变原字符串
  - string.trimEnd() 移除字符串尾部空格, 不改变原字符串
  - string.trim() 移除字符串首尾空格, 不改变原字符串

### 数值
  - JavaScript 能够准确表示的整数范围在-2^53到2^53之间(不含两个端点)
  - bigint 数据类型
  - Number.isNaN, Number.isFinite() 仅检测数字类型
  - Number.parseInt(), Number.parseFloat() 行为不变
  - Number.isInteger(n) 判断 n 是否为整数, 使用时需考虑精度影响
  - Number.EPSILON 一个极小的常量, 可用于误差
  - Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER 能精确表示的最大最小整数
  - Number.isSafeInteger(n) 判断 n 是否落在最大最小范围
  - Math.sign() 判断 正数 负数 0
  - Math.cbrt() 立方根
  - Math.hypot(a,b,c,...) 所有参数的平方和的平方根。

### 函数
  - length 函数预期传入的参数个数, 若某个参数指定默认值, 则只计算改参数之前的参数个数
  - name 函数名(f.name // 'f')

### 数组

### 对象

### symbol

### Set 和 Map 数据结构
  - new Set()
  - new Map() size set get has delete clear keys values entries forEach
  - Map 提供 值-值 对的对象
  - 任何具有 Iterator 接口、且每个成员都是一个双元素的数组的数据结构都可以当作 Map 构造函数的参数
