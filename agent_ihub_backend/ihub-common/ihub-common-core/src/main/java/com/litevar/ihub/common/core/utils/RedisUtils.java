package com.litevar.ihub.common.core.utils;

import cn.hutool.extra.spring.SpringUtil;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.*;

import java.time.Duration;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * Redis工具类（基于Redisson实现）
 *
 * @author Teoan
 * @since 2025/9/9
 */
@Slf4j
public class RedisUtils {

    private static final RedissonClient redissonClient;

    static {
        redissonClient = SpringUtil.getBean(RedissonClient.class);
    }
    
    
    /* -------------------------------------------- String类型操作 -------------------------------------------- */

    /**
     * 设置字符串值
     *
     * @param key   键
     * @param value 值
     */
    public static void set(String key, Object value) {
        RBucket<Object> bucket = redissonClient.getBucket(key);
        bucket.set(value);
    }

    /**
     * 设置字符串值并指定过期时间
     *
     * @param key     键
     * @param value   值
     * @param timeout 过期时间
     * @param unit    时间单位
     */
    public static void set(String key, Object value, long timeout, TimeUnit unit) {
        RBucket<Object> bucket = redissonClient.getBucket(key);
        bucket.set(value, timeout, unit);
    }

    /**
     * 设置字符串值并指定过期时间
     *
     * @param key      键
     * @param value    值
     * @param duration 过期时间
     */
    public static void set(String key, Object value, Duration duration) {
        RBucket<Object> bucket = redissonClient.getBucket(key);
        bucket.set(value, duration);
    }

    /**
     * 获取字符串值
     *
     * @param key 键
     * @return 值
     */
    public static Object get(String key) {
        RBucket<Object> bucket = redissonClient.getBucket(key);
        return bucket.get();
    }

    /**
     * 获取字符串值并转换为指定类型
     *
     * @param key   键
     * @param clazz 类型
     * @param <T>   泛型
     * @return 值
     */
    public static <T> T get(String key, Class<T> clazz) {
        RBucket<T> bucket = redissonClient.getBucket(key);
        return bucket.get();
    }

    /**
     * 删除键
     *
     * @param key 键
     * @return 是否删除成功
     */
    public static boolean delete(String key) {
        RBucket<Object> bucket = redissonClient.getBucket(key);
        return bucket.delete();
    }

    /**
     * 批量删除键
     *
     * @param keys 键集合
     * @return 删除的键数量
     */
    public static long delete(Collection<String> keys) {
        return redissonClient.getKeys().delete(keys.toArray(new String[0]));
    }

    /**
     * 判断键是否存在
     *
     * @param key 键
     * @return 是否存在
     */
    public static boolean hasKey(String key) {
        RBucket<Object> bucket = redissonClient.getBucket(key);
        return bucket.isExists();
    }

    /**
     * 设置键的过期时间
     *
     * @param key     键
     * @param timeout 过期时间
     * @param unit    时间单位
     * @return 是否设置成功
     */
    public static boolean expire(String key, long timeout, TimeUnit unit) {
        RBucket<Object> bucket = redissonClient.getBucket(key);
        return bucket.expire(timeout, unit);
    }

    /**
     * 获取键的剩余过期时间
     *
     * @param key 键
     * @return 剩余过期时间（毫秒）
     */
    public static long getExpire(String key) {
        RBucket<Object> bucket = redissonClient.getBucket(key);
        return bucket.remainTimeToLive();
    }

    /**
     * 增加数值
     *
     * @param key   键
     * @param delta 增加的值
     * @return 增加后的值
     */
    public static long increment(String key, long delta) {
        RAtomicLong atomicLong = redissonClient.getAtomicLong(key);
        return atomicLong.addAndGet(delta);
    }

    /**
     * 减少数值
     *
     * @param key   键
     * @param delta 减少的值
     * @return 减少后的值
     */
    public static long decrement(String key, long delta) {
        RAtomicLong atomicLong = redissonClient.getAtomicLong(key);
        return atomicLong.addAndGet(-delta);
    }

