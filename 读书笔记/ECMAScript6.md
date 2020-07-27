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

### 结构赋值
  - 按照一定模式，从数组和对象中提取值，对变量进行赋值
  - 等号右边的值不是对象或数组，就先将其转为对象
  - 数组结构 按位置
  - 对象结构 同属性名
