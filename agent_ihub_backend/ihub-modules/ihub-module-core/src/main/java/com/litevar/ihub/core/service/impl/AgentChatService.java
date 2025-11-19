package com.litevar.ihub.core.service.impl;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import com.litevar.ihub.agent.LiteAgentClientFactory;
import com.litevar.ihub.agent.LiteAgentServiceClient;
import com.litevar.ihub.agent.enums.AgentClientType;
import com.litevar.ihub.agent.message.handler.DefaultMessageHandler;
import com.litevar.ihub.common.core.utils.RedisUtils;
import com.litevar.ihub.common.satoken.utils.LoginHelper;
import com.litevar.ihub.core.dto.*;
import com.litevar.ihub.core.service.IAgentsService;
import com.litevar.ihub.file.entity.FileInfo;
import com.litevar.ihub.file.service.IFileInfoService;
import com.litevar.liteagent.client.LiteAgentClient;
import com.litevar.liteagent.model.ApiRecords;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.util.List;

import static com.litevar.ihub.common.core.constant.CacheConstants.LITE_AGENT_CREATION_CHAT_SESSION_KEY;
import static com.litevar.ihub.core.dto.NavigationResultDTO.CREATE_TYPE;

/**
 * agentChat 服务实现类
 *
 * @author Teoan
 * @since 2025/9/18 11:18
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AgentChatService {

    private final LiteAgentClientFactory liteAgentClientFactory;
    private final IFileInfoService fileInfoService;
    private final LiteAgentServiceClient liteAgentServiceClient;
    private final IAgentsService agentsService;

    /**
     * 导航接口，调用liteAgent 判断是否进入搜索页面还是创建页面 如果为搜索页面，则进行关键词搜索，返回为空时，进入创建页面
     * @param agentChatDTO agent聊天DTO
     * @return JSONObject
     */
    public NavigationResultDTO navigationChat(AgentChatDTO agentChatDTO) {
        log.debug("发送导航agent信息:{}", agentChatDTO.getContent());
        String agentContent = liteAgentServiceClient.chatAgent(AgentClientType.NAVIGATION, agentChatDTO.getContent());
        NavigationResultDTO navigationResult = JSONUtil.toBean(agentContent.replace("```json", "").replace("```", ""),NavigationResultDTO.class);
        if (navigationResult.isSearch()) {
            String text = navigationResult.getText();
            List<AgentDTO> agentDTOS = agentsService.searchAgentByKeyWord(text);
            if (CollUtil.isEmpty(agentDTOS)) {
                navigationResult.setType(CREATE_TYPE);
            }else{
                navigationResult.setAgentDTOS(agentDTOS);
            }
        }
        return navigationResult;
    }


    /**
     * agent创作编辑接口 调用liteAgent 生成ihub_agent.md
     * @param agentChatDTO agent聊天DTO
     * @return Flux<ServerSentEvent<ApiRecords.AgentMessage>>
     */
    public Flux<ServerSentEvent<ApiRecords.AgentMessage>> creationChat(CreationChatDTO agentChatDTO) {
        // 手动检查是否登录
        LoginHelper.checkLogin();
        LiteAgentClient agentClient = liteAgentClientFactory.getLiteAgentClient(AgentClientType.CREATION);
        String sessionKey = StrUtil.format(LITE_AGENT_CREATION_CHAT_SESSION_KEY, LoginHelper.getCurrentUserId());
        String sessionId = RedisUtils.get(sessionKey, String.class);
        if (StrUtil.isBlank(sessionId)) {
            sessionId = agentClient.initSession();
            RedisUtils.set(sessionKey, sessionId, Duration.ofHours(1));
        }
        String text = getChatRequestText(agentChatDTO);
        log.debug("发送agent创作编辑信息:{}", text);
        ApiRecords.ChatRequest request = new ApiRecords.ChatRequest(List.of(
                new ApiRecords.ContentListItem("text", text)), true);
        return agentClient.chat(sessionId, request, new DefaultMessageHandler());
    }

    /**
     * 获取agent创作编辑请求文本
     * @param agentChatDTO agent聊天DTO
     * @return String
     */
    private String getChatRequestText(CreationChatDTO agentChatDTO) {
        List<String> tools = fileInfoService.getByIds(agentChatDTO.getToolFileIdList()).stream().map(FileInfo::getFileName).toList();
        List<String> docs = fileInfoService.getByIds(agentChatDTO.getDocsFileIdList()).stream().map(FileInfo::getFileName).toList();
        CreationChatRequestDTO creationChatRequestDTO = CreationChatRequestDTO.builder()
                .cmd(agentChatDTO.getCmd())
                .tools(tools)
                .docs(docs)
                .build();
        return JSONUtil.toJsonStr(creationChatRequestDTO);
    }


    /**
     * 清空 agent创作编辑会话
     * @return Boolean
     */
    public Boolean cleanCreationChatSession() {
        String sessionKey = StrUtil.format(LITE_AGENT_CREATION_CHAT_SESSION_KEY, LoginHelper.getCurrentUserId());
        RedisUtils.delete(sessionKey);
        return true;
    }


}
