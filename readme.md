# Agent iHub

English · [中文](readme-zh_CN.md)

Agent iHub is an AI agent creation and sharing platform aimed at helping users quickly and intelligently create, share, and deploy AI agent applications. It supports the import and export of agents from multiple sources, including agent configuration, large model configuration, knowledge base, tools, etc. It provides web-based backend services and is suitable for various application scenarios.

## Program description
- [Web](agent_ihub_web/README.md)
- [Backend](agent_ihub_backend/README.md)

## Features

### 1. User
- User registration, login, password change, and user information modification
- Latest User News
- Personal Center
  - Fans and followers
    - Fan Count Statistics
    - Number of followers statistics
    - Fan search (fan nickname, username)
    - Follow or unfollow
    - Follow user search (follow user nickname, username)
- Personal Overview
  - Popular agents
  - Recent actions(user's latest updates)


### 2. Agent
- General settings for agents(name, platform, description, visibility, etc.)
- My agent list and query, detailed display
- Popular agents
- Star agent
- Fork agent
- Import and export agents
  - Including agent configuration, large model configuration, knowledge base, tools, etc
  - Support single or multiple agents
- Create and modify agents
  - Recommended similar agents
  - Support single or multiple agents
  - Support upload and delete tools and knowledge base documents
  - Can edit By intelligent copilot for regular user
  - Or change agent description file(hub_agent.md) directly for expert users

## Quick Start

### 1. Minimum Requirements

Before starting to use AgeneIhub, it is recommended that your machine meet the following minimum system requirements:

>- CPU >= 4 Core
>- RAM >= 10 GiB
>- Hard disk >= 256GB(Recommended SSD)

### 2. Environment Preparation
- Database：mongodb(4.4+), redis(6.0+)
- Vector database：milvus(2.5+)
- Development environment
  - web: nodejs(18.0+)
  - backend: java(17.0+)

### 3. Run and Build
- Web：Please refer to [Web](agent_ihub_web/README.md)
- Backend：Please refer to [Backend](agent_ihub_backend/README.md)