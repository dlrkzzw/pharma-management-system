# Git 分支管理工作流程

## 🌳 分支策略

### 主要分支
- **main/master** - 生产环境分支，始终保持稳定
- **develop** - 开发分支，集成最新功能
- **feature/** - 功能分支，开发新功能
- **hotfix/** - 热修复分支，紧急修复生产问题
- **release/** - 发布分支，准备新版本发布

## 🔄 常用Git命令

### 基础操作
```bash
# 查看当前状态
git status

# 查看分支
git branch -a

# 查看提交历史
git log --oneline --graph

# 查看标签
git tag
```

### 分支操作
```bash
# 创建并切换到新分支
git checkout -b feature/new-feature

# 切换分支
git checkout main
git checkout develop

# 合并分支
git merge feature/new-feature

# 删除分支
git branch -d feature/new-feature
```

### 版本标签
```bash
# 创建标签
git tag -a v1.1.0 -m "Version 1.1.0 description"

# 推送标签到远程
git push origin v1.1.0

# 推送所有标签
git push origin --tags

# 查看标签信息
git show v1.0.0
```

## 🚀 开发工作流程

### 1. 开发新功能
```bash
# 从main分支创建功能分支
git checkout main
git pull origin main
git checkout -b feature/user-authentication

# 开发完成后提交
git add .
git commit -m "✨ Add user authentication system"

# 推送到远程
git push origin feature/user-authentication
```

### 2. 发布新版本
```bash
# 创建发布分支
git checkout develop
git checkout -b release/v1.1.0

# 完成发布准备后合并到main
git checkout main
git merge release/v1.1.0

# 创建版本标签
git tag -a v1.1.0 -m "Version 1.1.0: Add user authentication"

# 推送到远程
git push origin main
git push origin v1.1.0
```

### 3. 紧急修复
```bash
# 从main创建热修复分支
git checkout main
git checkout -b hotfix/critical-bug-fix

# 修复完成后合并回main和develop
git checkout main
git merge hotfix/critical-bug-fix
git checkout develop
git merge hotfix/critical-bug-fix

# 创建补丁版本标签
git tag -a v1.0.1 -m "Version 1.0.1: Critical bug fix"
```

## 📝 提交信息规范

### 提交类型
- `✨ feat:` 新功能
- `🐛 fix:` 修复bug
- `📚 docs:` 文档更新
- `💄 style:` 代码格式化
- `♻️ refactor:` 代码重构
- `⚡ perf:` 性能优化
- `✅ test:` 添加测试
- `🔧 chore:` 构建过程或辅助工具的变动

### 示例
```bash
git commit -m "✨ feat: add user login functionality"
git commit -m "🐛 fix: resolve database connection issue"
git commit -m "📚 docs: update API documentation"
```

## 🔄 版本号规范 (Semantic Versioning)

### 格式: MAJOR.MINOR.PATCH
- **MAJOR** (主版本号): 不兼容的API修改
- **MINOR** (次版本号): 向下兼容的功能性新增
- **PATCH** (修订号): 向下兼容的问题修正

### 示例
- `v1.0.0` - 初始版本
- `v1.1.0` - 添加新功能
- `v1.1.1` - 修复bug
- `v2.0.0` - 重大更新，可能不向下兼容

## 🛡️ 最佳实践

1. **频繁提交** - 小而频繁的提交比大的提交更好
2. **清晰的提交信息** - 描述做了什么和为什么
3. **分支命名规范** - 使用有意义的分支名称
4. **代码审查** - 使用Pull Request进行代码审查
5. **保持main分支稳定** - 只有经过测试的代码才能合并到main
6. **定期同步** - 经常从远程仓库拉取最新代码

## 🔧 有用的Git配置

```bash
# 设置默认编辑器
git config --global core.editor "code --wait"

# 设置别名
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit

# 设置自动换行处理
git config --global core.autocrlf true  # Windows
git config --global core.autocrlf input # Mac/Linux
```
