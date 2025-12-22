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
```

分支说明 Branch Strategy
==============================

main（服务器端分支）
- 用于服务器部署
- 接口地址：/api

localhost（本地开发分支）
- 用于本地开发调试
- 接口地址：http://localhost:53000/api

localhost = 本地开发
main = 服务器部署


本地运行方式 Local Development
==============================

1. 安装 json-server
npm install -g json-server

2. 启动本地接口
json-server --watch home.json --port 53000

3. 切换分支
git checkout localhost

4. 打开 index.html（推荐 Live Server）


服务器部署 Deployment
==============================

git checkout main
git pull origin main


说明
==============================

本项目仅用于学习与教学展示，不用于商业用途。
