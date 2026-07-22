# CineAI 部署操作指南

> 将 cineai/ 部署到 GitHub → Vercel → 绑定自定义域名

---

## 📋 前置准备

在开始之前，请确保你拥有：
1. **GitHub 账号** — 访问 [github.com](https://github.com) 注册
2. **Vercel 账号** — 访问 [vercel.com](https://vercel.com) 用 GitHub 登录
3. **自定义域名**（可选）— 如 `cineai.ai`、`cineai.cn` 等

---

## 步骤一：上传到 GitHub（3种方式）

### 方式 A：通过 GitHub 网页上传（无需 Git，推荐新手）

```
1. 浏览器打开 https://github.com/new
2. 仓库名输入 cineai
3. 选择 Public（公开）
4. 勾选 "Add a README file" → 点击 Create repository
5. 进入仓库后，点击 "Add file" → "Upload files"
6. 将 cineai/ 目录下的所有文件拖入上传区：
   ├── index.html
   ├── create.html
   ├── pricing.html
   ├── about.html
   ├── css/style.css
   ├── js/main.js
   └── README.md
7. 滚动到底部，填写提交信息 "Initial commit"
8. 点击 "Commit changes"
```

### 方式 B：通过 Git 命令行（需要本地安装 Git）

```bash
# 1. 安装 Git（如未安装）
# Windows: https://git-scm.com/download/win
# macOS:   brew install git
# Linux:   sudo apt install git

# 2. 配置 Git
git config --global user.name "你的GitHub用户名"
git config --global user.email "你的邮箱@example.com"

# 3. 进入项目目录
cd 你的电脑上的/cineai路径

# 4. 初始化并推送
git init
git add .
git commit -m "Initial commit: CineAI AI视频创作平台"

# 5. 连接 GitHub 仓库
# 先在 https://github.com/new 创建同名空仓库（不勾选 README）
git remote add origin https://github.com/你的用户名/cineai.git
git branch -M main
git push -u origin main
```

### 方式 C：通过 GitHub CLI（需要安装 gh）

```bash
# 1. 安装 GitHub CLI: https://cli.github.com/
# 2. 登录
gh auth login

# 3. 在 cineai 目录下执行
cd 你的电脑上的/cineai路径
git init
git add .
git commit -m "Initial commit"
gh repo create cineai --public --push --source=.
```

---

## 步骤二：导入到 Vercel 部署

```
1. 浏览器打开 https://vercel.com/new
2. 点击 "Import Git Repository"
3. 找到并选择你刚创建的 cineai 仓库
4. 配置：
   ├── Framework Preset: Other（静态网站无需框架）
   ├── Root Directory: ./（保持默认）
   └── Build and Output Settings: 保持默认（无需构建）
5. 点击 "Deploy" 按钮
```

**等待约 1 分钟**，Vercel 会自动完成部署。

部署成功后你会看到：
```
🎉  Congratulations! Your project has been deployed.
    https://cineai-xxxxx.vercel.app  ← 自动分配的预览域名
```

---

## 步骤三：绑定自定义域名（如 cineai.ai）

### 3.1 购买域名

| 平台 | 推荐域名 | 说明 |
|------|---------|------|
| [阿里云万网](https://wanwang.aliyun.com) | cineai.cn | 国内需备案 |
| [Namecheap](https://namecheap.com) | cineai.ai | 国际免备案 |
| [Cloudflare Registrar](https://cloudflare.com/products/registrar) | cineai.ai/.video | 成本价 |
| [GoDaddy](https://godaddy.com) | cineai.io | 国际免备案 |

### 3.2 在 Vercel 绑定域名

```
1. 打开 Vercel Dashboard → 选择 cineai 项目
2. 点击 Settings → Domains
3. 在输入框中输入你的域名（如 cineai.ai）
4. 点击 "Add" 按钮
5. Vercel 会给出 DNS 配置指导
```

### 3.3 配置 DNS 记录

在域名管理后台添加 DNS 记录（二选一）：

**方式 A：CNAME 别名（推荐）**

| 记录类型 | 主机记录 | 记录值 |
|---------|---------|--------|
| CNAME | @ | cname.vercel-dns.com |
| CNAME | www | cname.vercel-dns.com |

**方式 B：使用 Cloudflare（自带 CDN + SSL）**

```
1. 在 Cloudflare 添加你的域名
2. 将域名的 NS 记录改为 Cloudflare 的 DNS
3. 在 Cloudflare DNS 设置中：
   ├── 类型: CNAME
   ├── 名称: @
   ├── 目标: cname.vercel-dns.com
   └── Proxy status: Proxied（橙色云朵，开启 CDN）
```

### 3.4 等待生效

DNS 修改后通常 5-30 分钟生效。生效后访问你的域名即可看到 CineAI 网站。

---

## 步骤四：验证部署

### 4.1 功能验证

部署成功后，请测试以下功能：

```bash
# 使用 curl 测试首页响应
curl -I https://你的域名/

# 预期输出：HTTP/2 200
# 预期头部：x-vercel-cache: MISS/HIT
```

### 4.2 手动检查项

- [ ] 首页能正常打开，深色主题渲染正确
- [ ] 导航菜单可点击跳转到各页面
- [ ] 创作中心页面可交互（工具切换/滑块/生成按钮）
- [ ] 定价页面月付/年付切换正常
- [ ] 移动端响应式布局正常（浏览器调至手机尺寸）
- [ ] 所有页面 favicon 显示
- [ ] HTTPS 证书有效（浏览器地址栏显示🔒）

---

## 故障排除

### 问题：部署后页面空白

```
原因：Vercel 对纯静态站点需要配置
解决：在 Vercel 项目 Settings → General → Build & Development Settings
     → 将 Output Directory 设为 ./
     → 确认 Framework Preset 为 "Other"
     → Redeploy
```

### 问题：自定义域名无法访问

```
1. 确认 DNS 记录已生效：dig 你的域名 CNAME
2. 确认 Vercel Domains 设置中域名显示 "Valid"
3. 等待 DNS 缓存刷新（最长 48 小时）
4. 检查域名是否被墙（国际域名国内访问可能需要备案）
```

### 问题：GitHub 推送权限错误

```bash
# 错误：remote: Permission to user/repo denied
# 解决：使用 Personal Access Token 代替密码
# 在 https://github.com/settings/tokens 创建 token
git remote set-url origin https://TOKEN@github.com/你的用户名/cineai.git
git push -u origin main
```

---

## 架构图

```
用户浏览器
     ↓
https://cineai.ai（自定义域名）
     ↓
  Cloudflare DNS（CDN + DDoS防护）
     ↓
  Vercel Edge Network（全球加速）
     ↓
  静态文件（HTML/CSS/JS）
     ↓
  GitHub 仓库（原始代码）
```

---

## 后续扩展方案

如需添加后端功能：

```
用户 → Cloudflare CDN → Vercel (前端静态)
                     → 阿里云函数计算/腾讯云SCF (后端API)
                     → 自建GPU集群 / Runway API (视频生成)
                     → 数据库 (用户/作品管理)
```

---

*文档版本: 1.0 | 最后更新: 2026年7月*
