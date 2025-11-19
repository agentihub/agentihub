package com.litevar.ihub.file.markdown;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.collection.IterUtil;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.ObjUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import com.litevar.ihub.file.dto.MdAgentInfoDTO;
import com.litevar.ihub.file.enums.*;
import com.vladsch.flexmark.ast.*;
import com.vladsch.flexmark.parser.Parser;
import com.vladsch.flexmark.util.ast.Document;
import com.vladsch.flexmark.util.ast.Node;
import lombok.extern.slf4j.Slf4j;

import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.List;

import static com.litevar.ihub.file.constant.MDConstants.*;

/**
 * Agent Markdown解析器
 *
 * @author Teoan
 * @since 2025/9/25 15:43
 */
@Slf4j
public class AgentMarkdownParser {

    private static final Parser parser = Parser.builder().build();



    /**
     * 解析Markdown内容为Agent信息
     *
     * @param markdownContent Markdown内容
     * @return Agent信息
     */
    public static MdAgentInfoDTO parse(String markdownContent) {
        Document document = parser.parse(markdownContent);
        MdAgentInfoDTO mdAgentInfoDTO = parseDocument(document);
        log.debug("解析md内容：{},结果：{}", markdownContent, JSONUtil.toJsonStr(mdAgentInfoDTO));
        return mdAgentInfoDTO;
    }

    /**
     * 解析文档节点
     *
     * @param document 文档节点
     * @return Agent信息
     */
    private static MdAgentInfoDTO parseDocument(Document document) {
        List<Node> children = IterUtil.toList(document.getChildren());
        if (CollUtil.isEmpty(children)) {
            return null;
        }
        // 查找第一个一级标题作为根Agent
        ParseResult result = parseAgentHierarchy(children, 0, 1);
        return result.agent;
    }

    /**
     * 递归解析Agent层次结构
     *
     * @param nodes         节点列表
     * @param startIndex    起始索引
     * @param expectedLevel 期望的标题层级
     * @return 解析结果，包含解析出的Agent和下一个处理位置
     */
    private static ParseResult parseAgentHierarchy(List<Node> nodes, int startIndex, int expectedLevel) {
        if (startIndex >= nodes.size()) {
            return new ParseResult(null, startIndex);
        }

        // 查找期望层级的标题
        int titleIndex = findHeadingWithLevel(nodes, startIndex, expectedLevel);
        if (titleIndex == -1) {
            return new ParseResult(null, startIndex);
        }

        // 获取标题节点
        Heading heading = (Heading) nodes.get(titleIndex);
        MdAgentInfoDTO agent = new MdAgentInfoDTO();
        agent.setName(getAgentName(heading.getText().toString().trim()));

        // 填充Agent详细信息（从标题后一个节点开始到下一个同级或上级标题为止）
        int contentEndIndex = findNextHeadingAtOrAboveLevel(nodes, titleIndex + 1, expectedLevel);
        if (contentEndIndex == -1) {
            contentEndIndex = nodes.size();
        }

        // 填充内容
        populateAgentDetails(agent, nodes.subList(titleIndex + 1, contentEndIndex));

        // 查找并处理子Agent（下一级标题）
        int childStartIndex = titleIndex + 1;
        List<MdAgentInfoDTO> subAgents = new ArrayList<>();

        while (childStartIndex < contentEndIndex) {
            // 查找下一级标题
            int childTitleIndex = findHeadingWithLevel(nodes, childStartIndex, expectedLevel + 1);
            if (childTitleIndex == -1 || childTitleIndex >= contentEndIndex) {
                break;
            }

            // 递归解析子Agent
            ParseResult childResult = parseAgentHierarchy(nodes, childTitleIndex, expectedLevel + 1);
            if (childResult.agent != null) {
                subAgents.add(childResult.agent);
            }

            // 更新下一个查找位置
            childStartIndex = childResult.nextIndex;
        }

        if (!subAgents.isEmpty()) {
            agent.setSubAgents(subAgents);
        }

        return new ParseResult(agent, contentEndIndex);
    }

