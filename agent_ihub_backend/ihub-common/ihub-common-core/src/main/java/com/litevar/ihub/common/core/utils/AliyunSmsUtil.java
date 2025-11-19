package com.litevar.ihub.common.core.utils;

import cn.hutool.extra.spring.SpringUtil;
import cn.hutool.json.JSONUtil;
import com.aliyun.dysmsapi20170525.Client;
import com.aliyun.dysmsapi20170525.models.SendSmsRequest;
import com.aliyun.dysmsapi20170525.models.SendSmsResponse;
import com.litevar.ihub.common.core.config.AliyunSmsConfigure;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;

/**
 * 阿里云短信发送工具类
 *
 * @author your-name
 * @since 2025/9/10
 */
@Slf4j
public class AliyunSmsUtil {

    private final static Client client;
    private final static AliyunSmsConfigure aliyunSmsConfig;

    static {
        client  = SpringUtil.getBean(Client.class);
        aliyunSmsConfig = SpringUtil.getBean(AliyunSmsConfigure.class);
    }



    /**
     * 发送短信验证码
     *
     * @param phone 手机号
     * @param templateCode 短信模板ID
     * @param code 验证码
     */
    public static void sendSmsCode(String phone, String templateCode, String code) {
        try {
            // 构建请求
            SendSmsRequest sendSmsRequest = new SendSmsRequest()
                    .setSignName(aliyunSmsConfig.getSignName())
                    .setTemplateCode(templateCode)
                    .setPhoneNumbers(phone);

            // 设置模板参数
            Map<String, String> templateParam = new HashMap<>();
            templateParam.put("code", code);
            sendSmsRequest.setTemplateParam(JSONUtil.toJsonStr(templateParam));


            SendSmsResponse response = client.sendSms(sendSmsRequest);
            
            if (!"OK".equals(response.getBody().getCode())) {
                log.error("短信发送失败，错误码：{}，错误信息：{}", response.getBody().getCode(), response.getBody().getMessage());
                throw new RuntimeException("短信发送失败：" + response.getBody().getMessage());
            }
            log.info("短信发送成功，手机号：{}，验证码：{}", phone, code);
        } catch (Exception e) {
            log.error("短信发送异常，手机号：{}", phone, e);
            throw new RuntimeException("短信发送失败");
        }
    }


    /**
     * 发送通用验证码
     *
     * @param phone 手机号
     */
    public static void sendCode(String phone,String code) {
        sendSmsCode(phone, aliyunSmsConfig.getTemplateCode(), code);
    }
}