#### 查看 gitlab 版本
  cat /路径/gitlab-rails/VERSION

#### 设置公钥
ssh-keygen -t rsa -C "your_email@example.com"
ssh-keygen -t rsa -C "xuwanwan@outlook.com"

### git 回退上一次的commit
git reset --soft HEAD^
–soft
不删除工作空间的改动代码 ，撤销commit，不撤销git add file

–hard
删除工作空间的改动代码，撤销commit且撤销add
