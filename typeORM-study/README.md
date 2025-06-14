# TypeORM 数据库实践

安装docker

在 docker 中运行 postgres

``` docker run -v "$PWD/blog-data":/var/lib/postgresql/data -p 5432:5432 -e POSTGRES_USER=blog -e POSTGRES_HOST_AUTH_METHOD=trust -d postgres:12.2 ```

如果需要设置密码
``` docker run -v "$PWD/blog-data":/var/lib/postgresql/data -p 5432:5432 -e POSTGRES_USER=blog -e POSTGRES_PASSWORD=123456 -d postgres:12.2 ```

查看运行情况

``` docker ps -a ```

得到结果

CONTAINER ID 4999c0a2f12f
IMAGE        postgres:12.2
STATUS       up
...

进入 postgres

``` docker exec -it 499 bash``` 499 为容器 ID

``` psql -U blog ```

``` \l ``` list databases
``` \c ``` connect to a database
``` \dt ``` display tables
``` \d xxx``` 查看表中的column

创建数据库

分别创建 blog_development blog_test blog_production

``` CREATE DATABASE XXX ENCODING 'UTF8' LC_COLLATE 'en_US.utf8' LC_CTYPE 'en_US.utf8'; ```


``` npx babel ./src --out-dir dist --extensions ".ts,.tsx" ```
