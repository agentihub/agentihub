package com.litevar.ihub.file.markdown;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.ObjUtil;
import cn.hutool.core.util.StrUtil;
import com.litevar.ihub.file.dto.MdAgentInfoDTO;
import lombok.extern.slf4j.Slf4j;

import java.nio.charset.Charset;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static com.litevar.ihub.file.constant.MDConstants.*;

/**
 * Agent Markdown Generator
 *
 * @author Teoan
 * @since 2025/9/30 10:00
 */
@Slf4j
public class AgentMarkdownGenerator {

    /**
     * Generate markdown content from MdAgentInfoDTO
     *
     * @param agentInfo DTO
     * @return markdown content
     */
    public static String generate(MdAgentInfoDTO agentInfo) {
        if (ObjUtil.isNull(agentInfo)) {
            return "";
        }
        StringBuilder sb = new StringBuilder();
        appendAgentMarkdown(sb, agentInfo, 1);
        return sb.toString();
    }

    private static void appendAgentMarkdown(StringBuilder sb, MdAgentInfoDTO agent, int level) {
        sb.append("\n\n");
        // 1. Append Heading
        sb.append(IntStream.range(0, level).mapToObj(i -> HEADING_PREFIX).collect(Collectors.joining("")))
                .append(INDENT)
                .append(agent.getName())
                .append("\n\n");

        // 2. Append Type (Blockquote)
        if (ObjUtil.isNotNull(agent.getType())) {
            sb.append(BLOCKQUOTE_PREFIX)
                    .append(agent.getType().getDescription())
                    .append("\n\n");
        }

        // 3.Mode
        if (ObjUtil.isNotNull(agent.getMode())) {
            sb.append(LIST_ITEM_PREFIX).append("模式: ")
                    .append(agent.getMode().getDescription())
                    .append("\n\n");
        }

        // 4. Append Prompt (Fenced Code Block)
        if (StrUtil.isNotBlank(agent.getPrompt())) {
            sb.append(CODE_BLOCK_PREFIX).append("\n")
                    .append(agent.getPrompt().trim())
                    .append("\n").append(CODE_BLOCK_PREFIX)
                    .append("\n\n");
        }

        // 5. Append Properties (List)
        appendProperties(sb, agent);

        // 6. Append Sub-Agents (Recursively)
        if (CollUtil.isNotEmpty(agent.getSubAgents())) {
            for (MdAgentInfoDTO subAgent : agent.getSubAgents()) {
                appendAgentMarkdown(sb, subAgent, level + 1);
            }
        }
    }

    private static void appendProperties(StringBuilder sb, MdAgentInfoDTO agent) {
        // Check if any property exists to avoid creating an empty list
        if (ObjUtil.isNull(agent.getModel()) &&
                CollUtil.isEmpty(agent.getKnowledgeBases())
                && CollUtil.isEmpty(agent.getTools())) {
            return;
        }


        // Model
        if (ObjUtil.isNotNull(agent.getModel())) {
            sb.append(LIST_ITEM_PREFIX).append("大模型\n");
            appendModel(sb, agent.getModel(), INDENT);
        }

        // KnowledgeBases
        sb.append(LIST_ITEM_PREFIX).append("知识库\n");
        if (CollUtil.isNotEmpty(agent.getKnowledgeBases())) {
            appendKnowledgeBases(sb, agent.getKnowledgeBases(), INDENT);
        }else{
            sb.append(INDENT).append(LIST_ITEM_PREFIX).append(MD_NULL_PREFIX).append("\n");
        }

        // Tools
        sb.append(LIST_ITEM_PREFIX).append("工具\n");
        if (CollUtil.isNotEmpty(agent.getTools())) {
            appendTools(sb, agent.getTools(), INDENT);
        }else{
            sb.append(INDENT).append(LIST_ITEM_PREFIX).append(MD_NULL_PREFIX).append("\n");
        }
        sb.append("\n");
    }

    private static void appendModel(StringBuilder sb, MdAgentInfoDTO.Model model, String indent) {

        sb.append(indent).append(LIST_ITEM_PREFIX).append("名称: ").append(model.getName()).append("\n");

        sb.append(indent).append(LIST_ITEM_PREFIX).append("别名: ").append(model.getAlias()).append("\n");


        sb.append(indent).append(LIST_ITEM_PREFIX).append("类型: ").append(model.getType().getCode()).append("\n");


        sb.append(indent).append(LIST_ITEM_PREFIX).append("地址: ").append(model.getBaseUrl()).append("\n");


        sb.append(indent).append(LIST_ITEM_PREFIX).append("密钥: ").append(model.getApiKey()).append("\n");

    }

