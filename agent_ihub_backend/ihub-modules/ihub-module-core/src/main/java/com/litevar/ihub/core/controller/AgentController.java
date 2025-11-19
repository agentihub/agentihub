package com.litevar.ihub.core.controller;

import cn.dev33.satoken.annotation.SaCheckLogin;
import cn.hutool.core.util.IdUtil;
import com.litevar.ihub.common.web.R;
import com.litevar.ihub.common.web.exception.BusinessException;
import com.litevar.ihub.common.web.exception.ErrorCode;
import com.litevar.ihub.core.dto.*;
import com.litevar.ihub.core.entity.Agent;
import com.litevar.ihub.core.enums.PlatformType;
import com.litevar.ihub.core.service.IAgentReleaseService;
import com.litevar.ihub.core.service.IAgentsService;
import com.mongoplus.model.PageResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

/**
 * Agent控制器
 *
 * @author Teoan
 * @since 2025/7/24 15:46
 */
@RestController
@RequestMapping("/api/v1/agents")
@Slf4j
@RequiredArgsConstructor
@Tag(name = "agents管理", description = "agents相关操作接口")
public class AgentController {

    private final IAgentsService agentsService;
    private final IAgentReleaseService agentReleaseService;

    /**
     * 创建Agent
     *
     * @param agentDTO Agent创建信息
     * @return 创建的Agent信息
     */
    @PostMapping
    @Operation(summary = "创建Agent", description = "创建一个新的Agent")
    @SaCheckLogin
    public R<AgentDTO> createAgent(@Validated @RequestBody CreateAgentDTO agentDTO) {
        agentDTO.setId(IdUtil.getSnowflakeNextIdStr());
        return R.ok(agentsService.createAgent(agentDTO));
    }

    /**
     * 根据ID获取Agent
     *
     * @param id Agent ID
     * @return Agent信息
     */
    @GetMapping()
    @Operation(summary = "获取Agent", description = "根据ID获取指定的Agent")
    @Parameter(name = "id", description = "Agent ID", required = true)
    @SaCheckLogin
    public R<AgentDTO> getAgentById(@NotBlank(message = "Agent ID不能为空") @RequestParam("id") String id) {
        return R.ok(agentsService.getAgentById(id));
    }


    /**
     * 根据用户名和agent名称获取指定的Agent
     *
     * @param agentName Agent名称
     * @param userName  用户名
     * @return Agent信息
     */
    @GetMapping("/by-name")
    @Operation(summary = "根据用户名和agent名称获取指定的Agent", description = "根据用户名和agent名称获取指定的Agent")
    @SaCheckLogin
    public R<AgentDTO> getAgentByUserNameAndAgentName(@NotBlank(message = "Agent名称不能为空") @RequestParam("agentName") String agentName,
                                                      @NotBlank(message = "用户名称不能为空") @RequestParam("userName") String userName
    ) {
        return R.ok(agentsService.getAgentByUserNameAndAgentName(agentName,userName));
    }



    /**
     * 根据关键字搜索 agent
     *
     * @param keyWord 关键字
     * @return Agent列表
     */
    @GetMapping("/search-agent")
    @Operation(summary = "根据关键字搜索 agent", description = "根据关键字搜索 agent")
    @Parameter(name = "keyWord", description = "keyWord", required = true)
    @SaCheckLogin
    public R<List<AgentDTO>> searchAgentByKeyWord(@NotBlank(message = "关键字不能为空") @RequestParam("keyWord") String keyWord) {
        return R.ok(agentsService.searchAgentByKeyWord(keyWord));
    }


    /**
     * 获取公共Agent列表
     *
     * @param pageNum  页码
     * @param pageSize 每页数量
     * @param search   搜索内容
     * @param platform 平台类型
     * @param category 分类
     * @param sort     排序方式
     * @param tags     标签列表
     * @return 公共Agent分页列表
     */
    @GetMapping("/public")
    @Operation(summary = "获取公共Agent列表", description = "分页获取公共Agent列表")
    @Parameter(name = "pageSize", description = "每页数量，最大100", example = "10")
    @Parameter(name = "pageNum", description = "当前页", example = "1")
    @Parameter(name = "search", description = "查找内容")
    @Parameter(name = "platform", description = "平台", example = "LiteAgent")
    @Parameter(name = "category", description = "分类")
    @Parameter(name = "sort", description = "排序")
    @Parameter(name = "tags", description = "标签")
    @SaCheckLogin
    public R<PageResult<AgentDTO>> getPublicAgents(@NotNull(message = "当前页不能为空") @RequestParam(value = "pageNum", defaultValue = "1") Integer pageNum,
                                                   @NotNull(message = "每页数量不能为空") @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize,
                                                   @RequestParam(value = "search",required = false) String search,
                                                   @RequestParam(value = "platform",required = false) String platform,
                                                   @RequestParam(value = "category",required = false) String category,
                                                   @RequestParam(value = "sort",required = false) String sort,
                                                   @RequestParam(value = "tags",required = false) List<String> tags) {
        return R.ok(agentsService.getPublicAgents(pageNum, pageSize, search, PlatformType.of(platform), category, sort, tags));
    }