    /**
     * 查找指定层级的标题节点
     *
     * @param nodes      节点列表
     * @param startIndex 起始索引
     * @param level      期望的标题层级
     * @return 找到的标题索引，未找到返回-1
     */
    private static int findHeadingWithLevel(List<Node> nodes, int startIndex, int level) {
        for (int i = startIndex; i < nodes.size(); i++) {
            if (nodes.get(i) instanceof Heading heading && heading.getLevel() == level) {
                return i;
            }
        }
        return -1;
    }

    /**
     * 查找下一个指定层级或更高级别的标题
     *
     * @param nodes      节点列表
     * @param startIndex 起始索引
     * @param level      最大标题层级（包括）
     * @return 找到的标题索引，未找到返回-1
     */
    private static int findNextHeadingAtOrAboveLevel(List<Node> nodes, int startIndex, int level) {
        for (int i = startIndex; i < nodes.size(); i++) {
            if (nodes.get(i) instanceof Heading heading && heading.getLevel() <= level) {
                return i;
            }
        }
        return -1;
    }

    /**
     * 填充Agent详细信息
     *
     * @param agent        Agent信息
     * @param contentNodes 内容节点列表
     */
    private static void populateAgentDetails(MdAgentInfoDTO agent, List<Node> contentNodes) {
        for (Node node : contentNodes) {
            //遇到标题头则为下一个agent的内容 此时应该跳槽循环
            if (node instanceof Heading) {
                break;
            }
            if (node instanceof BlockQuote blockQuote) {
                agent.setType(AgentType.of(extractText(blockQuote, blockQuote.getOpeningMarker().toString())));
            } else if (node instanceof FencedCodeBlock fencedCodeBlock) {
                agent.setPrompt(fencedCodeBlock.getContentChars().toString().trim());
            } else if (node instanceof BulletList bulletList) {
                parseAgentPropertiesFromList(agent, bulletList);
            }
        }
    }

    /**
     * 从列表中解析Agent属性
     *
     * @param agent Agent信息
     * @param list  列表节点
     */
    private static void parseAgentPropertiesFromList(MdAgentInfoDTO agent, BulletList list) {
        for (Node itemNode : list.getChildren()) {
            if (itemNode instanceof ListItem item) {
                String itemText = extractText(item.getFirstChild(), item.getOpeningMarker().toString()).trim().replace("：",":");
                if (itemText.startsWith("模式:")) {
                    agent.setMode(ExecutionMode.of(itemText.replace("模式:", "").trim()));
                } else if (itemText.startsWith("大模型")) {
                    agent.setModel(parseModelFromList(item));
                } else if (itemText.startsWith("知识库")) {
                    agent.setKnowledgeBases(parseKnowledgeBaseFromList(item));
                } else if (itemText.startsWith("工具")) {
                    agent.setTools(parseToolsFromList(item));
                }
            }
        }
    }

    /**
     * 从列表项中解析模型信息
     *
     * @param parentItem 父级列表项
     * @return 模型信息
     */
    private static MdAgentInfoDTO.Model parseModelFromList(ListItem parentItem) {
        if (!hasSubList(parentItem)) return null;
        MdAgentInfoDTO.Model model = new MdAgentInfoDTO.Model();
        BulletList subList = (BulletList) parentItem.getLastChild();
        if (ObjUtil.isNotNull(subList)) {
            for (Node subItemNode : subList.getChildren()) {
                String text = extractText(subItemNode, String.valueOf(subList.getOpeningMarker())).trim().replace("：",":");
                if (text.startsWith("名称:")) {
                    model.setName(text.replace("名称:", "").trim());
                } else if (text.startsWith("别名:")) {
                    // 如果别名为空 则设置为名称
                    String alias = text.replace("别名:", "").trim();
                    model.setAlias(StrUtil.isBlank(alias) ? model.getName() : alias);
                } else if (text.startsWith("地址:")) {
                    model.setBaseUrl(text.replace("地址:", "").trim());
                    if (StrUtil.isBlank(model.getBaseUrl())) {
                        model.setBaseUrl(MD_BASE_URL_PLACEHOLDERS);
                    }
                } else if (text.startsWith("密钥:")) {
                    model.setApiKey(text.replace("密钥:", "").trim());
                    if (StrUtil.isBlank(model.getApiKey())) {
                        model.setApiKey(MD_API_KEY_PLACEHOLDERS);
                    }
                } else if (text.startsWith("类型:")) {
                    model.setType(ModelType.of(text.replace("类型:", "").trim()));
                }
            }
        }
        return model;
    }

