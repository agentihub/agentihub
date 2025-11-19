package com.litevar.ihub.agent;

import com.litevar.ihub.agent.enums.AgentClientType;
import com.litevar.ihub.agent.message.handler.SimpleMessageHandler;
import com.litevar.ihub.common.web.exception.BusinessException;
import com.litevar.liteagent.client.LiteAgentClient;
import com.litevar.liteagent.model.ApiRecords;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

/**
 * LiteAgentServer客户端
 *
 * @author Teoan
 * @since 2025/9/19 14:24
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class LiteAgentServiceClient {


    private final LiteAgentClientFactory liteAgentClientFactory;


    /**
     * 调用agent 并同步获取聊天结果
     *
     * @param content 聊天内容
     * @return 聊天结果
     */
    public String chatAgent(AgentClientType agentClientType, String content) {
        try {
            LiteAgentClient client = liteAgentClientFactory.getLiteAgentClient(agentClientType);

            String sessionId = client.initSession();

            ApiRecords.ChatRequest request = new ApiRecords.ChatRequest(
                    List.of(new ApiRecords.ContentListItem("text", content)),
                    false
            );
            AtomicReference<String> result = new AtomicReference<>("");

            Flux<ServerSentEvent<ApiRecords.AgentMessage>> chat = client.chat(sessionId, request, new SimpleMessageHandler() {
                @Override
                public void handleMessage(ApiRecords.AgentMessage agentMessage) {
                    log.debug("handleMessage接收agent信息:{}", agentMessage);
                    if (agentMessage.getRole().equals(ApiRecords.Role.assistant)
                            && agentMessage.getTo().equals(ApiRecords.Role.agent)
                            && agentMessage.getType().equals(ApiRecords.MessageType.text)) {
                        result.set(agentMessage.getContent().toString());
                    }
                }
            });
            // 同步阻塞直到完成
            chat.blockLast(Duration.ofMinutes(1));
            return result.get();
        } catch (Exception e) {
            log.error("调用agent失败", e);
            throw new BusinessException("调用agent失败: " + e.getMessage());
        }
    }


}