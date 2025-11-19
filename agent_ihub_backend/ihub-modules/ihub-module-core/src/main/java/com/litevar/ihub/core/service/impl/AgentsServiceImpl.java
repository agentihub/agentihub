package com.litevar.ihub.core.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.convert.Convert;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.map.MapUtil;
import cn.hutool.core.net.URLEncodeUtil;
import cn.hutool.core.util.BooleanUtil;
import cn.hutool.core.util.ObjUtil;
import cn.hutool.core.util.ReflectUtil;
import cn.hutool.core.util.StrUtil;
import com.litevar.ihub.agent.LiteAgentServiceClient;
import com.litevar.ihub.agent.enums.AgentClientType;
import com.litevar.ihub.common.core.utils.RedisUtils;
import com.litevar.ihub.common.milvus.service.VectorStoreService;
import com.litevar.ihub.common.mongoplus.entity.BaseEntity;
import com.litevar.ihub.common.satoken.entity.LoginUser;
import com.litevar.ihub.common.satoken.utils.LoginHelper;
import com.litevar.ihub.common.translation.service.IAgentTranslationService;
import com.litevar.ihub.common.web.exception.BusinessException;
import com.litevar.ihub.common.web.exception.ErrorCode;
import com.litevar.ihub.core.dto.*;
import com.litevar.ihub.core.entity.*;
import com.litevar.ihub.core.enums.PlatformType;
import com.litevar.ihub.core.service.*;
import com.litevar.ihub.core.utils.AgentFileUtils;
import com.litevar.ihub.log.annotation.LogRecord;
import com.litevar.ihub.log.enums.UserActionType;
import com.mongoplus.conditions.query.LambdaQueryChainWrapper;
import com.mongoplus.manager.LogicManager;
import com.mongoplus.model.PageResult;
import com.mongoplus.service.impl.ServiceImpl;
import com.mongoplus.toolkit.ChainWrappers;
import io.github.linpeilie.Converter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.Serializable;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;
import java.util.zip.ZipOutputStream;

import static com.litevar.ihub.common.core.constant.CacheConstants.IHUB_TRANSLATION_CACHE_KEY;

