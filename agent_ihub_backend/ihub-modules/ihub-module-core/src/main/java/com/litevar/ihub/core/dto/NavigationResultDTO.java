package com.litevar.ihub.core.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

/**
 *  导航结果DTO
 * @author Teoan
 * @since 2025/11/7 12:04
 */
@Data
@Schema(description = "导航结果DTO")
public class NavigationResultDTO {

    public static final String SEARCH_TYPE = "search";

    public static final String CREATE_TYPE = "create";


    @Schema(description = "导航结果")
    private String text;

    @Schema(description = "导航结果类型")
    private String type;

    @Schema(description = "搜索结果")
    private List<AgentDTO> agentDTOS;


    @JsonIgnore
    public Boolean isSearch() {
        return SEARCH_TYPE.equals(type);
    }


}
