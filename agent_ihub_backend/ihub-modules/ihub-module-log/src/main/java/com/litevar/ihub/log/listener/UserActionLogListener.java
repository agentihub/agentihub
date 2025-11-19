package com.litevar.ihub.log.listener;

import com.litevar.ihub.log.entity.UserActionLog;
import com.litevar.ihub.log.service.IUserActionLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * 用户日志监听类
 *
 * @author Teoan
 * @since 2025/10/15 15:38
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class UserActionLogListener {
    private final IUserActionLogService userActionLogService;

    @EventListener
    @Async
    public void onUserAction(UserActionLog actionLog) {
        userActionLogService.save(actionLog);
        log.debug("记录用户操作日志成功: 用户ID={}, 操作类型={}, 目标用户ID={},目标agent ID={}", actionLog.getUserId(),
                actionLog.getActionType().getDescription(), actionLog.getTargetUserId(),actionLog.getTargetAgentId());
    }

}