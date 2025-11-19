# Agent iHub Server

[English](README.md) | 中文

Agent iHub 是一个 AI Agent 配置管理平台，类似于 GitHub 管理代码一样管理 AI Agent 配置。

## 🎯 产品核心定位

**Agent iHub = GitHub for AI Agents**
- GitHub管理静态代码，Agent iHub管理AI Agent配置
- 支持public/private访问控制
- 集成Agent设计助手和AI生成功能

## 🏗️ 项目结构

```bash
agent-ihub-server
├── ihub-common                  # 通用模块
│   ├── ihub-common-bom          # 通用BOM依赖管理
│   ├── ihub-common-core         # 核心配置模块
│   ├── ihub-common-milvus       # Milvus向量数据库模块
│   ├── ihub-common-mongoplus    # MongoDB扩展模块
│   ├── ihub-common-satoken      # Sa-Token权限认证模块
│   ├── ihub-common-translation  # 翻译模块
│   └── ihub-common-web          # Web通用模块
├── ihub-modules                 # 业务模块
│   ├── ihub-module-agent        # Agent客户端模块
│   ├── ihub-module-core         # 核心业务模块
│   ├── ihub-module-file         # 文件处理模块
│   └── ihub-module-log          # 日志模块
├── ihub-server                  # 启动模块
└── pom.xml                      # 项目根POM
```

### 模块说明

#### ihub-common 通用模块
包含项目中通用的功能和配置：
- `ihub-common-bom`: 依赖版本管理
- `ihub-common-core`: 核心配置类和基础功能，包括邮件、Redis、Milvus、MongoDB等配置
- `ihub-common-milvus`: Milvus向量数据库操作功能，用于处理AI向量数据
- `ihub-common-mongoplus`: 增强的MongoDB操作功能，提供更便捷的数据访问
- `ihub-common-satoken`: Sa-Token权限认证相关功能，处理用户认证和授权
- `ihub-common-translation`: 翻译模块，用于动态翻译数据
- `ihub-common-web`: Web相关通用功能，包括全局异常处理、统一返回格式等

#### ihub-modules 业务模块
包含具体的业务实现：
- `ihub-module-agent`: Agent客户端相关功能，与LiteAgent等外部AI平台通信
- `ihub-module-core`: 核心业务模块，包含控制器、服务、实体等，处理用户、Agent、收藏、关注等核心功能
- `ihub-module-file`: 文件处理相关功能，包括Markdown解析、PDF转换、文件上传等
- `ihub-module-log`: 日志记录和处理功能，记录用户操作行为

#### ihub-server 启动模块
项目的启动入口，包含主应用类和配置文件。

## 🔧 技术栈

- Java 17
- Spring Boot 3.5.6
- MongoDB
- Milvus 向量数据库
- Redis
- Sa-Token 权限认证框架
- MapStruct Plus 对象映射
- Hutool 工具库
- SpringDoc OpenAPI 文档
- Flexmark Markdown解析
- Redisson Redis客户端
- Aliyun 短信服务

## 🚀 快速开始

### 环境要求

- JDK 17+
- Maven 3.6+
- MongoDB
- Milvus 向量数据库
- Redis

### 配置环境变量

项目使用 `.env` 文件管理敏感配置信息。请按照以下步骤进行配置：

1. 复制 [.env.example](.env.example) 文件并重命名为 `.env`：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，填入实际的配置值

配置项说明：
- 邮件配置：用于用户注册、密码重置等邮件发送功能
- Redis配置：用于缓存和会话管理
- AI服务配置：OpenAI API密钥和基础URL，用于AI相关功能
- Milvus配置：向量数据库连接信息，用于Agent内容的向量存储和检索
- MongoDB配置：主数据库连接信息
- Dolphin配置：PDF转Markdown服务配置
- Agent配置：LiteAgent等AI平台的API密钥
- 阿里云短信服务配置：用于发送短信验证码
- Jasypt加密配置：用于加密配置文件中的敏感信息

### 构建项目

```bash
mvn clean install
```

### 运行项目

```bash
mvn spring-boot:run
```

或者

```bash
cd ihub-server
java -jar target/ihub-server-*.jar
```

### Docker部署

项目提供了Docker Compose配置文件，可以快速部署整个应用环境。

> 💡 **环境变量配置**
> 
> Docker部署使用 `.env` 文件来管理敏感配置信息。在启动容器之前，请确保已正确配置 `.env` 文件。
> 
> 1. 复制 [.env.example](.env.example) 文件并重命名为 `.env`：
>    ```bash
>    cp .env.example .env
>    ```
> 
> 2. 编辑 `.env` 文件，填入实际的配置值

#### 使用Docker Compose部署

1. 构建项目JAR包：
```bash
mvn clean package
```

2. 将生成的JAR包复制到部署目录并重命名：
```bash
cp ihub-server/target/ihub-server-*.jar script/deploy/ihub-server.jar
```