    /* -------------------------------------------- Hash类型操作 -------------------------------------------- */

    /**
     * 设置Hash值
     *
     * @param key   键
     * @param field 字段
     * @param value 值
     */
    public static void hSet(String key, String field, Object value) {
        RMap<String, Object> map = redissonClient.getMap(key);
        map.put(field, value);
    }

    /**
     * 获取Hash值
     *
     * @param key   键
     * @param field 字段
     * @return 值
     */
    public static Object hGet(String key, String field) {
        RMap<String, Object> map = redissonClient.getMap(key);
        return map.get(field);
    }

    /**
     * 获取Hash值并转换为指定类型
     *
     * @param key   键
     * @param field 字段
     * @param clazz 类型
     * @param <T>   泛型
     * @return 值
     */
    public static <T> T hGet(String key, String field, Class<T> clazz) {
        RMap<String, T> map = redissonClient.getMap(key);
        return map.get(field);
    }

    /**
     * 删除Hash字段
     *
     * @param key    键
     * @param fields 字段
     * @return 删除的字段数量
     */
    public static long hDelete(String key, String... fields) {
        RMap<String, Object> map = redissonClient.getMap(key);
        return map.fastRemove(fields);
    }

    /**
     * 获取Hash的所有键值对
     *
     * @param key 键
     * @return 所有键值对
     */
    public static Map<String, Object> hGetAll(String key) {
        RMap<String, Object> map = redissonClient.getMap(key);
        return map.readAllMap();
    }

    /**
     * 判断Hash字段是否存在
     *
     * @param key   键
     * @param field 字段
     * @return 是否存在
     */
    public static boolean hHasKey(String key, String field) {
        RMap<String, Object> map = redissonClient.getMap(key);
        return map.containsKey(field);
    }

    /**
     * Hash字段值增加
     *
     * @param key   键
     * @param field 字段
     * @param delta 增加的值
     * @return 增加后的值
     */
    public static long hIncrement(String key, String field, long delta) {
        RMap<String, Long> map = redissonClient.getMap(key);
        return map.addAndGet(field, delta);
    }

    /* -------------------------------------------- List类型操作 -------------------------------------------- */

    /**
     * 在List左侧添加元素
     *
     * @param key   键
     * @param value 值
     */
    public static void lLeftPush(String key, Object value) {
        RList<Object> list = redissonClient.getList(key);
        list.add(0, value);
    }

    /**
     * 在List右侧添加元素
     *
     * @param key   键
     * @param value 值
     * @return List长度
     */
    public static long lRightPush(String key, Object value) {
        RList<Object> list = redissonClient.getList(key);
        list.add(value);
        return list.size();
    }

    /**
     * 获取List指定范围的元素
     *
     * @param key   键
     * @param start 开始位置
     * @param end   结束位置
     * @return 元素列表
     */
    public static List<Object> lRange(String key, long start, long end) {
        RList<Object> list = redissonClient.getList(key);
        return list.subList((int) start, (int) end + 1);
    }

    /**
     * 获取List指定索引的元素
     *
     * @param key   键
     * @param index 索引
     * @return 元素
     */
    public static Object lIndex(String key, long index) {
        RList<Object> list = redissonClient.getList(key);
        return list.get((int) index);
    }

    /**
     * 获取List长度
     *
     * @param key 键
     * @return 长度
     */
    public static long lSize(String key) {
        RList<Object> list = redissonClient.getList(key);
        return list.size();
    }

    /**
     * 从List左侧弹出元素
     *
     * @param key 键
     * @return 元素
     */
    public static Object lLeftPop(String key) {
        RList<Object> list = redissonClient.getList(key);
        return list.isEmpty() ? null : list.remove(0);
    }

    /**
     * 从List右侧弹出元素
     *
     * @param key 键
     * @return 元素
     */
    public static Object lRightPop(String key) {
        RList<Object> list = redissonClient.getList(key);
        return list.isEmpty() ? null : list.remove(list.size() - 1);
    }

    /* -------------------------------------------- Set类型操作 -------------------------------------------- */