    /**
     * 获取热门Agent列表
     *
     * @param pageNum  页码
     * @param pageSize 每页数量
     * @param platform 平台类型
     * @return 热门Agent分页列表
     */
    @GetMapping("/trending")
    @Operation(summary = "获取热门Agent列表", description = "分页获取热门Agent列表")
    @Parameters({
            @Parameter(name = "pageNum", description = "页码", required = true, example = "1"),
            @Parameter(name = "pageSize", description = "每页数量", required = true, example = "10"),
            @Parameter(name = "platform", description = "平台", required = true, example = "LiteAgent")
    })
    @SaCheckLogin
    public R<PageResult<AgentDTO>> getTrendingAgents(@NotNull(message = "当前页不能为空") @RequestParam(value = "pageNum", defaultValue = "1") Integer pageNum,
                                  @NotNull(message = "每页数量不能为空") @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize,
                                  @RequestParam(value = "platform",required = false) String platform) {
        return R.ok(agentsService.getTrendingAgents(pageNum, pageSize, PlatformType.of(platform)));
    }


    /**
     * 更新Agent信息
     *
     * @param agentDTO Agent更新信息
     * @return 操作结果
     */
    @PutMapping
    @Operation(summary = "更新Agent信息")
    @SaCheckLogin
    public R<?> updateAgent(@Validated @RequestBody UpdateAgentDTO agentDTO) {
        agentsService.updateAgent(agentDTO);
        return R.ok();
    }


    /**
     * 删除Agent信息
     *
     * @param id Agent ID
     * @return 操作结果
     */
    @DeleteMapping
    @Operation(summary = "删除Agent信息")
    @SaCheckLogin
    public R<?> deleteAgent(@NotBlank(message = "Agent ID不能为空") @RequestParam("id") String id) {
        agentsService.deleteAgent(id);
        return R.ok();
    }


    /**
     * 获取用户的Agent列表
     *
     * @param userId   用户ID
     * @param userName 用户名
     * @param pageNum  页码
     * @param pageSize 每页数量
     * @return 用户的Agent分页列表
     */
    @GetMapping("/user")
    @Operation(summary = "获取用户Agent列表")
    @SaCheckLogin
    public R<PageResult<AgentDTO>> getUserAgents(@RequestParam(value = "userId",required = false) String userId,
                                                 @RequestParam(value = "userName",required = false) String userName,
                                                 @RequestParam(value = "sort",required = false) String sort,
                                                 @RequestParam(value = "search",required = false) String search,
                              @NotNull(message = "当前页不能为空") @RequestParam(value = "pageNum", defaultValue = "1") Integer pageNum,
                              @NotNull(message = "每页数量不能为空") @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize) {
        return R.ok(agentsService.listAgentsByAuthor(userId,userName,sort,search, pageNum, pageSize));
    }




    /**
     * 收藏Agent
     *
     * @param agentId Agent ID
     * @return 是否收藏成功
     */
    @PutMapping("/star")
    @Operation(summary = "收藏Agent")
    @SaCheckLogin
    public R<Boolean> starAgent(@NotNull(message = "agentId 不能为空") @RequestParam("agentId") String agentId){
        AgentDTO agentDTO = agentsService.getAgentById(agentId);
        Optional.ofNullable(agentDTO).orElseThrow(() -> new BusinessException(ErrorCode.AGENT_NOT_FOUND));
        return R.ok(agentsService.starAgent(agentDTO));
    }



    /**
     * 取消收藏Agent
     *
     * @param agentId Agent ID
     * @return 是否取消收藏成功
     */
    @DeleteMapping("/star")
    @Operation(summary = "取消收藏Agent")
    @SaCheckLogin
    public R<Boolean> unStarAgent(@NotNull(message = "agentId 不能为空") @RequestParam("agentId") String agentId){
        AgentDTO agentDTO = agentsService.getAgentById(agentId);
        Optional.ofNullable(agentDTO).orElseThrow(() -> new BusinessException(ErrorCode.AGENT_NOT_FOUND));
        return R.ok(agentsService.unStarAgent(agentDTO));
    }



