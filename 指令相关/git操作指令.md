#### 查看 gitlab 版本
  cat /路径/gitlab-rails/VERSION

#### 设置公钥
ssh-keygen -t rsa -C "your_email@example.com"
ssh-keygen -t rsa -C "xuwanwan@outlook.com"

### git 版本回退
 - ``` git reflog ``` 查看当前所有commit
 - ``` git reset --hard HEAD@{n} ``` 回退到指定版本, 其中 HEAD@{n} 需查看 log 写入对应的值

### git commit 撤回
 - ``` git reset --soft HEAD^ ```
  - --soft 不删除工作空间的改动代码, 仅撤销 commit，不撤销 git add file
  - --hard 回退到指定版本, 会删除工作空间的改动代码, 撤销 commit 且撤销 add

