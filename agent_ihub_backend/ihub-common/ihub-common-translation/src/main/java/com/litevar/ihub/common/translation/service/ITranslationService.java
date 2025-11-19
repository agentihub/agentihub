package com.litevar.ihub.common.translation.service;

import cn.hutool.core.util.ObjUtil;
import cn.hutool.core.util.StrUtil;
import com.litevar.ihub.common.core.utils.RedisUtils;

import java.util.concurrent.TimeUnit;

import static com.litevar.ihub.common.core.constant.CacheConstants.IHUB_TRANSLATION_CACHE_KEY;

/**
 * 翻译服务接口
 *
 * @author Teoan
 * @since 2025/10/30 15:35
 */
public interface ITranslationService {

    Object getFieldValue(Object id, String fieldName);

    /**
     * 带缓存的翻译
     *
     * @param key       需要被翻译的键(不为空)
     * @param fieldName 需要翻译的字段
     * @return 返回键对应的值
     */
    default Object cacheTranslation(Object key, String fieldName) {
        String cmKey = StrUtil.format(IHUB_TRANSLATION_CACHE_KEY, key);
        if (RedisUtils.cmContainsKey(cmKey, fieldName)) {
            return RedisUtils.cmGet(cmKey, fieldName, Object.class);
        } else {
            Object value = getFieldValue(key, fieldName);
            if (ObjUtil.isNotNull(value)) {
                RedisUtils.cmPut(cmKey, fieldName, value, 1, TimeUnit.DAYS);
            }
            return value;
        }
    }

}
