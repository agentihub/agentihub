package com.litevar.ihub.core.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 *  agent 聊天DTO
 * @author Teoan
 * @since 2025/9/18 11:08
 */
@Data
@Schema(description = "agent 聊天DTO")
@NoArgsConstructor
@AllArgsConstructor
public class AgentChatDTO {

    /**
     * 聊天内容
     */
    @Schema(description = "聊天内容")
    private String content;


}
