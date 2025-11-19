package com.litevar.ihub.file.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 *
 * @author Teoan
 * @since 2025/11/13 10:15
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "更新文件内容")
public class UpdateFileContentDTO {

    /**
     * 文件ID
     */
    @NotBlank(message = "文件ID不能为空")
    @Schema(description = "文件ID")
    String id;

    /**
     * 文件内容
     */
    @Schema(description = "文件内容")
    @NotBlank(message = "文件内容不能为空")
    String content;
}
