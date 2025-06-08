# 学习写一个命令行todo小工具

### 使用方法

安装

``` npm install --global node-todo-xf ```

新增

``` t add task ```

查看列表并操作

``` t ls ```

清空列表

``` t clear ```

### 学习笔记

使用 node 版本 v20.16.0

#### 数据存储

使用 fs 库（ ``` const fs = require('fs'); ``` ），在本地写入文件，进行数据存储。

主要 api 有 fs.readFile 和 fs.writeFile，其中 readFile 可传入参数 { flag: 'a+' }，以便在文件不存在的时候自动创建。

文件被保存在用户主目录下，用 ``` require('os').homedir() ``` 获取，有的用户可能会改变主目录位置，用 ``` process.env.home ``` 获取。

路径拼接需要用到 path 库（ ``` const p = require('path'); ``` ），保证在 windows 系统下和 linux 系统下都表现正常。


#### 获取指令

使用 commander 库，可以获取到用户在命令行中输入的指令并在回调函数中进行后续处理。

使用 @inquirer/prompts 库，可以让用户在命令行进行输入和选择操作。


#### 功能分析

首先需要展示列表，其次在列表中可以进行新增操作。

对于每一项，可以进行标记完成、标记未完成、修改和删除操作。

并且在每一步需要有退出操作。


#### 发布 npm

在 package.json 中添加配置，添加 ``` "bin":{"t": "cli.js"} ```，这样可以在命令行中使用 t 进行工具的使用；添加 ``` "files":["*.js"] ```，表示需要上传所有的 js 文件，package.json 和 README.md 这两个文件默认会被上传。

由于需要让用户执行 cli.js 文件中的命令，在 cli.js 文件的第一行需要添加 shebang ``` #!/usr/bin/env node ```，还要给文件添加可执行权限，``` chmod +x cli.js ```

npm 切换到官方源，这里使用工具 nrm，``` nrm use npm ```

登陆 npm ``` npm adduser ```，由于本地网络原因，设置了代理 ``` npm config set proxy=http:127.0.0.1:port ```

发布 npm ``` npm publish ```
