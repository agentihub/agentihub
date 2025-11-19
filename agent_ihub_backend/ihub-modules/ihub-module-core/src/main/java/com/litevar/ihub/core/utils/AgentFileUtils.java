package com.litevar.ihub.core.utils;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.codec.Base64;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.io.IoUtil;
import cn.hutool.core.util.IdUtil;
import cn.hutool.core.util.ObjUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.core.util.ZipUtil;
import cn.hutool.json.JSONConfig;
import cn.hutool.json.JSONUtil;
import com.litevar.ihub.common.web.exception.BusinessException;
import com.litevar.ihub.common.web.exception.ErrorCode;
import com.litevar.ihub.core.dto.CreateAgentDTO;
import com.litevar.ihub.core.entity.Agent;
import com.litevar.ihub.core.entity.User;
import com.litevar.ihub.core.enums.PlatformType;
import com.litevar.ihub.file.dto.*;
import com.litevar.ihub.file.entity.FileInfo;
import com.litevar.ihub.file.enums.ModelType;
import com.litevar.ihub.file.enums.SchemaType;
import com.litevar.ihub.file.markdown.AgentMarkdownGenerator;
import com.litevar.ihub.file.markdown.AgentMarkdownParser;
import com.litevar.ihub.file.service.IFileInfoService;
import com.litevar.ihub.file.util.MdAgentInfoValidator;
import com.mongoplus.mapper.BaseMapper;
import com.mongoplus.toolkit.ChainWrappers;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import java.util.zip.ZipOutputStream;

import static com.litevar.ihub.file.constant.DirConstants.*;


