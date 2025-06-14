# 数据库
  - mysql 8

### 设置远程连接
  - 数据库层
    - ``` create user 'root'@'%' identified by '密码'; ```
    - ``` grant all privileges on *.* to 'root'@'%' with grant option; ```
    - ``` flush privileges; ```
  - 系统层
    - 关闭防火墙 ``` sudo ufw disable ```
  - 云主机服务层
    - 阿里云主机
      - 进入实例
      - 进入 安全组
      - 点击 配置规则
      - 点击 快速添加 选择 MySQL (3306)


## 一些重要原则

- 过早优化乃万恶之源

如果没有办法量化性能，就不要尝试优化性能

- 开发效率 > 可读性 > 运行效率

- 可用性 > 易用性 > 美观

- 永远不要删除数据（敏感数据除外）

尽量软删除，删除前确认
