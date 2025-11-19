package com.litevar.ihub.log.service.impl;

import com.litevar.ihub.log.dto.UserActionLogDTO;
import com.litevar.ihub.log.entity.UserActionLog;
import com.litevar.ihub.log.service.IUserActionLogService;
import com.mongoplus.model.PageResult;
import com.mongoplus.service.impl.ServiceImpl;
import io.github.linpeilie.Converter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 用户操作日志服务实现类
 *
 * @author Teoan
 * @since 2025/9/11
 */
@Service
@RequiredArgsConstructor
public class UserActionLogServiceImpl extends ServiceImpl<UserActionLog> implements IUserActionLogService {


    private final Converter converter;

    /**
     * 根据用户ID获取最近的操作日志
     *
     * @param userId 用户ID
     * @param limit  返回日志条数限制
     * @return 用户操作日志列表
     */
    @Override
    public List<UserActionLogDTO> getRecentLogsByUserId(String userId, int limit) {
        List<UserActionLog> userActionLogList = this.lambdaQuery()
                .eq(UserActionLog::getUserId, userId)
                .orderByDesc(UserActionLog::getActionTime)
                .list()
                .stream()
                .limit(limit)
                .collect(Collectors.toList());
        return converter.convert(userActionLogList, UserActionLogDTO.class);
    }

    /**
     * 根据用户ID分页获取操作日志
     *
     * @param userId   用户ID
     * @param pageNum  页码
     * @param pageSize 每页大小
     * @return 分页结果
     */
    @Override
    public PageResult<UserActionLogDTO> getLogsByUserId(String userId, Integer pageNum, Integer pageSize) {
        return this.page(
                this.lambdaQuery()
                        .eq(UserActionLog::getUserId, userId)
                        .orderByDesc(UserActionLog::getActionTime),
                pageNum,
                pageSize,
                UserActionLogDTO.class
        );
    }
}