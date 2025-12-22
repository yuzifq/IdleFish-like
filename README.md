# 仿闲鱼二手交易首页  
Xianyu-like Second-hand Market Homepage

## 📌 项目简介 Project Overview

### 中文
本项目是一个仿「闲鱼」的二手交易网页首页，作为课程《高级网页设计》的课程实践项目。  
项目采用 **原生 HTML / CSS / JavaScript** 实现，不依赖任何前端框架，重点练习：

- 页面结构与布局设计  
- 原生 JS 数据驱动渲染  
- 前后端分离开发思维  
- Git 分支管理实践  

### EN
This project is a Xianyu-style second-hand trading homepage, developed as a practice project for the course **Advanced Web Design**.  
It is built with **pure HTML, CSS, and JavaScript**, without any frontend framework, focusing on:

- Page layout and structure design  
- Data-driven rendering using Vanilla JavaScript  
- Frontend–backend separation concepts  
- Git branch management practice  

---

## ✨ 功能特点 Features

### 中文
- 顶部导航栏与搜索框（支持热搜词）
- 左侧分类导航栏 + 右侧分类详情联动面板
- 首页 Banner / 轮播区域
- 分类推荐卡片展示区
- 商品信息流列表（瀑布流 / 信息流风格）
- 右侧悬浮工具栏（回到顶部等）
- 所有页面内容通过 **JSON 数据动态渲染**
- 使用 **json-server** 模拟后端接口，体验真实接口开发流程

### EN
- Top navigation bar and search box with hot keywords
- Left category sidebar with right-side detail panel
- Homepage banner / carousel area
- Category recommendation cards
- Feed-style goods list
- Right-side floating toolbar with “Back to Top”
- All contents are dynamically rendered from JSON data
- Uses `json-server` to simulate backend APIs

---

## 🛠 技术栈 Tech Stack

- HTML5  
- CSS3  
- Vanilla JavaScript (No framework)  
- JSON 数据驱动渲染  
- json-server（本地模拟后端接口）

---

## 📂 项目结构 Project Structure

```text
.
├── index.html              # 页面入口 / Main HTML entry
├── script.js               # 页面逻辑脚本（数据请求 + 渲染）
├── home.json               # 数据源（json-server 使用）
├── css/
│   ├── css.css             # 首页样式
│   ├── myself.css          # “我的”页面样式
│   └── myself_buy.css      # “我买到的”页面样式
└── images / fonts / icons  # 图片、字体等静态资源
🌱 分支说明 Branch Strategy （重要）
本项目使用 两个分支 来区分本地开发环境与服务器部署环境：

🔹 main（服务器端分支）
用于服务器部署

script.js 中接口地址为：

js
复制代码
const baseURL = '/api';
接口地址由服务器域名决定

🔹 localhost（本地开发分支）
用于本地开发与调试

script.js 中接口地址为：

js
复制代码
const baseURL = 'http://localhost:53000/api';
通过 json-server 在本地模拟接口

✅ localhost = 本地开发
✅ main = 服务器部署

▶️ 本地运行方式 Local Development
1️⃣ 安装 json-server（若未安装）
bash
复制代码
npm install -g json-server
2️⃣ 启动本地接口服务
在项目根目录运行：

bash
复制代码
json-server --watch home.json --port 53000 --routes routes.json
若未使用 routes.json：

bash
复制代码
json-server --watch home.json --port 53000
3️⃣ 切换到本地分支
bash
复制代码
git checkout localhost
4️⃣ 打开页面
推荐使用 Live Server

或直接双击 index.html

🚀 服务器部署说明 Deployment
bash
复制代码
git checkout main
git pull origin main
服务器需保证：

接口前缀：/api

接口数据结构与 home.json 保持一致

直接访问 index.html 即可。

⚠️ 注意事项 Notes
不要频繁合并 main 与 localhost 分支，避免接口地址相互覆盖

功能更新建议：

在一个分支完成开发

使用 git cherry-pick 同步到另一个分支

所有资源路径请使用 相对路径，确保本地与服务器环境兼容

🎓 课程说明 Course Info
课程名称：高级网页设计

项目类型：课程实践 / 展示项目

技术重点：

页面布局与样式设计

原生 JavaScript 数据驱动

前后端分离思想

Git 分支管理实践

📸 项目截图 Screenshots
<img width="2550" height="1243" alt="image" src="https://github.com/user-attachments/assets/70b30de9-8599-49aa-a6ad-fb2d70035487" />


md
复制代码
![](./screenshots/home.png)
📄 License
本项目仅用于学习与教学展示，不用于任何商业用途。