    private static void appendKnowledgeBases(StringBuilder sb, List<MdAgentInfoDTO.KnowledgeBase> knowledgeBases, String indent) {
        for (MdAgentInfoDTO.KnowledgeBase kb : knowledgeBases) {
            sb.append(indent).append(LIST_ITEM_PREFIX).append(kb.getName()).append("\n");
            String subIndent = indent + INDENT;
            if (ObjUtil.isNotNull(kb.getDescription())) {
                sb.append(subIndent).append(LIST_ITEM_PREFIX).append("描述: ").append(kb.getDescription()).append("\n");
            }
            if (ObjUtil.isNotNull(kb.getModel())) {
                sb.append(subIndent).append(LIST_ITEM_PREFIX).append("模型\n");
                appendModel(sb, kb.getModel(), subIndent + INDENT);
            }
            if (CollUtil.isNotEmpty(kb.getDocuments())) {
                sb.append(subIndent).append(LIST_ITEM_PREFIX).append("文档\n");
                for (String doc : kb.getDocuments()) {
                    sb.append(subIndent).append(INDENT).append(LIST_ITEM_PREFIX).append(doc).append("\n");
                }
            }
        }
    }

    private static void appendTools(StringBuilder sb, List<MdAgentInfoDTO.Tool> tools, String indent) {
        for (MdAgentInfoDTO.Tool tool : tools) {
            sb.append(indent).append(LIST_ITEM_PREFIX).append(tool.getName()).append("\n");
            String subIndent = indent + INDENT;
            if (StrUtil.isNotBlank(tool.getDescription())) {
                sb.append(subIndent).append(LIST_ITEM_PREFIX).append("描述: ").append(tool.getDescription()).append("\n");
            }
            if (ObjUtil.isNotNull(tool.getSchemaType())) {
                sb.append(subIndent).append(LIST_ITEM_PREFIX).append("schema类型: ").append(tool.getSchemaType().getDescription()).append("\n");
            }
            if (StrUtil.isNotBlank(tool.getSchemaFileName())) {
                sb.append(subIndent).append(LIST_ITEM_PREFIX).append("schema文稿: ").append(tool.getSchemaFileName()).append("\n");
            }
            if (ObjUtil.isNotNull(tool.getApiKeyType())) {
                sb.append(subIndent).append(LIST_ITEM_PREFIX).append("API密钥类型: ").append(tool.getApiKeyType().getCode()).append("\n");
            }
            if (StrUtil.isNotBlank(tool.getApiKey())) {
                sb.append(subIndent).append(LIST_ITEM_PREFIX).append("API密钥值: ").append(tool.getApiKey()).append("\n");
            }
            sb.append(subIndent).append(LIST_ITEM_PREFIX).append("是否支持autoAgent: ").append(tool.getAutoAgent()).append("\n");

            if (CollUtil.isNotEmpty(tool.getFunctions())) {
                sb.append(subIndent).append(LIST_ITEM_PREFIX).append("方法模式\n");
                for (MdAgentInfoDTO.Function func : tool.getFunctions()) {
                    sb.append(subIndent).append(INDENT).append(LIST_ITEM_PREFIX).append(func.getName()).append("\n");
                    String method = "";
                    if(!"null".equals(func.getMethod())){
                        method = func.getMethod();
                    }
                    sb.append(subIndent).append(INDENT).append(INDENT).append(LIST_ITEM_PREFIX).append("请求方法: ").append(method).append("\n");
                    sb.append(subIndent).append(INDENT).append(INDENT).append(LIST_ITEM_PREFIX).append("执行模式: ").append(func.getMode().getDescription()).append("\n");
                }
            }
        }
    }

    public static void main(String[] args) {
        String mdContent = FileUtil.readString("C:\\Users\\27707\\Downloads\\ihub_agent_distribute.md", Charset.defaultCharset());
        MdAgentInfoDTO parse = AgentMarkdownParser.parse(mdContent);
        String generate = generate(parse);
        log.info(generate);


    }

}