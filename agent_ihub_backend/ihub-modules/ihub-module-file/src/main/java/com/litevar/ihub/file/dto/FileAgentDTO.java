package com.litevar.ihub.file.dto;


import com.litevar.ihub.file.enums.AgentType;
import com.litevar.ihub.file.enums.ExecutionMode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


/**
 * @author Teoan
 * @since 2025/09/28
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FileAgentDTO {
    /**
     * ID
     */
    private String id;
    /**
     * 名称
     */
    private String name;
    /**
     * 描述
     */
    private String description;
    /**
     * 提示
     */
    private String prompt;
    /**
     * 类型
     */
    private AgentType type;
    /**
     * 模式
     */
    private ExecutionMode mode;
    /**
     * 模型ID
     */
    private String modelId;
    /**
     * 温度
     */
    private int temperature = 0;
    /**
     * Top P
     */
    private int topP = 1;
    /**
     * 最大Token数
     */
    private int maxTokens = 4096;
    /**
     * TTS模型ID
     */
    private String ttsModelId;
    /**
     * 子代理ID列表
     */
    private List<String> subAgentIds;
    /**
     * 知识库ID列表
     */
    private List<String> knowledgeBaseIds;
    /**
     * 函数列表
     */
    private List<Function> functionList;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class Function {
        /**
         * 工具ID
         */
        private String toolId;
        /**
         * 函数ID
         */
        private String functionId;
        /**
         * 模式
         */
        private ExecutionMode mode;
    }
}