    /**
     * 获取用户收藏的Agent列表
     *
     * @param userId   用户ID
     * @param pageNum  页码
     * @param pageSize 每页数量
     * @param search   搜索内容
     * @param platform 平台类型
     * @param category 分类
     * @param sort     排序方式
     * @return 用户收藏的Agent分页列表
     */
    @GetMapping("/star")
    @Operation(summary = "获取用户收藏的Agent列表")
    @SaCheckLogin
    @Parameter(name = "pageSize", description = "每页数量，最大100", example = "10")
    @Parameter(name = "pageNum", description = "当前页", example = "1")
    @Parameter(name = "search", description = "查找内容")
    @Parameter(name = "platform", description = "平台", example = "LiteAgent")
    @Parameter(name = "category", description = "分类")
    @Parameter(name = "sort", description = "排序")
    public R<PageResult<AgentDTO>> listStarredAgents(@RequestParam(value = "userId")String userId,
                                  @NotNull(message = "当前页不能为空") @RequestParam(value = "pageNum", defaultValue = "1") Integer pageNum,
                                  @NotNull(message = "每页数量不能为空") @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize,
                                  @RequestParam(value = "search",required = false) String search,
                                  @RequestParam(value = "platform",required = false) String platform,
                                  @RequestParam(value = "category",required = false) String category,
                                  @RequestParam(value = "sort",required = false) String sort){
        return R.ok(agentsService.listStarredAgents(userId, pageNum, pageSize, search, PlatformType.of(platform), category, sort));
    }


    /**
     * 导入Agent
     *
     * @param file Agent文件
     * @return 导入的Agent信息
     */
    @PostMapping("/import")
    @Operation(summary = "导入Agent", description = "通过上传agent文件导入Agent配置")
    @SaCheckLogin
    public R<AgentDTO> importAgent(@RequestParam("file") MultipartFile file) {
        return R.ok(agentsService.importAgent(file));
    }


    /**
     * 导出Agent
     *
     * @param id Agent ID
     * @return 导出的Agent文件
     * @throws IOException IO异常
     */
    @GetMapping("/export")
    @Operation(summary = "导出Agent", description = "导出指定ID的Agent为agent文件")
    @Parameter(name = "id", description = "Agent ID", required = true)
    @SaCheckLogin
    public ResponseEntity<Resource> exportAgent(@NotBlank(message = "Agent ID不能为空") @RequestParam("id") String id) throws IOException {
        return agentsService.exportAgent(id);
    }


    /**
     * Fork Agent
     *
     * @param agentId        Agent ID
     * @param forkRequestDTO Fork请求信息
     * @return Fork后的Agent信息
     */
    @PostMapping("/fork")
    @Operation(summary = "Fork Agent")
    @SaCheckLogin
    public R<AgentDTO> forkAgent(@NotNull(message = "agentId 不能为空") @RequestParam("agentId") String agentId,
                         @RequestBody ForkRequestDTO forkRequestDTO){
        Agent agent = agentsService.getById(agentId);
        Optional.ofNullable(agent).orElseThrow(() -> new BusinessException(ErrorCode.AGENT_NOT_FOUND));
        return R.ok(agentsService.forkAgent(agent, forkRequestDTO));
    }


    /**
     * 获取Agent的Fork数量
     *
     * @param agentId Agent ID
     * @return Fork数量
     */
    @GetMapping("/fork/count")
    @Operation(summary = "获取Agent的Fork数量")
    @SaCheckLogin
    public R<Integer> countForks(@NotNull(message = "agentId 不能为空") @RequestParam("agentId") String agentId){
        return R.ok(agentsService.countForks(agentId));
    }


    /**
     * 发布Agent
     *
     * @param agentDTO Agent发布信息
     * @return 是否发布成功
     */
    @PutMapping("/publish")
    @Operation(summary = "发布Agent", description = "发布指定ID的Agent")
    @SaCheckLogin
    public R<Boolean> publishAgent(@RequestBody @Validated PublishAgentDTO agentDTO) {
        return R.ok(agentsService.publishAgent(agentDTO));
    }