/**
 * agent 导入导出处理类
 *
 * @author Teoan
 * @since 2025/9/28 11:43
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AgentFileUtils {


    private final IFileInfoService fileInfoService;
    private final BaseMapper baseMapper;

    /**
     * 导出信息缓存，用于模型、知识库、工具的合并
     */
    private final Map<String, String> exportInfoMap = new HashMap<>();


    /**
     * 导出处理
     *
     * @param agent
     */
    public void handleExport(Agent agent, ZipOutputStream zipOut) {
        MdAgentInfoDTO mdAgentInfoDTO = AgentMarkdownParser.parse(agent.getMdContent());

        // 递归校验mdAgentInfoDTO中的内容
        MdAgentInfoValidator.validateExportMdAgentInfo(mdAgentInfoDTO, StrUtil.format("agent[{}]", mdAgentInfoDTO.getName()));
        User one = ChainWrappers.lambdaQueryChain(baseMapper, User.class).eq(User::getId, agent.getAuthorId()).one();
        try {
            List<FileInfo> toolsFileInfoList = fileInfoService.getByIds(agent.getToolFileIdList()).stream().toList();
            List<FileInfo> docsFileInfoList = fileInfoService.getByIds(agent.getDocsFileIdList()).stream().toList();
            // 1. 添加 metadata.json
            FileAgentMetadataDTO metadataDTO = FileAgentMetadataDTO.builder()
                    .agent(agent.getName())
                    .version(agent.getVersion())
                    .author(one.getUserName())
                    .createTime(agent.getCreateTime())
                    .build();
            addZipEntry("metadata.json", JSONUtil.toJsonStr(metadataDTO,
                    JSONConfig.create().setDateFormat("yyyy-MM-dd HH:mm:ss")), zipOut);

            // 处理agent信息
            exportInfoMap.clear();
            FileAgentDTO fileAgentDTO = processAgentInfo(mdAgentInfoDTO, toolsFileInfoList, docsFileInfoList, zipOut);

            //  处理子agent
            processSubAgents(mdAgentInfoDTO.getSubAgents(), fileAgentDTO, zipOut, toolsFileInfoList, docsFileInfoList);

            fileAgentDTO.setId(IdUtil.getSnowflakeNextIdStr());
            fileAgentDTO.setDescription(agent.getDescription());
            fileAgentDTO.setType(mdAgentInfoDTO.getType());
            fileAgentDTO.setName(agent.getName());
            fileAgentDTO.setPrompt(mdAgentInfoDTO.getPrompt());
            fileAgentDTO.setMode(mdAgentInfoDTO.getMode());
            addZipEntry(agent.getName() + ".json", JSONUtil.toJsonStr(fileAgentDTO), zipOut);
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.FILE_DOWNLOAD_ERROR, "导出失败:" + e.getMessage());
        }
    }

    /**
     * 递归处理子agent导出
     *
     * @param subAgentDTO       子agent信息
     * @param subAgentId        子agent ID
     * @param zipOut            ZIP输出流
     * @param toolsFileInfoList 工具文件信息列表
     * @param docsFileInfoList  文档文件信息列表
     */
    private void handleSubAgentExport(MdAgentInfoDTO subAgentDTO, String subAgentId, ZipOutputStream zipOut, List<FileInfo> toolsFileInfoList, List<FileInfo> docsFileInfoList) throws IOException {
        // 处理agent信息
        FileAgentDTO fileAgentDTO = processAgentInfo(subAgentDTO, toolsFileInfoList, docsFileInfoList, zipOut);

        // 处理子agent的子agent
        processSubAgents(subAgentDTO.getSubAgents(), fileAgentDTO, zipOut, toolsFileInfoList, docsFileInfoList);

        fileAgentDTO.setId(subAgentId);
        fileAgentDTO.setDescription(subAgentDTO.getDescription());
        fileAgentDTO.setType(subAgentDTO.getType());
        fileAgentDTO.setName(subAgentDTO.getName());
        fileAgentDTO.setPrompt(subAgentDTO.getPrompt());
        fileAgentDTO.setMode(subAgentDTO.getMode());

        // 将子agent的JSON内容写入到multiagent目录，文件名为agent的id
        addZipEntry(MULTIAGENT_DIR + File.separator + subAgentId + ".json", JSONUtil.toJsonStr(fileAgentDTO), zipOut);
    }

    /**
     * 处理子agent列表
     *
     * @param subAgents         子agent列表
     * @param fileAgentDTO      父agent DTO
     * @param zipOut            ZIP输出流
     * @param toolsFileInfoList 工具文件信息列表
     * @param docsFileInfoList  文档文件信息列表
     */
    private void processSubAgents(List<MdAgentInfoDTO> subAgents, FileAgentDTO fileAgentDTO, ZipOutputStream zipOut, List<FileInfo> toolsFileInfoList, List<FileInfo> docsFileInfoList) throws IOException {
        if (CollUtil.isNotEmpty(subAgents)) {
            List<String> subAgentIds = new ArrayList<>();
            for (MdAgentInfoDTO subAgent : subAgents) {
                // 为每个子agent生成ID
                String subAgentId = IdUtil.getSnowflakeNextIdStr();
                subAgentIds.add(subAgentId);
                // 递归处理子agent
                handleSubAgentExport(subAgent, subAgentId, zipOut, toolsFileInfoList, docsFileInfoList);
            }
            fileAgentDTO.setSubAgentIds(subAgentIds);
        }
    }

    /**
     * 处理agent信息（工具、模型、知识库）
     *
     * @param agentInfoDTO      agent信息
     * @param toolsFileInfoList 工具文件信息列表
     * @param docsFileInfoList  文档文件信息列表
     * @param zipOut            ZIP输出流
     * @return 处理后的FileAgentDTO对象
     */
    private FileAgentDTO processAgentInfo(MdAgentInfoDTO agentInfoDTO, List<FileInfo> toolsFileInfoList, List<FileInfo> docsFileInfoList, ZipOutputStream zipOut) throws IOException {
        FileAgentDTO fileAgentDTO = new FileAgentDTO();

        // 处理tools
        if (CollUtil.isNotEmpty(agentInfoDTO.getTools())) {
            // 导出时重新生成文件id
            List<FileAgentDTO.Function> fileFunctionList = new ArrayList<>();
            for (MdAgentInfoDTO.Tool tool : agentInfoDTO.getTools()) {
                FileToolDTO fileToolDTO = new FileToolDTO();
                BeanUtil.copyProperties(tool, fileToolDTO);
                fileToolDTO.setSchemaType(tool.getSchemaType().getCode());
                // 获取schema文稿内容
                toolsFileInfoList.stream().filter(fileInfo -> fileInfo.getFileName().equals(tool.getSchemaFileName())).findFirst().ifPresent(fileInfo -> {
                    fileToolDTO.setSchemaStr(FileUtil.readUtf8String(fileInfo.getFilePath()));
                });
                // 唯一标识： 工具名称 + schema文稿 + schema类型
                String importKey = tool.getName() + "_" + tool.getSchemaFileName() + "_" + tool.getSchemaType().getDescription();
                String id = exportInfoMap.get(importKey);
                if (StrUtil.isBlank(id)) {
                    id = IdUtil.getSnowflakeNextIdStr();
                    addZipEntry(TOOLS_DIR + File.separator + id + ".json", JSONUtil.toJsonStr(fileToolDTO), zipOut);
                    exportInfoMap.put(importKey, id);
                }
                List<FileAgentDTO.Function> fileFunctions = new ArrayList<>();
                if (CollUtil.isNotEmpty(tool.getFunctions())) {
                    String finalId = id;
                    fileFunctions = tool.getFunctions().stream().map(function -> {
                        // 工具 functionId（生成规则: Base64(方法请求方式+":"+方法名字)，例如 Base64("post:/queryIp") -> "cG9zdDovcXVlcnlJcA=="；
                        String method = StrUtil.isBlank(function.getMethod()) ? "null" : function.getMethod();
                        return FileAgentDTO.Function.builder()
                                .toolId(finalId)
                                .functionId(Base64.encode(method + ":" + function.getName()))
                                .mode(function.getMode())
                                .build();
                    }).toList();
                }
                fileFunctionList.addAll(fileFunctions);
            }
            fileAgentDTO.setFunctionList(fileFunctionList);
        }

        // 处理model
        if (ObjUtil.isNotNull(agentInfoDTO.getModel())) {
            FileModelDTO fileModelDTO = new FileModelDTO();
            fileModelDTO.setName(agentInfoDTO.getModel().getName());
            fileModelDTO.setAlias(StrUtil.isBlank(agentInfoDTO.getModel().getAlias()) ? agentInfoDTO.getModel().getName()
                    : agentInfoDTO.getModel().getAlias());
            fileModelDTO.setApiKey(agentInfoDTO.getModel().getApiKey());
            fileModelDTO.setBaseUrl(agentInfoDTO.getModel().getBaseUrl());
            fileModelDTO.setType(agentInfoDTO.getModel().getType());
            // 保存文件到压缩包
            // 唯一标识： 模型名称 + 模型别名 + 模型apiKey + 模型baseUrl + 模型类型
            String importKey = fileModelDTO.getName() + "_" + fileModelDTO.getAlias() + "_" + fileModelDTO.getApiKey() + "_" + fileModelDTO.getBaseUrl() + "_" + fileModelDTO.getType().getCode();
            String modelId = exportInfoMap.get(importKey);
            if (StrUtil.isBlank(modelId)) {
                modelId = IdUtil.getSnowflakeNextIdStr();
                addZipEntry(MODELS_DIR + File.separator + modelId + ".json", JSONUtil.toJsonStr(fileModelDTO), zipOut);
                exportInfoMap.put(importKey, modelId);
            }
            if (fileModelDTO.getType().equals(ModelType.TTS)) {
                fileAgentDTO.setTtsModelId(modelId);
            } else {
                fileAgentDTO.setModelId(modelId);
            }
        }


        // 处理knowledgeBase
        if (CollUtil.isNotEmpty(agentInfoDTO.getKnowledgeBases())) {
            List<String> fileKnowledgeBaseIdList = new ArrayList<>();
            for (MdAgentInfoDTO.KnowledgeBase knowledgeBase : agentInfoDTO.getKnowledgeBases()) {
                FileModelDTO knowledgeModelDTO = new FileModelDTO();
                knowledgeModelDTO.setName(knowledgeBase.getModel().getName());
                knowledgeModelDTO.setAlias(StrUtil.isBlank(knowledgeBase.getModel().getAlias()) ? knowledgeBase.getModel().getName()
                        : knowledgeBase.getModel().getAlias());
                knowledgeModelDTO.setApiKey(knowledgeBase.getModel().getApiKey());
                knowledgeModelDTO.setBaseUrl(knowledgeBase.getModel().getBaseUrl());
                knowledgeModelDTO.setType(knowledgeBase.getModel().getType());
                // 保存文件到压缩包
                // 唯一标识： 模型名称 + 模型别名 + 模型apiKey + 模型baseUrl + 模型类型
                String importKey = knowledgeModelDTO.getName() + "_" + knowledgeModelDTO.getAlias() + "_" + knowledgeModelDTO.getApiKey() +
                        "_" + knowledgeModelDTO.getBaseUrl() + "_" + knowledgeModelDTO.getType().getCode();
                String knowledgeModelId = exportInfoMap.get(importKey);
                if (StrUtil.isBlank(knowledgeModelId)) {
                    knowledgeModelId = IdUtil.getSnowflakeNextIdStr();
                    addZipEntry(MODELS_DIR + File.separator + knowledgeModelId + ".json", JSONUtil.toJsonStr(knowledgeModelDTO), zipOut);
                    exportInfoMap.put(importKey, knowledgeModelId);
                }

                String knowledgeImportKey = knowledgeBase.getName();
                String knowledgeId = exportInfoMap.get(knowledgeImportKey);
                if (StrUtil.isBlank(knowledgeId)) {
                    knowledgeId = IdUtil.getSnowflakeNextIdStr();
                    FileKnowledgeMetadataDTO knowledgeModelMetadataDTO = new FileKnowledgeMetadataDTO();
                    knowledgeModelMetadataDTO.setId(knowledgeId);
                    knowledgeModelMetadataDTO.setName(knowledgeBase.getName());
                    knowledgeModelMetadataDTO.setDescription(knowledgeBase.getDescription());
                    knowledgeModelMetadataDTO.setEmbeddingModelId(knowledgeModelId);
                    List<FileInfo> mdFileInfo = docsFileInfoList.stream().filter(fileInfo -> knowledgeBase.getDocuments().contains(fileInfo.getFileName())).toList();
                    addZipEntry(KNOWLEDGE_BASES_DIR + File.separator + knowledgeId + File.separator + AGENT_METADATA_FILE_NAME, JSONUtil.toJsonStr(knowledgeModelMetadataDTO), zipOut);

                    for (FileInfo fileInfo : mdFileInfo) {
                        //md文件
                        addZipEntry(KNOWLEDGE_BASES_DIR + File.separator + knowledgeId + File.separator +
                                fileInfo.getId() + File.separator + fileInfo.getFileName(), FileUtil.file(fileInfo.getFilePath()), zipOut);
                        FileDocMetadataDTO metadata = fileInfo.getMetadata();
                        if (ObjUtil.isNull(metadata)) {
                            metadata = FileDocMetadataDTO.builder()
                                    .name(FileUtil.getPrefix(fileInfo.getFileName()))
                                    .build();
                        }
                        // metadata.json
                        addZipEntry(KNOWLEDGE_BASES_DIR + File.separator + knowledgeId + File.separator +
                                fileInfo.getId() + File.separator + AGENT_METADATA_FILE_NAME, JSONUtil.toJsonStr(metadata), zipOut);
                        // images
                        if (CollUtil.isNotEmpty(fileInfo.getImagesFileIds())) {
                            String finalKnowledgeId = knowledgeId;
                            fileInfoService.getByIds(fileInfo.getImagesFileIds()).forEach(imagesFileInfo -> addZipEntry(KNOWLEDGE_BASES_DIR + File.separator + finalKnowledgeId + File.separator +
                                            fileInfo.getId() + File.separator + KNOWLEDGE_BASES_IMAGES_DIR + File.separator + imagesFileInfo.getFileName(),
                                    FileUtil.file(imagesFileInfo.getFilePath()), zipOut));
                        }
                    }
                    exportInfoMap.put(knowledgeImportKey, knowledgeId);
                }
                fileKnowledgeBaseIdList.add(knowledgeId);
            }
            fileAgentDTO.setKnowledgeBaseIds(fileKnowledgeBaseIdList);

        }

        return fileAgentDTO;
    }


    /**
     * 添加ZIP条目 纯文本文件
     */
    private void addZipEntry(String fileName, String content, ZipOutputStream zipOut) throws IOException {
        ZipEntry mdEntry = new ZipEntry(fileName);
        zipOut.putNextEntry(mdEntry);
        zipOut.write(content.getBytes(StandardCharsets.UTF_8));
        zipOut.closeEntry();
    }


    /**
     * 添加文件到ZIP条目
     */
    @SneakyThrows
    private void addZipEntry(String fileName, File imageFile, ZipOutputStream zipOut) {
        try (FileInputStream fis = new FileInputStream(imageFile)) {
            ZipEntry zipEntry = new ZipEntry(fileName);
            zipOut.putNextEntry(zipEntry);
            byte[] buffer = new byte[8192]; // 8KB buffer, a common size
            int bytesRead;
            while ((bytesRead = fis.read(buffer)) != -1) {
                zipOut.write(buffer, 0, bytesRead);
            }
            zipOut.closeEntry();
        }
    }


    public CreateAgentDTO handleImport(MultipartFile file) {
        try {
            // 创建临时文件
            File tempFile = FileUtil.createTempFile();
            //缓存读取到的对象
            HashMap<String, FileModelDTO> fileModelDTOMap = new HashMap<>();
            HashMap<String, FileToolDTO> fileToolDTOMap = new HashMap<>();
            HashMap<String, FileAgentDTO> multiAgentHashMap = new HashMap<>();
            HashMap<String, ImportKnowledgeDTO> knowledgeDTOHashMap = new HashMap<>();
            AtomicReference<FileAgentDTO> rootAgentDTO = new AtomicReference<>();
            file.transferTo(tempFile);
            // 工具文件信息
            List<FileInfoDTO> toolFileInfoDTOList = new ArrayList<>();
            List<FileInfoDTO> knowledgeFileInfoDTOList = new ArrayList<>();
            ZipFile zipFile = new ZipFile(tempFile);
            ZipUtil.read(zipFile, entry -> {
                log.debug("正在解析文件: {}", entry.getName());
                if (!entry.isDirectory()) {
                    // 读取ZipEntry中的实际文件内容
                    String read = IoUtil.readUtf8(ZipUtil.getStream(zipFile, entry));
                    if ("json".equals(FileUtil.getSuffix(entry.getName()))) {
                        log.debug("读取文件{},内容: {}", entry.getName(), read);
                    }
                    if (StrUtil.contains(entry.getName(), MODELS_DIR)) {
                        fileModelDTOMap.put(FileUtil.getPrefix(entry.getName()), JSONUtil.toBean(read, FileModelDTO.class));
                    } else if (StrUtil.contains(entry.getName(), TOOLS_DIR)) {
                        FileToolDTO fileToolDTO = JSONUtil.toBean(read, FileToolDTO.class);
                        fileToolDTOMap.put(FileUtil.getPrefix(entry.getName()), fileToolDTO);
                        // 将schema转换为文件
                        boolean typeJSON = JSONUtil.isTypeJSON(fileToolDTO.getSchemaStr());
                        String schemaFileName = fileToolDTO.getName() + (typeJSON ? ".json" : ".yaml");
                        ZipEntryMultipartFile zipEntryMultipartFile =
                                new ZipEntryMultipartFile(schemaFileName, new ByteArrayInputStream(fileToolDTO.getSchemaStr().getBytes(StandardCharsets.UTF_8)));
                        toolFileInfoDTOList.add(fileInfoService.uploadToolFile(zipEntryMultipartFile));
                    } else if (StrUtil.contains(entry.getName(), KNOWLEDGE_BASES_DIR)) {
                        // 文件分隔符可能为“/” 或者 “\” 这里需要做兼容
                        String regex = StrUtil.contains(entry.getName(), "/") ? "/" : "\\\\";
                        String[] split = entry.getName().split(regex);

                        // 获取知识库id
                        String knowledgeId = split[1];
                        ImportKnowledgeDTO importKnowledgeDTO = knowledgeDTOHashMap.getOrDefault(knowledgeId, new ImportKnowledgeDTO());
                        // 知识库层
                        if (split.length == 3) {
                            // 知识库的元数据
                            if (StrUtil.contains(entry.getName(), AGENT_METADATA_FILE_NAME)) {
                                FileKnowledgeMetadataDTO fileKnowledgeMetadataDTO = JSONUtil.toBean(read, FileKnowledgeMetadataDTO.class);
                                importKnowledgeDTO.setMetadata(fileKnowledgeMetadataDTO);
                            }

                        } else if (split.length >= 4) {
                            // 文档层
                            // 获取文档id
                            String docId = split[2];
                            Map<String, ImportKnowledgeDTO.ImportDocDTO> document = importKnowledgeDTO.getDocument();
                            ImportKnowledgeDTO.ImportDocDTO importDocDTO = document.getOrDefault(docId, new ImportKnowledgeDTO.ImportDocDTO());

                            // 文档的元数据
                            if (StrUtil.contains(entry.getName(), AGENT_METADATA_FILE_NAME)) {
                                FileDocMetadataDTO fileDocMetadataDTO = JSONUtil.toBean(read, FileDocMetadataDTO.class);
                                importDocDTO.setMetadata(fileDocMetadataDTO);
                            } else if (StrUtil.contains(entry.getName(), KNOWLEDGE_BASES_IMAGES_DIR)) {
                                ZipEntryMultipartFile zipEntryMultipartFile =
                                        new ZipEntryMultipartFile(FileUtil.getName(entry.getName()), ZipUtil.getStream(zipFile, entry));
                                FileInfoDTO fileInfoDTO = fileInfoService.uploadImagesFile(zipEntryMultipartFile);
                                importDocDTO.getImagesFileIds().add(fileInfoDTO.getId());
                            } else {
                                ZipEntryMultipartFile zipEntryMultipartFile =
                                        new ZipEntryMultipartFile(FileUtil.getName(entry.getName()), ZipUtil.getStream(zipFile, entry));
                                FileInfoDTO fileInfoDTO = fileInfoService.uploadKnowledgeMdFile(zipEntryMultipartFile);
                                importDocDTO.setMdFileInfo(fileInfoDTO);
                                knowledgeFileInfoDTOList.add(fileInfoDTO);
                            }
                            document.put(docId, importDocDTO);
                        }
                        knowledgeDTOHashMap.put(knowledgeId, importKnowledgeDTO);
                    } else if (StrUtil.contains(entry.getName(), MULTIAGENT_DIR)) {
                        multiAgentHashMap.put(FileUtil.getPrefix(entry.getName()), JSONUtil.toBean(read, FileAgentDTO.class));
                    } else {
                        rootAgentDTO.set(JSONUtil.toBean(read, FileAgentDTO.class));
                    }

                }
            });
            FileUtil.del(tempFile);
            // 保存md文档元数据和图片文件信息
            updateMdFileInfo(knowledgeDTOHashMap);


            MdAgentInfoDTO mdAgentInfoDTO = getMdAgentInfoDTO(rootAgentDTO.get(), fileModelDTOMap, fileToolDTOMap, knowledgeDTOHashMap, multiAgentHashMap);
            String generate = AgentMarkdownGenerator.generate(mdAgentInfoDTO);
            log.debug("解析导入后生成的md内容:{}", generate);
            return CreateAgentDTO.builder()
                    .id(IdUtil.getSnowflakeNextIdStr())
                    .name(rootAgentDTO.get().getName())
                    .description(rootAgentDTO.get().getDescription())
                    .platform(PlatformType.LITE_AGENT)// 目前默认LITE_AGENT
                    .mdContent(generate)
                    .toolFileIdList(toolFileInfoDTOList.stream().map(FileInfoDTO::getId).distinct().toList())
                    .docsFileIdList(knowledgeFileInfoDTOList.stream().map(FileInfoDTO::getId).distinct().toList())
                    .build();
        } catch (Exception e) {
            log.error("解析ZIP文件失败: ", e);
            throw new BusinessException(ErrorCode.FILE_UPLOAD_ERROR, "解析ZIP文件失败: " + e.getMessage());
        }
    }

    private void updateMdFileInfo(HashMap<String, ImportKnowledgeDTO> knowledgeDTOHashMap) {
        knowledgeDTOHashMap.values().forEach(importKnowledgeDTO ->
                importKnowledgeDTO.getDocument().values().forEach(importDocDTO ->
                        fileInfoService.updateFileDocMetaData(importDocDTO.getMdFileInfo().getId(),
                                importDocDTO.getMetadata(), importDocDTO.getImagesFileIds())));
    }


    /**
     * 获取MdAgentInfoDTO
     */
    private MdAgentInfoDTO getMdAgentInfoDTO(FileAgentDTO rootAgentDTO,
                                             HashMap<String, FileModelDTO> fileModelDTOMap,
                                             HashMap<String, FileToolDTO> fileToolDTOMap,
                                             HashMap<String, ImportKnowledgeDTO> knowledgeDTOHashMap,
                                             HashMap<String, FileAgentDTO> multiAgentHashMap) {
        MdAgentInfoDTO mdAgentInfoDTO = new MdAgentInfoDTO();
        mdAgentInfoDTO.setName(rootAgentDTO.getName());
        mdAgentInfoDTO.setDescription(rootAgentDTO.getDescription());
        mdAgentInfoDTO.setType(rootAgentDTO.getType());
        mdAgentInfoDTO.setMode(rootAgentDTO.getMode());
        mdAgentInfoDTO.setPrompt(rootAgentDTO.getPrompt());


        // 设置模型信息
        if (ObjUtil.isNotNull(rootAgentDTO.getModelId())) {
            FileModelDTO fileModelDTO = fileModelDTOMap.get(rootAgentDTO.getModelId());
            if (ObjUtil.isNotNull(fileModelDTO)) {
                MdAgentInfoDTO.Model model = new MdAgentInfoDTO.Model();
                model.setName(fileModelDTO.getName());
                model.setAlias(fileModelDTO.getAlias());
                model.setBaseUrl(fileModelDTO.getBaseUrl());
                model.setApiKey(fileModelDTO.getApiKey());
                model.setType(fileModelDTO.getType());
                mdAgentInfoDTO.setModel(model);
            }
        }

        // 设置工具信息
        if (CollUtil.isNotEmpty(rootAgentDTO.getFunctionList())) {
            // 按toolId分组
            HashMap<String, List<FileAgentDTO.Function>> functionMap = new HashMap<>();
            for (FileAgentDTO.Function function : rootAgentDTO.getFunctionList()) {
                functionMap.computeIfAbsent(function.getToolId(), k -> new ArrayList<>()).add(function);
            }

            List<MdAgentInfoDTO.Tool> tools = new ArrayList<>();
            for (String toolId : functionMap.keySet()) {
                FileToolDTO fileToolDTO = fileToolDTOMap.get(toolId);
                if (ObjUtil.isNotNull(fileToolDTO)) {
                    MdAgentInfoDTO.Tool tool = new MdAgentInfoDTO.Tool();
                    tool.setName(fileToolDTO.getName());
                    tool.setSchemaType(SchemaType.of(fileToolDTO.getSchemaType()));
                    tool.setDescription(fileToolDTO.getDescription());
                    boolean typeJSON = JSONUtil.isTypeJSON(fileToolDTO.getSchemaStr());
                    tool.setSchemaFileName(fileToolDTO.getName() + (typeJSON ? ".json" : ".yaml"));
                    tool.setApiKeyType(fileToolDTO.getApiKeyType());
                    tool.setApiKey(fileToolDTO.getApiKey());
                    tool.setAutoAgent(fileToolDTO.getAutoAgent());

                    // 设置函数信息
                    List<MdAgentInfoDTO.Function> functions = new ArrayList<>();
                    for (FileAgentDTO.Function fileFunction : functionMap.get(toolId)) {
                        // 工具 functionId（生成规则: Base64(方法请求方式+":"+方法名字)，例如 Base64("post:/queryIp") -> "cG9zdDovcXVlcnlJcA=="；
                        String functionStr = Base64.decodeStr(fileFunction.getFunctionId());
                        String[] split = functionStr.split(":");
                        String method = split[0].trim();
                        String functionName = split[1].trim();
                        MdAgentInfoDTO.Function mdFunction = new MdAgentInfoDTO.Function();
                        mdFunction.setMode(fileFunction.getMode());
                        mdFunction.setName(functionName);
                        mdFunction.setMethod(method);
                        functions.add(mdFunction);
                    }
                    tool.setFunctions(functions);
                    tools.add(tool);
                }
            }
            mdAgentInfoDTO.setTools(tools);
        }

        // 设置知识库信息
        if (CollUtil.isNotEmpty(rootAgentDTO.getKnowledgeBaseIds())) {
            List<MdAgentInfoDTO.KnowledgeBase> knowledgeBases = new ArrayList<>();
            for (String knowledgeId : rootAgentDTO.getKnowledgeBaseIds()) {
                ImportKnowledgeDTO importKnowledgeDTO = knowledgeDTOHashMap.get(knowledgeId);
                if (ObjUtil.isNotNull(importKnowledgeDTO) && ObjUtil.isNotNull(importKnowledgeDTO.getMetadata())) {
                    MdAgentInfoDTO.KnowledgeBase knowledgeBase = new MdAgentInfoDTO.KnowledgeBase();
                    knowledgeBase.setName(importKnowledgeDTO.getMetadata().getName());
                    knowledgeBase.setDescription(importKnowledgeDTO.getMetadata().getDescription());

                    // 设置知识库模型
                    String embeddingModelId = importKnowledgeDTO.getMetadata().getEmbeddingModelId();
                    FileModelDTO fileModelDTO = fileModelDTOMap.get(embeddingModelId);
                    if (ObjUtil.isNotNull(fileModelDTO)) {
                        MdAgentInfoDTO.Model model = new MdAgentInfoDTO.Model();
                        model.setName(fileModelDTO.getName());
                        model.setAlias(fileModelDTO.getAlias());
                        model.setBaseUrl(fileModelDTO.getBaseUrl());
                        model.setApiKey(fileModelDTO.getApiKey());
                        model.setType(fileModelDTO.getType());
                        knowledgeBase.setModel(model);
                    }

                    // 设置文档列表
                    if (ObjUtil.isNotNull(importKnowledgeDTO.getDocument())) {
                        List<FileInfoDTO> fileInfoList = new ArrayList<>();
                        importKnowledgeDTO.getDocument().values().forEach(doc -> {
                            fileInfoList.add(doc.getMdFileInfo());
                        });
                        List<String> documents = fileInfoList.stream().map(FileInfoDTO::getFileName).toList();
                        knowledgeBase.setDocuments(documents);
                    }

                    knowledgeBases.add(knowledgeBase);
                }
            }
            mdAgentInfoDTO.setKnowledgeBases(knowledgeBases);
        }

        // 递归处理子agent
        if (CollUtil.isNotEmpty(rootAgentDTO.getSubAgentIds())) {
            List<MdAgentInfoDTO> subAgents = new ArrayList<>();
            for (String subAgentId : rootAgentDTO.getSubAgentIds()) {
                FileAgentDTO subAgentDTO = multiAgentHashMap.get(subAgentId);
                if (ObjUtil.isNotNull(subAgentDTO)) {
                    // 递归调用处理子agent
                    MdAgentInfoDTO subMdAgentInfoDTO = getMdAgentInfoDTO(
                            subAgentDTO,
                            fileModelDTOMap,
                            fileToolDTOMap,
                            knowledgeDTOHashMap,
                            multiAgentHashMap
                    );
                    subAgents.add(subMdAgentInfoDTO);
                }
            }
            mdAgentInfoDTO.setSubAgents(subAgents);
        }

        return mdAgentInfoDTO;
    }


    /**
     * 复制文件
     */
    public String copyFile(String fileId) {
        return fileInfoService.copyFile(fileId);
    }

    /**
     * 删除文件
     */
    public boolean removeByIds(List<String> ids) {
        return fileInfoService.removeByIds(ids);
    }

}