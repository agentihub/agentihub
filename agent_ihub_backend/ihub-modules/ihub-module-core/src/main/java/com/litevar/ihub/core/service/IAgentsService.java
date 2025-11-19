package com.litevar.ihub.core.service;

import com.litevar.ihub.core.dto.*;
import com.litevar.ihub.core.entity.Agent;
import com.litevar.ihub.core.enums.PlatformType;
import com.mongoplus.model.PageResult;
import com.mongoplus.service.IService;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * @author Teoan
 * @since 2025/7/28 14:33
 */
public interface IAgentsService extends IService<Agent> {


    /**
     * 创建Agent
     *
     * @param agentDTO AgentDTO
     */
    AgentDTO createAgent(CreateAgentDTO agentDTO);

    /**
     * 获取公共Agent列表
     */
    PageResult<AgentDTO> getPublicAgents(Integer pageNum, Integer pageSize, String search,
                                         PlatformType platform,
                                         String category,
                                         String sort,
                                         List<String> tags);

    /**
     * 获取热门Agent列表
     */
    PageResult<AgentDTO> getTrendingAgents(Integer pageNum, Integer pageSize, PlatformType platform);


    /**
     * 更新Agent信息
     */
    void updateAgent(UpdateAgentDTO agentDTO);

    /**
     * 获取用户 agent 列表
     */
    PageResult<AgentDTO> listAgentsByAuthor(String userId, String userName,String sort,String search,
                                            Integer pageNum,
                                            Integer pageSize);


    /**
     * 收藏Agent
     */
    boolean starAgent(AgentDTO agentDTO);


    /**
     * 取消收藏Agent
     */
    boolean unStarAgent(AgentDTO agentDTO);


    /**
     * 获取用户收藏的Agent列表
     */
    PageResult<AgentDTO> listStarredAgents(String userId,
                                           Integer pageNum,
                                           Integer pageSize,
                                           String search,
                                           PlatformType platform,
                                           String category,
                                           String sort);


    /**
     * 检查Agent是否已被收藏
     */
    boolean isStarredAgent(String agentId);


    /**
     * Fork Agent
     */
    AgentDTO forkAgent(Agent agent, ForkRequestDTO forkRequestDTO);


    /**
     * 获取Agent的Fork数量
     */
    Integer countForks(String agentId);


    /**
     * 分页获取fork了某个agent的agent列表
     */
    PageResult<AgentDTO> listForkedAgents(String originalAgentId, Integer pageNum, Integer pageSize);


    /**
     * 根据ID获取Agent
     */
    AgentDTO getAgentById(String agentId);


    /**
     * 根据用户名和agent名称获取指定的Agent
     */
    AgentDTO getAgentByUserNameAndAgentName(String agentName, String userName);

    /**
     * 根据关键词搜索Agent
     */
    List<AgentDTO> searchAgentByKeyWord(String keyWord);


    /**
     * 统计用户的Agent数量
     */
    Long getAgentCountByUserId(String userId,Boolean allAgent);


    /**
     * 获取用户的Agent的总浏览数
     */
    Long getAgentViewsByUserId(String userId);

    /**
     * 导入Agent
     */
    AgentDTO importAgent(MultipartFile file);

    /**
     * 导出Agent
     */
    ResponseEntity<Resource> exportAgent(String agentId) throws IOException;


    /**
     * 发布Agent
     */
    boolean publishAgent(PublishAgentDTO agentDTO);


    /**
     * 下载agent的md内容
     *
     * @param agentId Agent ID
     */
    ResponseEntity<Resource> downloadAgentMarkdown(String agentId);


    /**
     * 获取Agent的收藏用户列表
     */
    PageResult<UserDTO> getAgentStarUsers(String agentId, Integer pageNum, Integer pageSize);


    /**
     * 获取Agent的fork用户列表
     */
    PageResult<UserDTO> getAgentForkUsers(String agentId, Integer pageNum, Integer pageSize);


    /**
     * 删除 Agent
     */
    void deleteAgent(String agentId);



    /**
     * 删除 Agent 文件
     */
    boolean deleteAgentFile(String agentId,String fileId);

}