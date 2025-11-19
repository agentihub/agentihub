package com.litevar.ihub.common.core.constant;

/**
 * 缓存的key 常量
 *
 * @author Teoan
 */
public interface CacheConstants {

    /**
     * ihub 邮箱验证码code key
     */
    String IHUB_ACCOUNT_EMAIL_CODE_KEY = "ihub:account:email:code:{}";

    /**
     * ihub 手机验证码code key
     */
    String IHUB_ACCOUNT_PHONE_CODE_KEY = "ihub:account:phone:code:{}";


    /**
     * liteAgent 创建会话session缓存key
     */
    String LITE_AGENT_CREATION_CHAT_SESSION_KEY = "ihub:creation:chat:session:{}";

    /**
     * 图片验证码缓存key
     */
    String IHUB_ACCOUNT_CAPTCHA_KEY = "ihub:account:captcha:{}";


    /**
     * 文件转换进度缓存key
     */
    String IHUB_CONVERSION_PROGRESS_KEY = "ihub:conversion:progress:{}";

    /**
     * ihub 验证码过期时间，单位：分钟
     */
    long IHUB_ACCOUNT_CODE_EXPIRE_MINUTES = 3;



    /**
     * 对象字段翻译缓存key
     */
    String IHUB_TRANSLATION_CACHE_KEY = "ihub:translation:{}";
}
