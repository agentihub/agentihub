package com.litevar.ihub.log.service;

import com.litevar.ihub.log.dto.UserActionLogDTO;
import com.litevar.ihub.log.entity.UserActionLog;
import com.mongoplus.model.PageResult;
import com.mongoplus.service.IService;

import java.util.List;

/**
 * 用户操作日志服务接口
 *
 * @author Teoan
 * @since 2025/9/11
 */
public interface IUserActionLogService extends IService<UserActionLog> {

    /**
     * 根据用户ID获取最近的操作日志
     *
     * @param userId 用户ID
     * @param limit  返回日志条数限制
     * @return 用户操作日志列表
     */
    List<UserActionLogDTO> getRecentLogsByUserId(String userId, int limit);

    /**
     * 根据用户ID分页获取操作日志
     *
     * @param userId   用户ID
     * @param pageNum  页码
     * @param pageSize 每页大小
     * @return 分页结果
     */
    PageResult<UserActionLogDTO> getLogsByUserId(String userId, Integer pageNum, Integer pageSize);
}