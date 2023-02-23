# 在 Command Line Tool 中练习基础语法

## 使用案例

实现一个猜数字游戏

## Xcode

学习时所用 Xcode 版本为 12.4

1. create a new Xcode project
2. 在 macOS tab 页中选择 Command Line Tool; next
3. Product Name 中输入项目名称; Language 选 Objective-C; next

## 代码

```
// 引用基础框架
#import <Foundation/Foundation.h>

// 声明 main 函数 int 表示返回值为 int
int main(int argc, const char * argv[]) {
    // autorelease pool 自动释放池 内存管理函数
    @autoreleasepool {
        int answer = 0;
        int guess = 0;
        int turn = 0;

        // arc4random 随机数 1~1228691167
        answer = arc4random() % 100 + 1;
        
        // while 循环
        while(guess != answer){
            turn++;

            // NSLog 函数类似 console.log
            // @"" 表示字符串
            // %i 占位，依次取字符串后面的变量
            // %i int
            // %f float
            // %c char
            NSLog(@"次数 #%i: Enter a number between 1 and 100",turn);

            // 输入赋值
            scanf("%i",&guess);

            if(guess > answer){
                NSLog(@"大了");
            }else if(guess < answer){
                NSLog(@"小了");
            }else {
                NSLog(@"正确 %i",answer);
            }
        }

        NSLog(@"%i 次成功",turn);
    }
    return 0;
}

// 点击运行后，main 函数会直接运行
// 函数结尾 "}" 后面不需要 ";"
// 普通语句结尾需要 ";"

```
