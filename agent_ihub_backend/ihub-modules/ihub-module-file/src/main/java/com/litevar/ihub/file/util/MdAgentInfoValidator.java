package com.litevar.ihub.file.util;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.ObjUtil;
import cn.hutool.core.util.StrUtil;
import com.litevar.ihub.common.web.exception.BusinessException;
import com.litevar.ihub.common.web.exception.ErrorCode;
import com.litevar.ihub.file.dto.MdAgentInfoDTO;
import com.litevar.ihub.file.enums.AgentType;
import com.litevar.ihub.file.enums.ExecutionMode;
import com.litevar.ihub.file.enums.ModelType;
import com.litevar.ihub.file.enums.SchemaType;

import java.util.List;

/**
 * MdAgentInfoDTO校验工具类
 */
public class MdAgentInfoValidator {

    /**
     * 导出时校验
     * 递归校验MdAgentInfoDTO中的关键字段是否为空
     * 校验的字段包括：Agent的名称、Agent的类型、Agent的执行模式
     *
     * @param agentDTO 待校验的MdAgentInfoDTO对象
     * @param path     当前校验路径，用于错误信息提示
     */
    public static void validateExportMdAgentInfo(MdAgentInfoDTO agentDTO, String path) {
        // 校验agent名称
        if (StrUtil.isBlank(agentDTO.getName())) {
            throw new BusinessException(ErrorCode.DATA_VERIFICATION_FAILED, path + "的名称为空或不正确!");
        }

        // 校验agent类型
        if (ObjUtil.isNull(agentDTO.getType())) {
            throw new BusinessException(ErrorCode.DATA_VERIFICATION_FAILED, path + "的类型为空或不正确!,可用值:"+ AgentType.getEnableValues());
        }

        // 校验agent执行模式
        if (ObjUtil.isNull(agentDTO.getMode())) {
            throw new BusinessException(ErrorCode.DATA_VERIFICATION_FAILED, path + "的执行模式为空或不正确!,可用值:"+ ExecutionMode.getEnableValues());
        }

        if (ObjUtil.isNotNull(agentDTO.getModel())) {
            MdAgentInfoDTO.Model model = agentDTO.getModel();
            if (StrUtil.isBlank(model.getName())) {
                throw new BusinessException(ErrorCode.DATA_VERIFICATION_FAILED, path + "的模型名称为空或不正确!");
            }

            if (StrUtil.isBlank(model.getAlias())) {
                throw new BusinessException(ErrorCode.DATA_VERIFICATION_FAILED, path + "的模型别名为空或不正确!");
            }
        }
        if (CollUtil.isNotEmpty(agentDTO.getTools())) {
            agentDTO.getTools().forEach(tool -> {
                if (ObjUtil.isNotNull(tool)) {
                    if (StrUtil.isBlank(tool.getName())) {
                        throw new BusinessException(ErrorCode.DATA_VERIFICATION_FAILED, path + "的工具名称为空或不正确!");
                    }
                    if (ObjUtil.isNull(tool.getSchemaType())) {
                        throw new BusinessException(ErrorCode.DATA_VERIFICATION_FAILED, path + "的schema类型为空或不正确!,可用值:"+ SchemaType.getEnableValues());
                    }
                    if(CollUtil.isEmpty(tool.getFunctions())) {
                        throw new BusinessException(ErrorCode.DATA_VERIFICATION_FAILED, path + "工具的方法模式为空!");
                    }
                }
            });
        }

        if (CollUtil.isNotEmpty(agentDTO.getKnowledgeBases())) {
            agentDTO.getKnowledgeBases().forEach(knowledgeBase -> {
                if (ObjUtil.isNotNull(knowledgeBase)) {
                    if (StrUtil.isBlank(knowledgeBase.getName())) {
                        throw new BusinessException(ErrorCode.DATA_VERIFICATION_FAILED, path + "的知识库名称为空或不正确!");
                    }
                    if (ObjUtil.isNull(knowledgeBase.getModel())) {
                        throw new BusinessException(ErrorCode.DATA_VERIFICATION_FAILED, path + "的知识库模型为空或不正确!");
                    } else {
                        MdAgentInfoDTO.Model model = knowledgeBase.getModel();
                        if (ObjUtil.isNull(model)) {
                            throw new BusinessException(ErrorCode.DATA_VERIFICATION_FAILED, path + "的知识库模型为空或不正确!");
                        }
                        if (StrUtil.isBlank(model.getName())) {
                            throw new BusinessException(ErrorCode.DATA_VERIFICATION_FAILED, path + "的知识库模型名称为空或不正确!");
                        }
                        if (ObjUtil.isNull(model.getAlias())) {
                            throw new BusinessException(ErrorCode.DATA_VERIFICATION_FAILED, path + "的知识库模型别名为空或不正确!");
                        }
                    }
                }
            });
        }


        // 递归校验子agent
        List<MdAgentInfoDTO> subAgents = agentDTO.getSubAgents();
        if (CollUtil.isNotEmpty(subAgents)) {
            subAgents.forEach(mdAgentInfoDTO -> {
                String subPath = path + "-->" + StrUtil.format("Agent[{}]", mdAgentInfoDTO.getName());
                validateExportMdAgentInfo(mdAgentInfoDTO, subPath);
            });
        }
    }






    /**
     * 创建或者更新时校验
     * 递归校验MdAgentInfoDTO中的关键字段是否为空
     * 校验的字段包括：Agent的名称、Agent的类型、Agent的执行模式
     *
     * @param agentDTO 待校验的MdAgentInfoDTO对象
     * @param path     当前校验路径，用于错误信息提示
     */
    public static void validateMdAgentInfo(MdAgentInfoDTO agentDTO, String path) {


        if (ObjUtil.isNotNull(agentDTO.getModel())) {
            MdAgentInfoDTO.Model model = agentDTO.getModel();
            if (ObjUtil.isNull(model.getType())) {
                throw new BusinessException(ErrorCode.DATA_VERIFICATION_FAILED, path + "的模型类型为空或不正确!可用值:"+ ModelType.getEnableValues());
            }
        }
        if (CollUtil.isNotEmpty(agentDTO.getTools())) {
            agentDTO.getTools().forEach(tool -> {
                if (ObjUtil.isNotNull(tool)) {
                    if (ObjUtil.isNull(tool.getSchemaType())) {
                        throw new BusinessException(ErrorCode.DATA_VERIFICATION_FAILED, path + "的schema类型为空或不正确!可用值:"+ SchemaType.getEnableValues());
                    }
                }
                if(CollUtil.isNotEmpty(tool.getFunctions())){
                    tool.getFunctions().forEach(function -> {
                        if (ObjUtil.isNull(function.getMode())) {
                            throw new BusinessException(ErrorCode.DATA_VERIFICATION_FAILED, path + "的工具方法执行模式为空或不正确!可用值:"+ ExecutionMode.getEnableValues());
                        }
                    });
                }
            });
        }
        // 递归校验子agent
        List<MdAgentInfoDTO> subAgents = agentDTO.getSubAgents();
        if (CollUtil.isNotEmpty(subAgents)) {
            subAgents.forEach(mdAgentInfoDTO -> {
                String subPath = path + "-->" + StrUtil.format("Agent[{}]", mdAgentInfoDTO.getName());
                validateMdAgentInfo(mdAgentInfoDTO, subPath);
            });
        }
    }




}