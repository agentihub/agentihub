# Agent iHub

[English](readme.md) · 中文

Agent iHub是一个AI Agent创作、分享平台，旨在帮助用户快速智能地创作、分享和部署和AI Agent应用程序。它支持多种来源agent的导入导出，包括agent配置、大模型配置、知识库、工具等内容，提供了Web端后端服务，适用于各种不同的应用场景。

## 程序说明

- [Web端](agent_ihub_web/README_CN.md)
- [后端](agent_ihub_backend/README_zh.md)

## 特性

### 1. 用户
- 用户注册、登录、修改密码、修改用户信息
- 用户最新动态
- 个人中心
  - 粉丝与关注用户
    - 粉丝数统计
    - 关注人数统计
    - 粉丝搜索（粉丝昵称、用户名）
    - 关注、取消关注
    - 关注用户搜索（关注用户昵称、用户名）
- 个人概览
  - 受欢迎的agent
  - 最近的操作（用户最新动态）


### 2. Agent
- agent常规设置（名称、所属平台、描述、可见性等）
- 我的agent列表及查询，详细展示
- 热门agent
- 收藏agent
- Fork agent
- 导入导出agent
  - 包括agent配置、大模型配置、知识库、工具等内容
  - 支持单或多agent
- 创建、修改agent
  - 相似agent推荐
  - 支持单或多agent
  - 支持工具、知识库文档上传，删除
  - 普通用户可使用智能copilot创建和修改agent
  - 专家用户可直接修改描述文件(hub_agent.md)来创建修改agent

## 快速开始

### 1. 最低配置

开始使用AgentIhub之前, 建议您的机器满足以下最低系统要求:

>- CPU >= 4 Core
>- RAM >= 10 GiB
>- Hard disk >= 256GB(推荐SSD)

### 2. 环境准备
- 数据库：mongodb(4.4+), redis(6.0+)
- 向量数据库：milvus(2.5+)
- 开发环境
  - web: nodejs(18.0+)
  - backend: java(17.0+)

### 3. 构建和运行
- web端：请参考 [Web端](agent_ihub_web/README_CN.md)
- 后端：请参考 [后端](agent_ihub_backend/README_zh.md)