3. 复制.env文件到部署目录：
```bash
cp .env script/deploy/.env
```

4. 进入docker-compose.yml所在目录并启动服务：
```bash
cd script/deploy
docker-compose up -d
```

> 🛡️ **安全提醒**
> 
> Docker Compose通过 `env_file` 指令加载 `.env` 文件中的环境变量，确保敏感信息不会硬编码在配置文件中。

#### 手动构建Docker镜像

1. 首先构建项目JAR包：
```bash
mvn clean package
```

2. 将生成的JAR包复制到部署目录并重命名：
```bash
cp ihub-server/target/ihub-server-*.jar script/deploy/ihub-server.jar
```

3. 进入Dockerfile所在目录并构建镜像：
```bash
cd script/deploy
docker build -t ihub-server .
```

#### 运行容器

使用以下命令运行容器：
```bash
docker run -d --name ihub-server -p 9081:9081 -v /Users/litevar/ihub:/home/ihub -v /Users/litevar/ihub/logs:/home/ihub/logs --env-file .env ihub-server
```

其中：
- `-d`: 后台运行容器
- `--name`: 指定容器名称
- `-p`: 端口映射，将主机的9081端口映射到容器的9081端口
- `-v`: 挂载数据卷，将主机目录映射到容器目录
- `--env-file`: 加载环境变量
- `ihub-server`: 镜像名称

## 📋 功能架构设计

Agent iHub 1.0.0 版本实现了完整的 AI Agent 配置管理平台功能，主要包括以下几个核心模块：

### 1. 账号管理模块
- **账号登录**：支持邮箱+密码方式登录系统
- **账号注册**：新用户可通过邮箱验证注册，需同意隐私政策
- **重置密码**：提供通过邮箱找回密码功能

### 2. 全局导航与搜索
- **Header导航栏**：包含全局搜索框、新建Agent按钮及用户个人菜单
- **全局搜索**：支持对Agent列表和用户列表的快速搜索
- **New Agent**：提供创建新Agent的快捷入口
- **Import Agent**：支持导入已有Agent配置

### 3. Dashboard（工作台）
- **用户创建的Agents**：展示当前用户创建的所有Agent，支持查询功能
- **热门Agents**：展示平台中最受欢迎的Agent
- **用户最新动态**：展示用户的操作历史记录

### 4. Explore（探索）模块
- **用户已收藏Agents统计**：展示用户收藏的Agent数量
- **Explore列表**：展示所有公开的Agent
- **今日热门Agent列表**：按日排行的热门Agent展示

### 5. 用户中心模块
- **个人中心**：用户个人信息管理
- **粉丝与关注**：
  - 粉丝数和关注人数统计
  - 粉丝列表及搜索（支持按昵称、用户名搜索）
  - 关注用户列表及搜索（支持按昵称、用户名搜索）
  - 支持关注/取消关注操作
- **个人概览**：
  - 展示用户受欢迎的Agents
  - 显示最近的操作记录

### 6. Agents管理模块
- **用户创建的Agents**：展示当前用户创建的所有Agent
- **查询功能**：支持按Agent名称、描述、标签进行查询
- **列表排序**：支持按最近更新、最近创建、Stars、Forks等方式排序

### 7. Stars（收藏）模块
- **用户stars列表**：展示用户收藏的所有Agent
- **查询功能**：支持按Agent名称、描述、标签进行查询
- **列表排序**：支持按最近更新、最近创建、Stars、Forks等方式排序

### 8. 设置模块
- **公开资料设置**：可设置头像、公开邮箱、所在地区等个人信息
- **账户设置**：
  - 修改密码功能
  - 退出登录功能

### 9. Agent详情模块
- **Agent创建**：提供完整的Agent创建向导
- **相似Agent推荐**：基于内容推荐相似的Agent
- **New Agent编辑器**：富文本编辑器，支持添加链接、图片、表格等
- **Copilot辅助功能**：
  - 上传工具文档/知识库文档
  - 删除工具文档/知识库文档
- **Agent编辑**：
  - 新增文件
  - 上传工具文档/知识库文档
  - 编辑工具文档/知识库文档
  - 修改hub_agent.md文件
- **导出Agent**：支持将Agent配置导出为标准格式
- **Agent内容展示**：展示Agent的工具列表和知识库文档统计
- **Fork Agent**：支持派生其他用户的Agent
- **Star Agent**：支持收藏喜欢的Agent

### 10. Agent设置模块
- **常规设置**：可修改Agent名称、所属平台、描述、可见性等属性
- **删除Agent**：支持删除自己创建的Agent
- **标签设置**：支持为Agent添加或删除标签

### 11. Footer信息
- **隐私声明**：提供Agent iHub隐私声明（Markdown格式）
- **联系我们**：展示联系电话和电子邮箱信息