    /**
     * 从列表项中解析知识库列表
     *
     * @param parentItem 父级列表项
     * @return 知识库列表
     */
    private static List<MdAgentInfoDTO.KnowledgeBase> parseKnowledgeBaseFromList(ListItem parentItem) {
        List<MdAgentInfoDTO.KnowledgeBase> knowledgeBaseList = new ArrayList<>();

        if (!hasSubList(parentItem)) {
            return List.of();
        }

        BulletList subList = (BulletList) parentItem.getLastChild();
        if (ObjUtil.isNotNull(subList)) {
            for (Node itemNode : subList.getChildren()) {
                ListItem item = (ListItem) itemNode;
                String itemText = extractText(item.getFirstChild(), item.getOpeningMarker().toString()).trim();
                if (MD_NULL_PREFIX.equals(itemText)) {
                    return List.of();
                }
                knowledgeBaseList.add(parseKnowledgeBase(item));
            }
        }
        return knowledgeBaseList;
    }

    /**
     * 解析知识库信息
     *
     * @param parentItem 父级列表项
     * @return 知识库信息
     */
    private static MdAgentInfoDTO.KnowledgeBase parseKnowledgeBase(ListItem parentItem) {
        if (!hasSubList(parentItem)) {
            return null;
        }
        MdAgentInfoDTO.KnowledgeBase knowledgeBase = new MdAgentInfoDTO.KnowledgeBase();
        String knowledgeBaseName = extractText(parentItem.getFirstChild(), parentItem.getOpeningMarker().toString()).trim();
        knowledgeBase.setName(knowledgeBaseName);
        BulletList subList = (BulletList) parentItem.getLastChild();
        if (ObjUtil.isNotNull(subList)) {
            for (Node itemNode : subList.getChildren()) {
                ListItem item = (ListItem) itemNode;
                String itemText = extractText(item.getFirstChild(), item.getOpeningMarker().toString()).trim();
                if (itemText.startsWith("模型")) {
                    knowledgeBase.setModel(parseModelFromList(item));
                } else if (itemText.startsWith("文档")) {
                    if (hasSubList(item)) {
                        if (CollUtil.isEmpty(knowledgeBase.getDocuments())) {
                            knowledgeBase.setDocuments(new ArrayList<>());
                        }
                        for (Node docNode : item.getLastChild().getChildren()) {
                            knowledgeBase.getDocuments().add(extractText(docNode, String.valueOf(item.getOpeningMarker())));
                        }
                    }
                } else if (itemText.startsWith("描述:")) {
                    knowledgeBase.setDescription(itemText.replace("描述:", "").trim());
                }
            }
        }
        return knowledgeBase;
    }


    /**
     * 从列表项中解析工具列表
     *
     * @param parentItem 父级列表项
     * @return 工具列表
     */
    private static List<MdAgentInfoDTO.Tool> parseToolsFromList(ListItem parentItem) {
        if (!hasSubList(parentItem)) {
            return List.of();
        }
        List<MdAgentInfoDTO.Tool> tools = new ArrayList<>();
        BulletList subList = (BulletList) parentItem.getLastChild();
        if (ObjUtil.isNotNull(subList)) {
            for (Node itemNode : subList.getChildren()) {
                ListItem item = (ListItem) itemNode;
                String itemText = extractText(item.getFirstChild(), item.getOpeningMarker().toString()).trim();
                if (MD_NULL_PREFIX.equals(itemText)) {
                    return List.of();
                }
                tools.add(parseTool(item));
            }
        }
        return tools;
    }

