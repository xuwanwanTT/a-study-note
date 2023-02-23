#### 查看 gitlab 版本
  cat /路径/gitlab-rails/VERSION

#### 设置公钥
ssh-keygen -t rsa -C "your_email@example.com"
ssh-keygen -t rsa -C "xuwanwan@outlook.com"

### git 版本回退
 - ``` git reflog ``` 查看当前所有commit
 - ``` git reset --hard HEAD@{n} ``` 回退到指定版本, 其中 HEAD@{n} 需查看 log 写入对应的值
 - ``` git log --oneline ```
 - ``` git reset --hard xxx ``` 回退到指定版本, 其中 xxx 需查看 log 写入对应的值

### git commit 撤回
 - ``` git reset --soft HEAD^ ```
  - --soft 不删除工作空间的改动代码, 仅撤销 commit，不撤销 git add file
  - --hard 回退到指定版本, 会删除工作空间的改动代码, 撤销 commit 且撤销 add

### 合并分支
  - ``` git checkout 分支A ``` 切换到目标分支
  - ``` git merge 分支B ``` 将分支B合并到分支A
  - 处理冲突
  - commit
  - push

### 报错 SSL: no alternative certificate subject name matches target host name 'github.com'
  - ``` git comfig --global http.sslVerify false ``` 让 git 忽略 ssl 证书错误

### 创建分支
  - ``` git checkout -b 分支名称 ``` 从当前分支切换新分支
  - ``` git push --set-upstream origin 分支名称 ``` 提交到远程

### tag
  - ``` git tag ``` 查看已有 tag
  - ``` git tag -a 名称 ``` 创建
  - ``` git push --tags ``` 提交