    /**
     * 分页查询Agent发布历史
     *
     * @param agentId  Agent ID
     * @param pageNum  页码
     * @param pageSize 每页数量
     * @return Agent发布历史分页列表
     */
    @GetMapping("/release/history")
    @Operation(summary = "分页查询Agent发布历史", description = "分页查询Agent发布历史")
    @Parameters({
            @Parameter(name = "agentId", description = "Agent ID", required = true),
            @Parameter(name = "pageNum", description = "页码", example = "1"),
            @Parameter(name = "pageSize", description = "每页数量", example = "10")
    })
    @SaCheckLogin
    public R<PageResult<AgentReleaseDTO>> getAgentReleaseHistory(
            @NotBlank(message = "Agent ID不能为空") @RequestParam("agentId") String agentId,
            @NotNull(message = "当前页不能为空") @RequestParam(value = "pageNum", defaultValue = "1") Integer pageNum,
            @NotNull(message = "每页数量不能为空") @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize) {
        return R.ok(agentReleaseService.getAgentReleaseHistory(agentId, pageNum, pageSize));
    }


    /**
     * 下载agent的md内容
     *
     * @param id Agent ID
     * @return Agent的Markdown文件
     */
    @GetMapping("/md/{id}")
    @Operation(summary = "下载agent的md内容", description = "下载指定ID的agent的Markdown内容，文件名称为agent的名称.md")
    @Parameter(name = "id", description = "Agent ID", required = true)
    @SaCheckLogin
    public ResponseEntity<Resource> downloadAgentMarkdown(@NotBlank(message = "Agent ID不能为空") @PathVariable("id") String id) {
        return agentsService.downloadAgentMarkdown(id);
    }


    /**
     * 获取收藏了指定Agent的用户列表
     *
     * @param agentId  Agent ID
     * @param pageNum  页码
     * @param pageSize 每页数量
     * @return 收藏了指定Agent的用户分页列表
     */
    @GetMapping("/star/users")
    @Operation(summary = "获取收藏了指定Agent的用户列表", description = "分页获取收藏了指定Agent的用户列表")
    @SaCheckLogin
    public R<PageResult<UserDTO>> getAgentStarUsers(
            @NotBlank(message = "Agent ID不能为空") @RequestParam("agentId") String agentId,
            @NotNull(message = "当前页不能为空") @RequestParam(value = "pageNum", defaultValue = "1") Integer pageNum,
            @NotNull(message = "每页数量不能为空") @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize) {
        return R.ok(agentsService.getAgentStarUsers(agentId, pageNum, pageSize));
    }

    /**
     * 获取fork了指定Agent的用户列表
     *
     * @param agentId  Agent ID
     * @param pageNum  页码
     * @param pageSize 每页数量
     * @return fork了指定Agent的用户分页列表
     */
    @GetMapping("/fork/users")
    @Operation(summary = "获取fork了指定Agent的用户列表", description = "分页获取fork了指定Agent的用户列表")
    @SaCheckLogin
    public R<PageResult<UserDTO>> getAgentForkUsers(
            @NotBlank(message = "Agent ID不能为空") @RequestParam("agentId") String agentId,
            @NotNull(message = "当前页不能为空") @RequestParam(value = "pageNum", defaultValue = "1") Integer pageNum,
            @NotNull(message = "每页数量不能为空") @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize) {
        return R.ok(agentsService.getAgentForkUsers(agentId, pageNum, pageSize));
    }

    /**
     * 分页获取fork了某个agent的agent列表
     *
     * @param originalAgentId 原始Agent ID
     * @param pageNum         页码
     * @param pageSize        每页数量
     * @return fork了某个agent的agent分页列表
     */
    @GetMapping("/fork/list")
    @Operation(summary = "分页获取fork了某个agent的agent列表", description = "分页获取fork了某个agent的agent列表")
    @SaCheckLogin
    public R<PageResult<AgentDTO>> listForkedAgents(
            @NotBlank(message = "原始Agent ID不能为空") @RequestParam("originalAgentId") String originalAgentId,
            @NotNull(message = "当前页不能为空") @RequestParam(value = "pageNum", defaultValue = "1") Integer pageNum,
            @NotNull(message = "每页数量不能为空") @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize) {
        return R.ok(agentsService.listForkedAgents(originalAgentId, pageNum, pageSize));
    }



    /**
     * 删除Agent知识库、工具文件
     *
     * @param agentId Agent ID
     * @return 是否取消收藏成功
     */
    @DeleteMapping("/files")
    @Operation(summary = "删除Agent知识库、工具文件")
    @SaCheckLogin
    public R<Boolean> deleteAgentFile(@NotNull(message = "agentId 不能为空") @RequestParam("agentId") String agentId,
                                      @NotNull(message = "fileId 不能为空") @RequestParam("fileId") String fileId){
        return R.ok(agentsService.deleteAgentFile(agentId, fileId));
    }


}