/**
 * @author Teoan
 * @since 2025/7/24 11:46
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AgentsServiceImpl extends ServiceImpl<Agent> implements IAgentsService, IAgentTranslationService {

    private final IStarService starService;
    private final IForkService forkService;
    private final IFollowService followService;
    private final IAgentReleaseService agentReleaseService;
    private final Converter converter;
    private final LiteAgentServiceClient agentServiceClient;
    private final VectorStoreService vectorStoreService;
    private final IAgentLicenseService licenseService;
    private final AgentFileUtils agentFileUtils;
    private final String AGENT_ID = "agentId";

    /**
     * 创建Agent
     *
     * @param agentDTO AgentDTO
     */
    @Override
    @LogRecord(actionType = UserActionType.CREATE_AGENT, targetAgentId = "#agentDTO.id")
    public AgentDTO createAgent(CreateAgentDTO agentDTO) {
        Agent one = lambdaQuery().eq(Agent::getAuthorId, LoginHelper.getCurrentUserId()).eq(Agent::getName, agentDTO.getName()).one();
        if (ObjUtil.isNotNull(one)) {
            throw new BusinessException(ErrorCode.AGENT_ALREADY_EXISTS);
        }

        Agent agent = converter.convert(agentDTO, Agent.class);
        //对整个ihub_agent.md进行保存，如果是公开的agent 将内容embedding后存储
        if (BooleanUtil.isTrue(agentDTO.getIsPublic())) {
            String mdContent = agentDTO.getMdContent();
            String documentId = vectorStoreService.addDocuments(mdContent, Map.of(AGENT_ID, agent.getId()));
            agent.setDocumentId(documentId);
        }
        LoginUser currentUser = LoginHelper.getCurrentUser();
        agent.setAuthorId(currentUser.getId());
        // 目前默认为LITE_AGENT
        agent.setPlatform(PlatformType.LITE_AGENT);
        save(agent);
        // 保存license
        AgentLicenseDTO licenseDTO = agentDTO.getLicense();
        AgentDTO resultDTO = converter.convert(agent, AgentDTO.class);
        if(ObjUtil.isNotNull(licenseDTO)){
            AgentLicense license = converter.convert(licenseDTO, AgentLicense.class);
            license.setAgentId(agent.getId());
            licenseService.save(license);
            licenseDTO = converter.convert(license, AgentLicenseDTO.class);
            resultDTO.setLicense(licenseDTO);
        }
        return resultDTO;
    }


    /**
     * 根据关键词搜索Agent
     *
     * @param keyWord
     */
    @Override
    public List<AgentDTO> searchAgentByKeyWord(String keyWord) {
        // 调用agent提取关键字
        log.debug("发送关键词agent信息:{}", keyWord);
        String agentKeyWord = agentServiceClient.chatAgent(AgentClientType.KEYWORDS, keyWord);
        log.debug("接收关键词agent信息:{}", agentKeyWord);
        // 默认返回 top 10 个结果
        List<Document> documents = vectorStoreService.findDocuments(agentKeyWord, 10,0.5);
        // 按照相似度得分从高到低排序
        List<Agent> agentList = documents.stream().map(document ->
                getById(MapUtil.getStr(document.getMetadata(), AGENT_ID))).filter(ObjUtil::isNotNull).toList();
        return agentList.stream().map(this::buildAgentDTO).toList();
    }

    /**
     * 获取公共Agent列表
     *
     * @param pageNum
     * @param pageSize
     * @param search
     * @param platform
     * @param category
     * @param sort
     * @param tags
     */
    @Override
    public PageResult<AgentDTO> getPublicAgents(Integer pageNum, Integer pageSize, String search, PlatformType platform, String category, String sort, List<String> tags) {

        // 构建查询条件
        var wrapper = this.lambdaQuery()
                .eq(Agent::getIsPublic, true);
        List<String> userIds = new ArrayList<>();
        if(StrUtil.isNotBlank(search)){
            userIds = ChainWrappers.lambdaQueryChain(baseMapper,User.class)
                    .or(wrapper1 -> wrapper1.like(User::getUserName, search))
                    .or(wrapper2 -> wrapper2.like(User::getNickName, search))
                    .list().stream().map(User::getId).toList();
        }

        // 添加搜索条件
        List<String> finalUserIds = userIds;
        wrapper.or(StrUtil.isNotBlank(search), wrapper1 -> wrapper1.like(Agent::getName, search)
                .or(StrUtil.isNotBlank(search), wrapper2 -> wrapper2.like(Agent::getDescription, search))
                .or(CollUtil.isNotEmpty(finalUserIds), wrapper3 -> wrapper3.in(Agent::getAuthorId, finalUserIds)));
        // 添加平台类型条件
        wrapper.eq(ObjUtil.isNotNull(platform), Agent::getPlatform, platform);

        // 添加分类条件
        wrapper.eq(StrUtil.isNotBlank(category), Agent::getCategory, category);


        // 添加标签条件
        if (CollUtil.isNotEmpty(tags)) {
            tags.forEach(tag -> wrapper.like(Agent::getTags, tag));
        }
        // 添加排序条件
        if (StrUtil.isNotBlank(sort)) {
            switch (sort.toLowerCase()) {
                case "stars":
                    wrapper.orderByDesc(Agent::getStars);
                    break;
                case "forks":
                    wrapper.orderByDesc(Agent::getForks);
                    break;
                case "views":
                    wrapper.orderByDesc(Agent::getViews);
                    break;
                case "newest":
                    wrapper.orderByDesc(Agent::getCreateTime);
                    break;
                case "oldest":
                    wrapper.orderByAsc(Agent::getCreateTime);
                    break;
                default:
                    wrapper.orderByDesc(Agent::getCreateTime);
                    break;
            }
        } else {
            // 默认按创建时间倒序排列
            wrapper.orderByDesc(Agent::getCreateTime);
        }

        PageResult<AgentDTO> page = page(wrapper, pageNum, pageSize, AgentDTO.class);
        return setAgentInfo(page);
    }


    /**
     * 获取热门Agent列表
     *
     * @param pageNum
     * @param pageSize
     * @param platform
     */
    @Override
    public PageResult<AgentDTO> getTrendingAgents(Integer pageNum, Integer pageSize, PlatformType platform) {
        // 构建查询条件
        var wrapper = this.lambdaQuery()
                .eq(Agent::getIsPublic, true);

        if (ObjUtil.isNotNull(platform)) {
            wrapper.eq(Agent::getPlatform, platform);
        }
        wrapper
                .orderByDesc(Agent::getStars)
                .orderByDesc(Agent::getViews)
                .orderByDesc(Agent::getForks)
                .orderByDesc(Agent::getUpdateTime);
        PageResult<AgentDTO> page = page(wrapper, pageNum, pageSize, AgentDTO.class);
        return setAgentInfo(page);
    }


    /**
     * 更新Agent信息
     *
     * @param agentDTO
     */
    @Override
    public void updateAgent(UpdateAgentDTO agentDTO) {
        Agent agent = getById(agentDTO.getId());

        if (!agent.getAuthorId().equals(LoginHelper.getCurrentUserId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "您没有权限修改此Agent!");
        }

//        MdAgentInfoDTO mdAgentInfoDTO = AgentMarkdownParser.parse(agentDTO.getMdContent());
//        MdAgentInfoValidator.validateMdAgentInfo(mdAgentInfoDTO,StrUtil.format("Agent[{}]", mdAgentInfoDTO.getName()));




        Agent one = lambdaQuery().eq(Agent::getAuthorId, LoginHelper.getCurrentUserId())
                .eq(Agent::getName, agentDTO.getName()).ne(Agent::getId, agentDTO.getId()).one();

        if (ObjUtil.isNotNull(one)) {
            throw new BusinessException(ErrorCode.AGENT_ALREADY_EXISTS);
        }


        if (agentDTO.getIsPublic()) {
            String mdContent = agentDTO.getMdContent();
            if(StrUtil.isNotBlank(agent.getDocumentId())){
                vectorStoreService.deleteDocuments(List.of(agent.getDocumentId()));
            }
            String documentId = vectorStoreService.addDocuments(mdContent, Map.of(AGENT_ID, agent.getId()));
            agent.setDocumentId(documentId);
        }
        Agent updateAgent = converter.convert(agentDTO, agent);
        updateById(updateAgent);
        // 更新license
        if(ObjUtil.isNotNull(agentDTO.getLicense())){
            AgentLicense license = converter.convert(agentDTO.getLicense(), AgentLicense.class);
            licenseService.updateById(license);
        }
        // 删除翻译缓存
        RedisUtils.delete(StrUtil.format(IHUB_TRANSLATION_CACHE_KEY,agent.getId()));
    }


    /**
     * 获取用户 agent 列表
     *
     * @param userId
     * @param pageNum
     * @param pageSize
     */
    @Override
    public PageResult<AgentDTO> listAgentsByAuthor(String userId, String userName, String sort,String search, Integer pageNum, Integer pageSize) {
        if (StrUtil.isNotBlank(userName)) {
            User user = ChainWrappers.lambdaQueryChain(baseMapper, User.class).eq(User::getUserName, userName).one();
            if (ObjUtil.isEmpty(user)) {
                throw new BusinessException(ErrorCode.USER_NOT_FOUND);
            }
            userId = user.getId();
        }

        // 构建查询条件
        var wrapper = this.lambdaQuery()
                .eq(Agent::getAuthorId, userId);

        wrapper.or(StrUtil.isNotBlank(search), wrapper1 -> wrapper1.like(Agent::getName, search)
                .or(StrUtil.isNotBlank(search), wrapper2 -> wrapper2.like(Agent::getDescription, search)));


        // 添加排序条件
        PageResult<AgentDTO> page = sortPage(sort, pageNum, pageSize, wrapper);
        return setAgentInfo(page);
    }

    private PageResult<AgentDTO> sortPage(String sort, Integer pageNum, Integer pageSize, LambdaQueryChainWrapper<Agent> wrapper) {
        if (StrUtil.isNotBlank(sort)) {
            switch (sort) {
                case "stars":
                    wrapper.orderByDesc(Agent::getStars);
                    break;
                case "forks":
                    wrapper.orderByDesc(Agent::getForks);
                    break;
                case "views":
                    wrapper.orderByDesc(Agent::getViews);
                    break;
                case "createTime":
                    wrapper.orderByDesc(Agent::getCreateTime);
                    break;
                case "updateTime":
                    wrapper.orderByDesc(Agent::getUpdateTime);
                    break;
                default:
                    wrapper.orderByDesc(Agent::getCreateTime);
                    break;
            }
        } else {
            // 默认按创建时间倒序排列
            wrapper.orderByDesc(Agent::getCreateTime);
        }

        return page(wrapper, pageNum, pageSize, AgentDTO.class);
    }


    /**
     * 检查Agent是否已被收藏
     *
     * @param agentId
     */
    @Override
    public boolean isStarredAgent(String agentId) {
        String userId = LoginHelper.getCurrentUserId();
        return starService.exist(starService.lambdaQuery().eq(Star::getUserId, userId).eq(Star::getAgentId, agentId));
    }

    /**
     * 获取用户收藏的Agent列表
     *
     * @param userId
     * @param pageNum
     * @param pageSize
     * @param search
     * @param platform
     * @param category
     * @param sort
     */
    @Override
    public PageResult<AgentDTO> listStarredAgents(String userId, Integer pageNum, Integer pageSize, String search, PlatformType platform, String category, String sort) {
        if (StrUtil.isBlank(userId)) {
            userId = LoginHelper.getCurrentUserId();
        }
        List<String> starAgentId = starService.list(starService.lambdaQuery().eq(Star::getUserId, userId)).stream().map(Star::getAgentId).toList();

        // 构建查询条件
        var wrapper = this.lambdaQuery().in(Agent::getId, starAgentId);

        // 添加搜索条件
        wrapper.or(StrUtil.isNotBlank(search), wrapper1 -> wrapper1.like(Agent::getName, search)
                .or(StrUtil.isNotBlank(search), wrapper2 -> wrapper2.like(Agent::getDescription, search)));
        // 添加平台类型条件
        wrapper.eq(ObjUtil.isNotNull(platform), Agent::getPlatform, platform);

        // 添加分类条件
        wrapper.eq(StrUtil.isNotBlank(category), Agent::getCategory, category);

        // 添加排序条件
        PageResult<AgentDTO> page = sortPage(sort, pageNum, pageSize, wrapper);
        return setAgentInfo(page);
    }

    /**
     * 取消收藏Agent
     * @param agentDTO agent DTO
     * @return boolean
     */
    @Override
    @LogRecord(actionType = UserActionType.UNSTAR_AGENT, targetAgentId = "#agentDTO.id")
    public boolean unStarAgent(AgentDTO agentDTO) {
        Boolean exist = isStarredAgent(agentDTO.getId());
        if (BooleanUtil.isTrue(exist)) {
            String userId = LoginHelper.getCurrentUserId();
            starService.remove(starService.lambdaUpdate().eq(Star::getUserId, userId).eq(Star::getAgentId, agentDTO.getId()));
            Agent agent = getById(agentDTO.getId());
            lambdaUpdate().eq(Agent::getId, agent.getId()).set(Agent::getStars, agent.getStars() - 1).update();
        }
        return true;
    }

    /**
     * 收藏Agent
     * @param agentDTO agent DTO
     * @return boolean
     */
    @Override
    @LogRecord(actionType = UserActionType.STAR_AGENT, targetAgentId = "#agentDTO.id")
    public boolean starAgent(AgentDTO agentDTO) {
        Boolean exist = isStarredAgent(agentDTO.getId());

        if (BooleanUtil.isFalse(exist)) {
            String userId = LoginHelper.getCurrentUserId();
            Star star = Star.builder()
                    .userId(userId)
                    .agentId(agentDTO.getId())
                    .build();
            starService.save(star);
            Agent agent = getById(agentDTO.getId());
            lambdaUpdate().eq(Agent::getId, agent.getId()).set(Agent::getStars, agent.getStars() + 1).update();
        }
        return true;
    }


    /**
     * Fork Agent
     * @param agent agent
     * @param forkRequestDTO fork request DTO
     * @return AgentDTO
     */
    @Override
    @LogRecord(actionType = UserActionType.FORK_AGENT, targetAgentId = "#agent.id",targetUserId = "#agent.authorId")
    public AgentDTO forkAgent(Agent agent, ForkRequestDTO forkRequestDTO) {
        String userId = LoginHelper.getCurrentUserId();
        // 创建Fork的Agent

        if (ObjUtil.isNull(agent.getIsPublic()) || !agent.getIsPublic()) {
            throw new BusinessException("fork 的 Agent 不是公开Agent!");
        }
        if (agent.getAuthorId().equals(userId)) {
            throw new BusinessException("不能 fork 自己的Agent!");
        }


        // ID 设置为 null 重新生成
        Agent cloneAgent = ObjUtil.clone(agent);
        cloneAgent.setId(null);
        String newAgentName = StrUtil.isBlank(forkRequestDTO.getName()) ? agent.getName() + "(Fork)" : forkRequestDTO.getName();
        Agent one = lambdaQuery().eq(Agent::getAuthorId, LoginHelper.getCurrentUserId()).eq(Agent::getName, newAgentName).one();
        if (ObjUtil.isNotNull(one)) {
            throw new BusinessException(ErrorCode.AGENT_ALREADY_EXISTS);
        }
        if(CollUtil.isNotEmpty(agent.getDocsFileIdList())){
            cloneAgent.setDocsFileIdList(agent.getDocsFileIdList().stream().map(agentFileUtils::copyFile).toList());
        }
        if(CollUtil.isNotEmpty(agent.getToolFileIdList())){
            cloneAgent.setToolFileIdList(agent.getToolFileIdList().stream().map(agentFileUtils::copyFile).toList());
        }
        String newDescription = StrUtil.isBlank(forkRequestDTO.getDescription()) ? agent.getDescription() : forkRequestDTO.getDescription();
        cloneAgent.setName(newAgentName);
        cloneAgent.setDescription(newDescription);
        cloneAgent.setUpdateTime(null);
        cloneAgent.setAuthorId(userId);
        cloneAgent.setForks(0);
        cloneAgent.setStars(0);
        cloneAgent.setViews(0);
        cloneAgent.setForks(0);


        // 保存Fork的Agent
        save(cloneAgent);

        // 创建Fork记录
        Fork fork = Fork.builder().userId(userId)
                .forkedAgentId(cloneAgent.getId())
                .originalAgentAuthorId(agent.getAuthorId())
                .originalAgentId(agent.getId())
                .build();
        forkService.save(fork);
        // 更新原始Agent的Fork计数
        lambdaUpdate().eq(Agent::getId, agent.getId()).set(Agent::getForks, agent.getForks() + 1).update();

        AgentDTO agentDTO = converter.convert(cloneAgent, AgentDTO.class);
        agentDTO.setForkInfo(converter.convert(fork, ForkDTO.class));
        return agentDTO;
    }

    /**
     * 获取Agent的Fork数量
     *
     * @param agentId
     */
    @Override
    public Integer countForks(String agentId) {
        Agent agent = getById(agentId);
        Optional.ofNullable(agent).orElseThrow(() -> new BusinessException(ErrorCode.AGENT_NOT_FOUND));
        return agent.getForks();
    }


    /**
     * 根据ID获取Agent
     *
     * @param agentId
     */
    @Override
    public AgentDTO getAgentById(String agentId) {
        Agent agent = getById(agentId);
        if (ObjUtil.isEmpty(agent)) {
            throw new BusinessException(ErrorCode.AGENT_NOT_FOUND);
        }
        // 访问权限控制
        if(BooleanUtil.isFalse(agent.getIsPublic())){
            if(!LoginHelper.getCurrentUserId().equals(agent.getAuthorId())){
                throw new BusinessException(ErrorCode.FORBIDDEN);
            }
        }

        // 浏览数加1
        lambdaUpdate().eq(Agent::getId, agent.getId()).set(Agent::getViews, agent.getViews() + 1).update();
        return buildAgentDTO(agent);
    }


    /**
     * 根据用户名和agent名称获取指定的Agent
     * @param agentName agent name
     * @param userName user name
     * @return AgentDTO
     */
    @Override
    public AgentDTO getAgentByUserNameAndAgentName(String agentName, String userName) {
        User user = ChainWrappers.lambdaQueryChain(baseMapper, User.class).eq(User::getUserName, userName).one();
        if (ObjUtil.isEmpty(user)) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }
        Agent agent = this.lambdaQuery().eq(Agent::getName, agentName).eq(Agent::getAuthorId, user.getId()).one();
        if (ObjUtil.isEmpty(agent)) {
            throw new BusinessException(ErrorCode.AGENT_NOT_FOUND);
        }

        // 访问权限控制
        if(BooleanUtil.isFalse(agent.getIsPublic())){
            if(!LoginHelper.getCurrentUserId().equals(agent.getAuthorId())){
                throw new BusinessException(ErrorCode.FORBIDDEN);
            }
        }

        // 浏览数加1
        lambdaUpdate().eq(Agent::getId, agent.getId()).set(Agent::getViews, agent.getViews() + 1).update();
        return buildAgentDTO(agent);
    }

    /**
     * 构建AgentDTO对象
     * 
     * @param agent Agent实体
     * @return AgentDTO
     */
    private AgentDTO buildAgentDTO(Agent agent) {
        AgentDTO agentDTO = converter.convert(agent, AgentDTO.class);
        ForkDTO info = forkService.getForkInfoByAgentId(agent.getId());
        agentDTO.setForkInfo(info);
        AgentLicenseDTO licenseDTO = licenseService.getLicenseInfoByAgentId(agent.getId());
        agentDTO.setLicense(licenseDTO);
        List<String> starAgentList = starService.getStarAgentListByUserId(LoginHelper.getCurrentUserId());
        agentDTO.setIsStarred(starAgentList.contains(agent.getId()));
        return agentDTO;
    }

    /**
     * 统计用户的Agent数量
     *
     * @param userId
     */
    @Override
    public Long getAgentCountByUserId(String userId,Boolean allAgent) {
        if (BooleanUtil.isTrue(allAgent)) {
            return count(lambdaQuery().eq(Agent::getAuthorId, userId));
        }
        return count(lambdaQuery().eq(Agent::getAuthorId, userId).eq(Agent::getIsPublic, true));
    }


    /**
     * 获取用户的Agent的总浏览数
     *
     * @param userId
     */
    @Override
    public Long getAgentViewsByUserId(String userId) {
        return Convert.toLong(list(lambdaQuery().eq(Agent::getAuthorId, userId)).stream().map(Agent::getViews).reduce(Integer::sum).orElse(0));
    }


    /**
     * 导入Agent
     * @param file file
     * @return AgentDTO
     */
    @Override
    public AgentDTO importAgent(MultipartFile file) {
        if (ObjUtil.isEmpty(file)) {
            throw new BusinessException(ErrorCode.FILE_UPLOAD_ERROR, "上传文件不能为空");
        }
        if (!"agent".equalsIgnoreCase(FileUtil.extName(file.getOriginalFilename()))) {
            throw new BusinessException(ErrorCode.FILE_UPLOAD_ERROR, "请上传一个 agent 格式的文件。");
        }

        CreateAgentDTO agentDTO = agentFileUtils.handleImport(file);

        // 创建Agent
        return createAgent(agentDTO);

    }


    /**
     * 导出Agent
     * @param agentId agent id
     * @return ResponseEntity<Resource>
     * @throws IOException IOException
     */
    @Override
    public ResponseEntity<Resource> exportAgent(String agentId) throws IOException {
        // 获取Agent信息
        Agent agent = getById(agentId);
        if (agent == null) {
            throw new BusinessException(ErrorCode.AGENT_NOT_FOUND);
        }
        
        // 创建字节数组输出流来存储ZIP数据
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        ZipOutputStream zipOut = new ZipOutputStream(byteArrayOutputStream);
        
        // 处理导出
        agentFileUtils.handleExport(agent, zipOut);
        zipOut.finish();
        zipOut.close();
        
        // 创建资源
        byte[] zipData = byteArrayOutputStream.toByteArray();
        ByteArrayResource resource = new ByteArrayResource(zipData);
        
        // 设置响应头
        String filename = URLEncodeUtil.encode(agent.getName()) + ".agent";
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .contentLength(zipData.length)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(resource);
    }


    /**
     * 发布Agent
     * @param agentDTO agent DTO
     * @return boolean
     */
    @Override
    @LogRecord(actionType = UserActionType.PUBLISH_AGENT, targetAgentId = "#agentDTO.id")
    public boolean publishAgent(PublishAgentDTO agentDTO) {
        Agent agent = getById(agentDTO.getId());
        Optional.ofNullable(agent).orElseThrow(() -> new BusinessException(ErrorCode.AGENT_NOT_FOUND));
        // 检查当前用户是否是Agent的作者
        String currentUserId = LoginHelper.getCurrentUserId();
        if (!currentUserId.equals(agent.getAuthorId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "您没有权限修改此Agent的发布状态");
        }

        // 保存发布信息
        AgentRelease agentRelease = new AgentRelease();
        agentRelease.setAgentId(agentDTO.getId());
        agentRelease.setVersion(agentDTO.getVersion());
        agentRelease.setReleaseNotes(agentDTO.getReleaseNotes());
        agentReleaseService.save(agentRelease);

        // 更新agent的版本号
        agent.setVersion(agentDTO.getVersion());
        agent.setIsPublished(true);

        return updateById(agent);
    }


    /**
     * 分页获取fork了某个agent的agent列表
     *
     * @param originalAgentId 原始Agent ID
     * @param pageNum         页码
     * @param pageSize        每页数量
     * @return 分页结果
     */
    @Override
    public PageResult<AgentDTO> listForkedAgents(String originalAgentId, Integer pageNum, Integer pageSize) {
        // 首先验证原始agent是否存在
        Agent originalAgent = getById(originalAgentId);
        if (ObjUtil.isNull(originalAgent)) {
            throw new BusinessException(ErrorCode.AGENT_NOT_FOUND);
        }

        // 获取所有fork记录
        List<Fork> forkList = forkService.lambdaQuery()
                .eq(Fork::getOriginalAgentId, originalAgentId)
                .list();
        
        // 获取所有forked agent的ID
        List<String> forkedAgentIds = forkList.stream()
                .map(Fork::getForkedAgentId)
                .toList();
        
        if (CollUtil.isEmpty(forkedAgentIds)) {
            // 如果没有forked agents，返回空结果
            return new PageResult<>();
        }
        
        // 查询这些agents
        PageResult<AgentDTO> pageResult = page(
                lambdaQuery().in(Agent::getId, forkedAgentIds)
                        .orderByDesc(Agent::getCreateTime),
                pageNum, pageSize, AgentDTO.class);
        
        return setAgentInfo(pageResult);
    }


    /**
     * 为PageResult中的AgentDTO列表设置starred标记和fork信息
     *
     * @param page PageResult<AgentDTO>
     * @return PageResult<AgentDTO> 处理后的结果
     */
    private PageResult<AgentDTO> setAgentInfo(PageResult<AgentDTO> page) {
        List<String> agentIdList = page.getContentData().stream().map(AgentDTO::getId).toList();
        List<String> starAgentList = starService.getStarAgentListByUserId(LoginHelper.getCurrentUserId());
        Map<String, ForkDTO> forkMap = forkService.getForkInfoByAgentIdList(agentIdList);
        Map<String, AgentLicenseDTO> licenseMap = licenseService.getLicenseInfoByAgentIdList(agentIdList);
        page.getContentData().forEach(agentDTO -> {
                    agentDTO.setIsStarred(starAgentList.contains(agentDTO.getId()));
                    agentDTO.setForkInfo(forkMap.getOrDefault(agentDTO.getId(), null));
                    agentDTO.setLicense(licenseMap.getOrDefault(agentDTO.getId(), null));
                }
        );
        return page;
    }


    /**
     * 下载agent的md内容
     *
     * @param agentId Agent ID
     */
    @Override
    public ResponseEntity<Resource> downloadAgentMarkdown(String agentId) {
        // 获取Agent信息
        Agent agent = getById(agentId);
        if (agent == null) {
            throw new BusinessException(ErrorCode.AGENT_NOT_FOUND);
        }
        // 设置响应头
        MediaType mediaType = MediaType.valueOf("text/markdown");
        String filename = URLEncoder.encode(agent.getName() + ".md", StandardCharsets.UTF_8);
        String markdownContent = agent.getMdContent();
        Resource resource = new ByteArrayResource(markdownContent.getBytes(StandardCharsets.UTF_8));
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
    }


    /**
     * 获取Agent的收藏用户列表
     * @param agentId agent id
     * @param pageNum page number
     * @param pageSize page size
     * @return PageResult<UserDTO>
     */
    @Override
    public PageResult<UserDTO> getAgentStarUsers(String agentId, Integer pageNum, Integer pageSize) {
        LambdaQueryChainWrapper<Star> wrapper = ChainWrappers.lambdaQueryChain(baseMapper, Star.class).eq(Star::getAgentId, agentId);
        PageResult<Star> page = starService.page(wrapper, pageNum, pageSize);
        // 查询用户
        String currentUserId = LoginHelper.getCurrentUserId();
        List<String> userIdList = page.getContentData().stream().map(Star::getUserId).toList();
        return buildUserPageResult(page, userIdList, currentUserId);
    }

    /**
     * 获取Agent的fork用户列表
     * @param agentId agent id
     * @param pageNum page number
     * @param pageSize page size
     * @return PageResult<UserDTO>
     */
    @Override
    public PageResult<UserDTO> getAgentForkUsers(String agentId, Integer pageNum, Integer pageSize) {
        LambdaQueryChainWrapper<Fork> wrapper = ChainWrappers.lambdaQueryChain(baseMapper, Fork.class).eq(Fork::getOriginalAgentId, agentId);
        PageResult<Fork> page = forkService.page(wrapper, pageNum, pageSize);
        // 查询用户
        String currentUserId = LoginHelper.getCurrentUserId();
        List<String> userIdList = page.getContentData().stream().map(Fork::getUserId).toList();
        return buildUserPageResult(page, userIdList, currentUserId);
    }

    /**
     * 构建用户分页结果
     *
     * @param page         原始分页结果
     * @param userIdList   用户ID列表
     * @param currentUserId 当前用户ID
     * @return 用户分页结果
     */
    private PageResult<UserDTO> buildUserPageResult(PageResult<? extends BaseEntity> page, List<String> userIdList, String currentUserId) {
        PageResult<UserDTO> userPage = new PageResult<>();
        BeanUtil.copyProperties(page, userPage);
        List<UserDTO> userDTOS = ChainWrappers.lambdaQueryChain(baseMapper, User.class).in(User::getId, userIdList).list().stream()
                .map(user -> {
                    UserDTO userDTO = converter.convert(user, UserDTO.class);
                    userDTO.setFollowing(followService.isFollowing(currentUserId, user.getId()));
                    return userDTO;
                }).toList();
        userPage.setContentData(userDTOS);
        return userPage;
    }


    /**
     * 删除 Agent
     *
     * @param agentId
     */
    @Override
    @LogRecord(actionType = UserActionType.DELETE_AGENT, targetAgentId = "#agentId")
    public void deleteAgent(String agentId) {
        // 获取Agent信息
        Agent agent = getById(agentId);
        if (agent == null) {
            throw new BusinessException(ErrorCode.AGENT_NOT_FOUND);
        }
        // 原agent fork数减一
        ForkDTO forkInfo = forkService.getForkInfoByAgentId(agentId);
        if(ObjUtil.isNotNull(forkInfo)){
            // 更新原始Agent的Fork计数
            lambdaUpdate().eq(Agent::getId, forkInfo.getOriginalAgentId()).set(Agent::getForks, agent.getForks() - 1).update();
        }
        forkService.remove(ChainWrappers.lambdaUpdateChain(baseMapper,Fork.class).eq(Fork::getForkedAgentId,agentId));
        starService.remove(ChainWrappers.lambdaUpdateChain(baseMapper,Star.class).eq(Star::getAgentId,agentId));
        agentReleaseService.remove(ChainWrappers.lambdaUpdateChain(baseMapper,AgentRelease.class).eq(AgentRelease::getAgentId,agentId));
        licenseService.remove(ChainWrappers.lambdaUpdateChain(baseMapper,AgentLicense.class).eq(AgentLicense::getAgentId,agentId));
        if(StrUtil.isNotBlank(agent.getDocumentId())){
            vectorStoreService.deleteDocuments(List.of(agent.getDocumentId()));
        }
        removeById(agentId);
    }


    /**
     * 获取agent字段值
     * @param id agent ID
     * @param fieldName 字段名
     * @return 字段值
     */
    @Override
    public Object getFieldValue(Object id, String fieldName) {
        AtomicReference<Object> result = new AtomicReference<>();
        // 翻译时忽略逻辑删除
        LogicManager.withoutLogic(() -> {
            Agent agent = getById((Serializable) id);
            if (ObjUtil.isNotNull(agent)) {
                result.set(ReflectUtil.getFieldValue(agent, fieldName)) ;
            }
        });
        return result.get();
    }


    /**
     * 删除 Agent 文件
     *
     * @param agentId Agent ID
     * @param fileId 文件ID
     */
    @Override
    public boolean deleteAgentFile(String agentId, String fileId) {
        // 获取Agent信息
        Agent agent = getById(agentId);
        if (agent == null) {
            throw new BusinessException(ErrorCode.AGENT_NOT_FOUND);
        }
        agent.getToolFileIdList().remove(fileId);
        agent.getDocsFileIdList().remove(fileId);
        agentFileUtils.removeByIds(List.of(fileId));
        updateById(agent);
        return true;
    }
}