# Agent iHub Server

English | [中文](README_zh.md)

Agent iHub is an AI Agent configuration management platform that manages AI Agent configurations similar to how GitHub manages code.

## 🎯 Product Core Positioning

**Agent iHub = GitHub for AI Agents**
- GitHub manages static code, Agent iHub manages AI Agent configurations
- Supports public/private access control
- Integrates Agent design assistant and AI generation features

## 🏗️ Project Structure

```bash
agent-ihub-server
├── ihub-common                  # Common modules
│   ├── ihub-common-bom          # Common BOM dependency management
│   ├── ihub-common-core         # Core configuration module
│   ├── ihub-common-milvus       # Milvus vector database module
│   ├── ihub-common-mongoplus    # MongoDB extension module
│   ├── ihub-common-satoken      # Sa-Token authentication module
│   ├── ihub-common-translation  # Translation module
│   └── ihub-common-web          # Web common module
├── ihub-modules                 # Business modules
│   ├── ihub-module-agent        # Agent client module
│   ├── ihub-module-core         # Core business module
│   ├── ihub-module-file         # File processing module
│   └── ihub-module-log          # Log module
├── ihub-server                  # Startup module
└── pom.xml                      # Root project POM
```

### Module Description

#### ihub-common Common Modules
Contains common functions and configurations in the project:
- `ihub-common-bom`: Dependency version management
- `ihub-common-core`: Core configuration classes and basic functions, including email, Redis, Milvus, MongoDB configurations
- `ihub-common-milvus`: Milvus vector database operations for handling AI vector data
- `ihub-common-mongoplus`: Enhanced MongoDB operations for convenient data access
- `ihub-common-satoken`: Sa-Token authentication-related functions for user authentication and authorization
- `ihub-common-translation`: Translation module for dynamic data translation
- `ihub-common-web`: Web-related common functions, including global exception handling, unified return formats, etc.

#### ihub-modules Business Modules
Contains specific business implementations:
- `ihub-module-agent`: Agent client-related functions for communication with external AI platforms like LiteAgent
- `ihub-module-core`: Core business module containing controllers, services, entities, etc., handling core functions like users, agents, favorites, follows
- `ihub-module-file`: File processing functions including Markdown parsing, PDF conversion, file upload, etc.
- `ihub-module-log`: Logging and processing functions for recording user operations

#### ihub-server Startup Module
The project's entry point, containing the main application class and configuration files.

## 🔧 Tech Stack

- Java 17
- Spring Boot 3.5.6
- MongoDB
- Milvus Vector Database
- Redis
- Sa-Token Authentication Framework
- MapStruct Plus Object Mapping
- Hutool Toolkit
- SpringDoc OpenAPI Documentation
- Flexmark Markdown Parser
- Redisson Redis Client
- Aliyun SMS Service

## 🚀 Quick Start

### Environment Requirements

- JDK 17+
- Maven 3.6+
- MongoDB
- Milvus Vector Database
- Redis

### Environment Variable Configuration

The project uses `.env` file to manage sensitive configuration information. Please follow these steps to configure:

1. Copy [.env.example](.env.example) file and rename it to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and fill in actual configuration values

Configuration items explanation:
- Email configuration: Used for user registration, password reset and other email sending functions
- Redis configuration: Used for caching and session management
- AI service configuration: OpenAI API key and base URL for AI-related functions
- Milvus configuration: Vector database connection information for storing and retrieving Agent content vectors
- MongoDB configuration: Main database connection information
- Dolphin configuration: PDF to Markdown service configuration
- Agent configuration: API keys for AI platforms like LiteAgent
- Aliyun SMS service configuration: Used for sending SMS verification codes
- Jasypt encryption configuration: Used for encrypting sensitive information in configuration files

### Build Project

```bash
mvn clean install
```

### Run Project

```bash
mvn spring-boot:run
```

Or

```bash
cd ihub-server
java -jar target/ihub-server-*.jar
```

### Docker Deployment

The project provides Docker Compose configuration files for quickly deploying the entire application environment.

> 💡 **Environment Variable Configuration**
>
> Docker deployment uses `.env` file to manage sensitive configuration information. Please ensure the `.env` file is properly configured before starting containers.
>
> 1. Copy [.env.example](.env.example) file and rename it to `.env`:
>    ```bash
>    cp .env.example .env
>    ```
>
> 2. Edit the `.env` file and fill in actual configuration values

#### Deploy with Docker Compose

1. Build the project JAR package:
```bash
mvn clean package
```

