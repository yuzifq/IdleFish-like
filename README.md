# 仿闲鱼二手交易首页 / Xianyu-like Second-hand Market Homepage

## 项目简介 Project Overview

- 中文：本项目是一个仿闲鱼的二手交易网页首页，主要用于课程《高级网页设计》的练习与展示。
- EN: This project is a Xianyu-style second-hand trading homepage, built as a practice and demo for the “Advanced Web Design” course.

---

## 功能特点 Features

- 中文：
  - 顶部导航栏与搜索框，支持热搜词展示
  - 左侧分类导航 + 右侧分类详情面板
  - 首页大横幅轮播区域
  - 分类推荐卡片区域
  - 商品信息流列表（瀑布流式布局风格）
  - 右侧悬浮工具条与回到顶部按钮
  - 所有文案、图片等均通过 `data.json` 动态渲染，方便配置

- EN:
  - Top navigation bar and search box with hot search keywords
  - Left category sidebar with right-side detail panel
  - Hero banner area
  - Category recommendation cards
  - Feed-style goods list section
  - Right floating toolbar with “back to top” button
  - All texts and images are rendered from `data.json` dynamically for easy configuration

---

## 技术栈 Tech Stack

- HTML5 + CSS3
- 原生 JavaScript（无框架）
- JSON 数据驱动页面渲染
- 可选：使用 `json-server` 模拟后端接口

---

## 项目结构 Project Structure

```text
.
├── index.html      # 页面入口 / Main HTML entry
├── css/
│   └── css.css     # 页面样式 / Styles
├── script.js       # 逻辑脚本，负责从接口加载数据并渲染 / Main JS logic
├── data.json       # 页面数据源 / Page data source
└── images / font … # 图片与图标资源 / Images & icons
