#### 连接数据库
  - ``` mysql -u root -p ```
  - ``` mysql -hip地址 -P 端口号 -u 用户名 -p密码 ```
    - -h 后面直接写 IP 地址, 不要空格
    - -p 后面直接写密码, 不要空格; 否则无效, 需要重新输一遍密码
    - -P 默认端口 3306 一般可以不写

#### 创建数据库
  - ``` CREATE DATABASE 数据库名称 DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_general_ci; ```

#### 基础操作
  - ``` use database; ```
  - ``` show tables; ```

#### 导入 sql 文件
  - source 文件路径

#### 库名中有短横线的时候用 ``
  - `db-xxx`
