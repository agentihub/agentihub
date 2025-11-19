package com.litevar.ihub.common.milvus.service;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * 向量库操作
 * @author Teoan
 * @since 2025/9/24 15:11
 */
@Slf4j
@Service
@AllArgsConstructor
public class VectorStoreService {

    private final VectorStore vectorStore;

    /**
     * 插入单条文本内容
     *
     * @param content 要插入的文本
     * @param metadata 附加的元数据
     */
    public String addDocuments(String content, Map<String, Object> metadata) {
        log.debug("Adding document to Milvus: '{}'", content);
        Document document = new Document(content, metadata);
        vectorStore.add(List.of(document));
        log.debug("Document added successfully.");
        return document.getId();

    }
    /**
     * 根据查询文本执行相似度搜索
     *
     * @param query 查询内容
     * @param topK  返回最相似的 K 个结果
     * @return 相似的 Document 列表，按相似度从高到低排序
     */
    public List<Document> findDocuments(String query, int topK,double similarityThreshold) {
        log.debug("Finding top {} similar documents for: '{}'", topK, query);
        SearchRequest request = SearchRequest.builder().query(query).topK(topK).similarityThreshold(similarityThreshold).build();
        List<Document> similarDocuments = vectorStore.similaritySearch(request);
        log.debug("Found {} similar documents.", similarDocuments.size());
        return similarDocuments;
    }


    /**
     * 删除指定的文档
     *
     * @param documentIds 要删除的文档ID列表
     */
    public void deleteDocuments(List<String> documentIds){
        vectorStore.delete(documentIds);
    }

}