2. Copy the generated JAR package to the deployment directory and rename it:
```bash
cp ihub-server/target/ihub-server-*.jar script/deploy/ihub-server.jar
```

3. Copy the .env file to the deployment directory:
```bash
cp .env script/deploy/.env
```

4. Go to the directory where docker-compose.yml is located and start the service:
```bash
cd script/deploy
docker-compose up -d
```

> 🛡️ **Security Reminder**
>
> Docker Compose loads environment variables from the `.env` file through the `env_file` directive, ensuring sensitive information is not hard-coded in configuration files.

#### Manually Build Docker Image

1. First build the project JAR package:
```bash
mvn clean package
```

2. Copy the generated JAR package to the deployment directory and rename it:
```bash
cp ihub-server/target/ihub-server-*.jar script/deploy/ihub-server.jar
```

3. Go to the directory where Dockerfile is located and build the image:
```bash
cd script/deploy
docker build -t ihub-server .
```

#### Run Container

Run the container with the following command:
```bash
docker run -d --name ihub-server -p 9081:9081 -v /Users/litevar/ihub:/home/ihub -v /Users/litevar/ihub/logs:/home/ihub/logs --env-file .env ihub-server
```

Where:
- `-d`: Run container in background
- `--name`: Specify container name
- `-p`: Port mapping, map host port 9081 to container port 9081
- `-v`: Mount data volumes, map host directories to container directories
- `--env-file`: Load environment variables
- `ihub-server`: Image name

## 📋 Functional Architecture Design

Agent iHub version 1.0.0 implements a complete AI Agent configuration management platform with the following core modules:

### 1. Account Management Module
- **Account Login**: Support login via email + password
- **Account Registration**: New users can register via email verification and must agree to privacy policy
- **Password Reset**: Provide password recovery function via email

### 2. Global Navigation and Search
- **Header Navigation Bar**: Contains global search box, Create Agent button and user menu
- **Global Search**: Support quick search of Agent and user lists
- **New Agent**: Provide shortcut to create new Agent
- **Import Agent**: Support importing existing Agent configurations

### 3. Dashboard (Workbench)
- **User Created Agents**: Display all Agents created by current user with query support
- **Popular Agents**: Display the most popular Agents on the platform
- **User Recent Activities**: Display user operation history records

### 4. Explore Module
- **User Favorited Agents Statistics**: Display the number of Agents favorited by user
- **Explore List**: Display all public Agents
- **Today's Popular Agent List**: Display popular Agents ranked by day

### 5. User Center Module
- **Profile**: User personal information management
- **Followers and Following**:
  - Followers and following count statistics
  - Followers list and search (support search by nickname, username)
  - Following users list and search (support search by nickname, username)
  - Support follow/unfollow operations
- **Personal Overview**:
  - Display user's popular Agents
  - Show recent operation records

### 6. Agents Management Module
- **User Created Agents**: Display all Agents created by current user
- **Query Function**: Support querying by Agent name, description, tags
- **List Sorting**: Support sorting by recently updated, recently created, Stars, Forks, etc.

### 7. Stars (Favorites) Module
- **User Stars List**: Display all Agents favorited by user
- **Query Function**: Support querying by Agent name, description, tags
- **List Sorting**: Support sorting by recently updated, recently created, Stars, Forks, etc.

### 8. Settings Module
- **Public Profile Settings**: Set avatar, public email, region and other personal information
- **Account Settings**:
  - Change password function
  - Logout function

### 9. Agent Details Module
- **Agent Creation**: Provide complete Agent creation wizard
- **Similar Agent Recommendation**: Recommend similar Agents based on content
- **New Agent Editor**: Rich text editor supporting links, images, tables, etc.
- **Copilot Assistant Functions**:
  - Upload tool documents/knowledge base documents
  - Delete tool documents/knowledge base documents
- **Agent Editing**:
  - Add new files
  - Upload tool documents/knowledge base documents
  - Edit tool documents/knowledge base documents
  - Modify hub_agent.md file
- **Export Agent**: Support exporting Agent configurations in standard format
- **Agent Content Display**: Display Agent's tool list and knowledge base document statistics
- **Fork Agent**: Support forking other users' Agents
- **Star Agent**: Support favoriting favorite Agents

### 10. Agent Settings Module
- **General Settings**: Modify Agent name, platform, description, visibility and other attributes
- **Delete Agent**: Support deleting Agents created by oneself
- **Tag Settings**: Support adding or removing tags for Agents

### 11. Footer Information
- **Privacy Statement**: Provide Agent iHub privacy statement (Markdown format)
- **Contact Us**: Display contact phone number and email information