    /**
     * 解析工具信息
     *
     * @param parentItem 父级列表项
     * @return 工具信息
     */
    private static MdAgentInfoDTO.Tool parseTool(ListItem parentItem) {
        MdAgentInfoDTO.Tool tool = new MdAgentInfoDTO.Tool();
        if (!hasSubList(parentItem)) {
            return null;
        }
        String toolName = extractText(parentItem.getFirstChild(), parentItem.getOpeningMarker().toString()).trim();
        tool.setName(toolName);
        BulletList subList = (BulletList) parentItem.getLastChild();
        if (ObjUtil.isNotNull(subList)) {
            for (Node itemNode : subList.getChildren()) {
                ListItem item = (ListItem) itemNode;
                String itemText = extractText(item.getFirstChild(), item.getOpeningMarker().toString()).trim().replace("：",":");

                if (itemText.startsWith("描述:")) {
                    tool.setDescription(itemText.replace("描述:", "").trim());
                } else if (itemText.startsWith("schema类型:")) {
                    tool.setSchemaType(SchemaType.of(itemText.replace("schema类型:", "").trim()));
                } else if (itemText.startsWith("API密钥类型:")) {
                    tool.setApiKeyType(ApiKeyType.of(itemText.replace("API密钥类型:", "").trim()));
                } else if (itemText.startsWith("API密钥值:")) {
                    tool.setApiKey(itemText.replace("API密钥值:", "").trim());
                    if (StrUtil.isBlank(tool.getApiKey())) {
                        tool.setApiKey(MD_API_KEY_PLACEHOLDERS);
                    }
                } else if (itemText.startsWith("是否支持autoAgent:")) {
                    tool.setAutoAgent(Boolean.parseBoolean(itemText.replace("是否支持autoAgent:", "").trim()));
                } else if (itemText.startsWith("schema文稿:")) {
                    tool.setSchemaFileName(itemText.replace("schema文稿:", "").trim());
                } else if (itemText.startsWith("方法模式")) {
                    tool.setFunctions(parseFunctionList(item));
                }
            }
        }
        return tool;
    }


    /**
     * 解析函数列表
     *
     * @param parentItem 父级列表项
     * @return 函数列表
     */
    private static List<MdAgentInfoDTO.Function> parseFunctionList(ListItem parentItem) {

        List<MdAgentInfoDTO.Function> functions = new ArrayList<>();
        if (!hasSubList(parentItem)) {
            return null;
        }
        BulletList subList = (BulletList) parentItem.getLastChild();
        if (ObjUtil.isNotNull(subList)) {
            for (Node itemNode : subList.getChildren()) {
                ListItem item = (ListItem) itemNode;
                String funName = extractText(item.getFirstChild(), item.getOpeningMarker().toString()).trim();
                String method = "";
                ExecutionMode mode = ExecutionMode.PARALLEL;
                BulletList funSubList = (BulletList) item.getLastChild();
                if(ObjUtil.isNotNull(funSubList)){
                    for (Node funItemNode : funSubList.getChildren()) {
                        ListItem funItem = (ListItem) funItemNode;
                        String text = extractText(funItem, String.valueOf(funItem.getOpeningMarker())).trim().replace("：",":");
                        if (text.startsWith("请求方法:")) {
                            method = text.replace("请求方法:", "").trim();
                        } else if (text.startsWith("执行模式:")) {
                            mode = ExecutionMode.of(text.replace("执行模式:", "").trim());
                        }
                    }
                }
                functions.add(new MdAgentInfoDTO.Function(funName, method, mode));
            }
        }
        return functions;
    }

    /**
     * 判断列表项是否有子列表
     *
     * @param item 列表项
     * @return 是否有子列表
     */
    private static boolean hasSubList(ListItem item) {
        return CollUtil.size(item.getChildren()) > 1 && item.getLastChild() instanceof BulletList;
    }


    // --- Helper Methods ---

    /**
     * 提取节点文本内容
     *
     * @param node        节点
     * @param replaceText 需要替换的文本
     * @return 提取的文本
     */
    private static String extractText(Node node, String replaceText) {
        if (ObjUtil.isNull(node)) {
            return "";
        }
        return node.getChars().toString().replaceFirst(replaceText, "").trim();
    }

    /**
     * 获取Agent名称
     *
     * @param headingText 标题文本
     * @return Agent名称
     */
    private static String getAgentName(String headingText) {
        String[] split = headingText.split(" ");
        return split[split.length - 1];
    }

    /**
     * 解析结果封装类
     */
    private record ParseResult(MdAgentInfoDTO agent, int nextIndex) {
    }

    public static void main(String[] args) {
        String mdContent = FileUtil.readString("C:\\Users\\27707\\Downloads\\ihub_agent_distribute.md", Charset.defaultCharset());
        MdAgentInfoDTO parse = AgentMarkdownParser.parse(mdContent);
        log.info(JSONUtil.toJsonStr(parse));
    }


}