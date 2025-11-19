package com.litevar.ihub.core.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Agent Fork请求DTO
 *
 * @author uncle
 * @since 2025/7/7
 */
@Data
@Schema(description = "Agent Fork请求DTO")
@NoArgsConstructor
@AllArgsConstructor
public class ForkRequestDTO {
    /**
     * Fork后的Agent名称（可选，如果不提供则使用原名称 + " (Fork)"）
     */
    @Schema(description = "Fork后的Agent名称（可选，如果不提供则使用原名称 + \" (Fork)\"）")
    private String name;

    /**
     * Fork后的Agent描述（可选，如果不提供则使用原描述）
     */
    @Schema(description = "Fork后的Agent描述（可选，如果不提供则使用原描述）")
    private String description;
}