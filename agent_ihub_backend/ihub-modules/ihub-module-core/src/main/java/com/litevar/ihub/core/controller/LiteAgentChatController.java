package com.litevar.ihub.core.controller;

import cn.dev33.satoken.annotation.SaCheckLogin;
import com.litevar.ihub.common.web.R;
import com.litevar.ihub.core.dto.AgentChatDTO;
import com.litevar.ihub.core.dto.CreationChatDTO;
import com.litevar.ihub.core.dto.NavigationResultDTO;
import com.litevar.ihub.core.service.impl.AgentChatService;
import com.litevar.liteagent.model.ApiRecords;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

/**
 * liteAgent 聊天接口
 * @author Teoan
 * @since 2025/9/18 10:13
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/liteAgent")
@Tag(name = "liteAgent 聊天接口", description = "liteAgent 聊天接口")
public class LiteAgentChatController {

    private final AgentChatService agentChatService;

    /**
     * 导航接口 调用liteAgent 判断是否进入搜索页面还是创建页面
     */
    @PostMapping(value = "/navigation",produces = MediaType.APPLICATION_JSON_VALUE)
    @SaCheckLogin
    @Operation(summary = "导航接口", description = "调用liteAgent 判断是否进入搜索页面还是创建页面")
    public  R<NavigationResultDTO> navigationChat(@RequestBody AgentChatDTO agentChatDTO) {
        return R.ok(agentChatService.navigationChat(agentChatDTO));
    }


    /**
     * agent创作编辑接口 调用liteAgent 生成ihub_agent.md
     */
    @PostMapping(value = "/creation/chat",produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "agent创作编辑接口", description = "调用liteAgent 生成ihub_agent.md")
    public Flux<ServerSentEvent<ApiRecords.AgentMessage>> creationChat(@RequestBody @Validated CreationChatDTO creationChatDTO) {
        return agentChatService.creationChat(creationChatDTO);
    }

    /**
     *  清空 agent创作编辑会话
     */
    @DeleteMapping(value = "/creation/clean-session")
    @SaCheckLogin
    @Operation(summary = "清空agent创作编辑会话", description = "清空agent创作编辑会话")
    public R<Boolean> cleanCreationChatSession() {
        return R.ok(agentChatService.cleanCreationChatSession());
    }










}