    /**
     * 向Set添加元素
     *
     * @param key    键
     * @param values 值
     * @return 添加的元素数量
     */
    public static long sAdd(String key, Object... values) {
        RSet<Object> set = redissonClient.getSet(key);
        long count = 0;
        for (Object value : values) {
            if (set.add(value)) {
                count++;
            }
        }
        return count;
    }

    /**
     * 获取Set所有元素
     *
     * @param key 键
     * @return 所有元素
     */
    public static Set<Object> sMembers(String key) {
        RSet<Object> set = redissonClient.getSet(key);
        return set.readAll();
    }

    /**
     * 判断元素是否在Set中
     *
     * @param key   键
     * @param value 值
     * @return 是否存在
     */
    public static boolean sIsMember(String key, Object value) {
        RSet<Object> set = redissonClient.getSet(key);
        return set.contains(value);
    }

    /**
     * 获取Set长度
     *
     * @param key 键
     * @return 长度
     */
    public static long sSize(String key) {
        RSet<Object> set = redissonClient.getSet(key);
        return set.size();
    }

    /**
     * 删除Set中的元素
     *
     * @param key    键
     * @param values 值
     * @return 删除的元素数量
     */
    public static long sRemove(String key, Object... values) {
        RSet<Object> set = redissonClient.getSet(key);
        long count = 0;
        for (Object value : values) {
            if (set.remove(value)) {
                count++;
            }
        }
        return count;
    }

    /* -------------------------------------------- ZSet类型操作 -------------------------------------------- */

    /**
     * 向ZSet添加元素
     *
     * @param key   键
     * @param value 值
     * @param score 分数
     * @return 是否添加成功
     */
    public static boolean zAdd(String key, Object value, double score) {
        RScoredSortedSet<Object> sortedSet = redissonClient.getScoredSortedSet(key);
        return sortedSet.add(score, value);
    }

    /**
     * 获取ZSet元素分数
     *
     * @param key   键
     * @param value 值
     * @return 分数
     */
    public static Double zScore(String key, Object value) {
        RScoredSortedSet<Object> sortedSet = redissonClient.getScoredSortedSet(key);
        return sortedSet.getScore(value);
    }

    /**
     * 获取ZSet元素排名（按分数从小到大）
     *
     * @param key   键
     * @param value 值
     * @return 排名
     */
    public static Integer zRank(String key, Object value) {
        RScoredSortedSet<Object> sortedSet = redissonClient.getScoredSortedSet(key);
        return sortedSet.rank(value);
    }

    /**
     * 获取ZSet指定范围的元素
     *
     * @param key   键
     * @param start 开始位置
     * @param end   结束位置
     * @return 元素集合
     */
    public static Collection<Object> zRange(String key, int start, int end) {
        RScoredSortedSet<Object> sortedSet = redissonClient.getScoredSortedSet(key);
        return sortedSet.valueRange(start, end);
    }

    /**
     * 获取ZSet大小
     *
     * @param key 键
     * @return 大小
     */
    public static long zSize(String key) {
        RScoredSortedSet<Object> sortedSet = redissonClient.getScoredSortedSet(key);
        return sortedSet.size();
    }

    /**
     * 删除ZSet中的元素
     *
     * @param key    键
     * @param values 值
     * @return 删除的元素数量
     */
    public static long zRemove(String key, Object... values) {
        RScoredSortedSet<Object> sortedSet = redissonClient.getScoredSortedSet(key);
        long count = 0;
        for (Object value : values) {
            if (sortedSet.remove(value)) {
                count++;
            }
        }
        return count;
    }

    /* -------------------------------------------- 分布式锁操作 -------------------------------------------- */

    /**
     * 获取可重入锁
     *
     * @param key 锁名称
     * @return 锁对象
     */
    public static RLock getLock(String key) {
        return redissonClient.getLock(key);
    }

    /**
     * 获取公平锁
     *
     * @param key 锁名称
     * @return 锁对象
     */
    public static RLock getFairLock(String key) {
        return redissonClient.getFairLock(key);
    }

