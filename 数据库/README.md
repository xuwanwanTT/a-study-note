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
