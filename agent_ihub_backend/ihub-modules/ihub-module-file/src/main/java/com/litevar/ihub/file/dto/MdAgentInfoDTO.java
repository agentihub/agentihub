package com.litevar.ihub.file.dto;


import com.litevar.ihub.file.enums.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 *  md解析的agent信息
 * @author Teoan
 * @since 2025/9/25 18:04
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MdAgentInfoDTO {

    /**
     * agent名称
     */
    private String name;
    /**
     * agent描述
     */
    private String description;
    /**
     * agent类型
     */
    private AgentType type;
    /**
     * agent模式  执行模式
     */
    private ExecutionMode mode;
    /**
     * agent提示词
     */
    private String prompt;


    /**
     * agent大模型
     */
    private Model model;


    /**
     * agent方法
     */
    private List<Tool> tools;


    /**
     * agent知识库
     */
    private List<KnowledgeBase> knowledgeBases;

    /**
     * 子agent
     */
    private List<MdAgentInfoDTO> subAgents;


    /**
     * agent大模型
     */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Model {
        private String name;
        private String alias;
        private String baseUrl;
        private String apiKey;
        private ModelType type = ModelType.LLM;
    }

    /**
     * agent方法
     */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Function  {
        private String name;
        private String method;
        private ExecutionMode mode;
    }


    /**
     * agent工具
     */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Tool  {
        private String name;
        private SchemaType schemaType;
        private String description;
        private String schemaFileName;
        private ApiKeyType apiKeyType;
        private String apiKey;
        private Boolean autoAgent = false;
        private List<Function> functions;
    }


    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class KnowledgeBase {
        private String name;
        private Model model;
        private String description;
        private List<String> documents;
    }

}