    /**
     * 获取读锁
     *
     * @param key 锁名称
     * @return 锁对象
     */
    public static RReadWriteLock getReadWriteLock(String key) {
        return redissonClient.getReadWriteLock(key);
    }

    /**
     * 尝试获取锁
     *
     * @param key      锁名称
     * @param waitTime 等待时间
     * @param unit     时间单位
     * @return 是否获取成功
     */
    public static boolean tryLock(String key, long waitTime, TimeUnit unit) {
        RLock lock = redissonClient.getLock(key);
        try {
            return lock.tryLock(waitTime, unit);
        } catch (InterruptedException e) {
            log.error("获取锁失败", e);
            Thread.currentThread().interrupt();
            return false;
        }
    }

    /**
     * 释放锁
     *
     * @param key 锁名称
     */
    public static void unlock(String key) {
        RLock lock = redissonClient.getLock(key);
        if (lock.isHeldByCurrentThread()) {
            lock.unlock();
        }
    }

    /* -------------------------------------------- RMapCache类型操作 -------------------------------------------- */

    /**
     * 获取RMapCache实例
     *
     * @param key 键
     * @return RMapCache实例
     */
    public static <K, V> RMapCache<K, V> getMapCache(String key) {
        return redissonClient.getMapCache(key);
    }

    /**
     * 设置MapCache值
     *
     * @param key   键
     * @param field 字段
     * @param value 值
     */
    public static void cmPut(String key, Object field, Object value) {
        RMapCache<Object, Object> mapCache = redissonClient.getMapCache(key);
        mapCache.put(field, value);
    }

    /**
     * 设置MapCache值并指定过期时间
     *
     * @param key     键
     * @param field   字段
     * @param value   值
     * @param timeout 过期时间
     * @param unit    时间单位
     */
    public static void cmPut(String key, Object field, Object value, long timeout, TimeUnit unit) {
        RMapCache<Object, Object> mapCache = redissonClient.getMapCache(key);
        mapCache.put(field, value, timeout, unit);
    }


    /**
     * 获取MapCache值
     *
     * @param key   键
     * @param field 字段
     * @return 值
     */
    public static Object cmGet(String key, Object field) {
        RMapCache<Object, Object> mapCache = redissonClient.getMapCache(key);
        return mapCache.get(field);
    }

    /**
     * 获取MapCache值并转换为指定类型
     *
     * @param key   键
     * @param field 字段
     * @param clazz 类型
     * @param <T>   泛型
     * @return 值
     */
    public static <T> T cmGet(String key, Object field, Class<T> clazz) {
        RMapCache<Object, T> mapCache = redissonClient.getMapCache(key);
        return mapCache.get(field);
    }

    /**
     * 删除MapCache字段
     *
     * @param key    键
     * @param fields 字段
     * @return 删除的字段数量
     */
    public static long cmRemove(String key, Object... fields) {
        RMapCache<Object, Object> mapCache = redissonClient.getMapCache(key);
        return mapCache.fastRemove(fields);
    }

    /**
     * 获取MapCache的所有键值对
     *
     * @param key 键
     * @return 所有键值对
     */
    public static Map<Object, Object> cmGetAll(String key) {
        RMapCache<Object, Object> mapCache = redissonClient.getMapCache(key);
        return mapCache.readAllMap();
    }

    /**
     * 判断MapCache字段是否存在
     *
     * @param key   键
     * @param field 字段
     * @return 是否存在
     */
    public static boolean cmContainsKey(String key, Object field) {
        RMapCache<Object, Object> mapCache = redissonClient.getMapCache(key);
        return mapCache.containsKey(field);
    }

    /**
     * 获取MapCache大小
     *
     * @param key 键
     * @return 大小
     */
    public static int cmSize(String key) {
        RMapCache<Object, Object> mapCache = redissonClient.getMapCache(key);
        return mapCache.size();
    }

    /**
     * 清空MapCache
     *
     * @param key 键
     */
    public static void cmClear(String key) {
        RMapCache<Object, Object> mapCache = redissonClient.getMapCache(key);
        mapCache.clear();
    }
}