package com.litevar.ihub.agent.message.handler;

import com.litevar.liteagent.handler.MessageHandler;
import com.litevar.liteagent.model.ApiRecords;

/**
 *
 * @author Teoan
 * @since 2025/9/18 15:43
 */
public abstract class SimpleMessageHandler implements MessageHandler {

    @Override
    public void handleChunk(ApiRecords.AgentMessage agentMessage) {
        // 暂不处理分块调用调用
    }

    @Override
    public void handleFunctionCall(ApiRecords.AgentMessage agentMessage) {
        // 暂不处理函数调用
    }

    @Override
    public void handlePlanningMessage(ApiRecords.AgentMessage agentMessage) {
        // 暂不处理规划消息
    }
}
