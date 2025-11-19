package com.litevar.ihub.common.web.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 错误码枚举
 *
 * @author lingma
 */
@Getter
@AllArgsConstructor
public enum ErrorCode {

    /**
     * 成功
     */
    SUCCESS(200, "操作成功"),

    /**
     * 通用错误码
     */
    FAIL(500, "操作失败"),
    UNAUTHORIZED(401, "未授权"),
    FORBIDDEN(403, "禁止访问"),
    NOT_FOUND(404, "资源不存在"),
    METHOD_NOT_ALLOWED(405, "请求方法不被允许"),
    REQUEST_TIMEOUT(408, "请求超时"),

    /**
     * 业务相关错误码
     */
    USER_NOT_FOUND(1001, "用户不存在"),
    USER_ALREADY_EXISTS(1002, "用户已存在"),
    INVALID_CREDENTIALS(1003, "用户名或密码错误"),
    ACCOUNT_DISABLED(1004, "账户已被禁用"),
    PHONE_FORMAT_ERROR(1005, "手机号格式错误"),
    VERIFICATION_CODE_SENT(1006, "验证码已发送，请稍后重试"),
    SMS_SEND_FAILED(1007, "短信发送失败，请稍后重试"),
    INVALID_VERIFICATION_CODE(1008, "验证码错误"),
    FILE_UPLOAD_ERROR(1009, "文件上传失败"),
    AGENT_NOT_FOUND(1010, "Agent不存在"),
    INVALID_FILE_FORMAT(1011, "文件格式不正确"),
    DEMO_MODE_OPERATION_DENIED(1012, "演示模式，不允许操作"),
    INVALID_EMAIL_FORMAT(1013, "邮箱格式错误"),
    EMAIL_SEND_FAILED(1014, "邮件发送失败"),
    CAPTCHA_ERROR(1015, "验证码错误"),
    PASSWORD_RESET_FAILED(1016, "密码重置失败"),
    CANNOT_FOLLOW_YOURSELF(1017, "不能关注自己"),
    FILE_DOWNLOAD_ERROR(1018, "文件下载失败"),
    EMAIL_ALREADY_EXISTS(1019, "邮箱已存在"),
    AGENT_ALREADY_EXISTS(1020, "Agent已存在"),
    DATA_VERIFICATION_FAILED(1021, "数据校验失败");

    /**
     * 错误码
     */
    private final Integer code;

    /**
     * 错误信息
     */
    private final String message;

    /**
     * 根据code获取枚举
     *
     * @param code 错误码
     * @return 错误码枚举
     */
    public static ErrorCode ofCode(Integer code) {
        for (ErrorCode errorCode : values()) {
            if (errorCode.code.equals(code)) {
                return errorCode;
            }
        }
        return FAIL;
    }

    /**
     * 根据message获取枚举
     *
     * @param message 错误信息
     * @return 错误码枚举
     */
    public static ErrorCode ofMessage(String message) {
        for (ErrorCode errorCode : values()) {
            if (errorCode.message.equals(message)) {
                return errorCode;
            }
        }
        return FAIL;
    }
}