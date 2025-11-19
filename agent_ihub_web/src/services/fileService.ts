/**
 * File Service - Handles tool and knowledge base file uploads
 */

import ResponseCode from '@/constants/ResponseCode';
import {
  deleteFile,
  deleteFiles,
  uploadKnowledgeFile1,
  getFileInfosByIds,
} from '../api';
import type {
  ConversionProgressDTO,
  FileInfoDTO,
  RConversionProgressDTO,
} from '../api';
import { apiCall, tokenManager } from './apiClient';
import type { ApiResponse } from './apiClient';

// Extended types for file service
export interface FileUploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  result?: FileInfoDTO;
}

export interface BatchUploadResult {
  succeeded: FileInfoDTO[];
  failed: Array<{ file: File; error: string }>;
  total: number;
}

export type FileType = 'TOOLS' | 'KNOWLEDGE';

/**
 * File Service Class
 */
class FileService {
  /**
   * Upload tool file
   * @param file Tool file (JSON or YML format)
   * @returns Upload result
   */
  async uploadToolFile(file: File): Promise<ApiResponse<FileInfoDTO>> {
    try {
      // Build FormData
      const formData = new FormData();
      formData.append('file', file);

      // Use native fetch for upload, ensuring correct multipart/form-data format
      const token = tokenManager.getToken();
      const response = await fetch('/api/v1/file/tool', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // Don't manually set Content-Type, let browser set boundary automatically
        },
        body: formData,
      });

      const result = await response.json();

      if (result.code === 200 && result.data) {
        return {
          success: true,
          data: result.data,
          message: '工具文件上传成功！',
          code: 200,
        };
      } else {
        return {
          success: false,
          message: result.message || '工具文件上传失败',
          code: result.code || -1,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '工具文件上传异常',
        code: -1,
      };
    }
  }

  /**
   * Upload knowledge base file
   * @param file Knowledge base file (doc, ppt, pdf, txt formats)
   * @returns Upload result
   */
  async uploadKnowledgeFile(file: File): Promise<ApiResponse<FileInfoDTO>> {
    // Validate file size (assuming 50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return {
        success: false,
        message: '文件大小不能超过 50MB',
        code: -1,
      };
    }

    try {
      // Build FormData
      const formData = new FormData();
      formData.append('file', file);

      // Use native fetch for upload, ensuring correct multipart/form-data format
      const token = tokenManager.getToken();
      const response = await fetch('/api/v1/file/knowledge', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // Don't manually set Content-Type, let browser set boundary automatically
        },
        body: formData,
      });

      const result = await response.json();

      if (result.code === 200 && result.data) {
        return {
          success: true,
          data: result.data,
          message: '知识库文件上传成功！',
          code: 200,
        };
      } else {
        return {
          success: false,
          message: result.message || '知识库文件上传失败',
          code: result.code || -1,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '知识库文件上传异常',
        code: -1,
      };
    }
  }

  /**
   * Delete file
   * @param fileId File ID
   * @returns Delete result
   */
  async deleteFile(fileId: string): Promise<ApiResponse<boolean>> {
    return apiCall(() => deleteFile({ path: { id: fileId } }), {
      showSuccessNotification: true,
      successMessage: '文件删除成功！',
      showErrorNotification: true,
      errorTitle: '文件删除失败',
    });
  }

  /**
   * Batch delete files
   * @param fileIds List of file IDs
   * @returns Delete result
   */
  async deleteFiles(fileIds: string[]): Promise<ApiResponse<boolean>> {
    if (fileIds.length === 0) {
      return {
        success: false,
        message: '请选择要删除的文件',
        code: -1,
      };
    }

    return apiCall(() => deleteFiles({ body: fileIds }), {
      showSuccessNotification: true,
      successMessage: `成功删除 ${fileIds.length} 个文件`,
      showErrorNotification: true,
      errorTitle: '批量删除失败',
    });
  }

  /**
   * Get file information by file ID list
   * @param fileIds List of file IDs
   * @returns List of file information
   */
  async getFileInfosByIds(
    fileIds: string[]
  ): Promise<ApiResponse<FileInfoDTO[]>> {
    if (fileIds.length === 0) {
      return {
        success: true,
        data: [],
        message: '文件ID列表为空',
        code: 200,
      };
    }

    return apiCall(() => getFileInfosByIds({ body: fileIds }), {
      showSuccessNotification: false,
      showErrorNotification: true,
      errorTitle: '获取文件信息失败',
    });
  }

  /**
   * Get knowledge base file upload progress
   * @param fileId File ID
   * @returns Upload progress
   */
  async getKnowledgeFileUploadProgress(
    fileId: string
  ): Promise<ApiResponse<RConversionProgressDTO>> {
    return apiCall(() => uploadKnowledgeFile1({ query: { fileId } }), {
      showSuccessNotification: false, // Don't show notification during polling
    });
  }

  /**
   * Poll knowledge base file upload progress until completion
   * @param fileId File ID
   * @param onProgress Progress callback
   * @param interval Polling interval (milliseconds), default 1000ms
   * @param maxAttempts Maximum number of attempts, default 300 (5 minutes)
   * @returns Final file information
   */
  async pollKnowledgeFileProgress(
    fileId: string,
    onProgress?: (progress: number, stage: string, detail?: string) => void,
    interval: number = 1000,
    maxAttempts: number = 300
  ): Promise<ApiResponse<FileInfoDTO>> {
    let attempts = 0;

    return new Promise((resolve) => {
      const poll = async () => {
        attempts++;

        try {
          const response = await this.getKnowledgeFileUploadProgress(fileId);

          if (response.code === ResponseCode.S_OK) {
            const progressData = response.data as ConversionProgressDTO;
            const progress = progressData?.progress || 0;
            const stage = progressData?.stage || '';
            const detail = progressData?.detail || '';

            // Call progress callback
            if (onProgress) {
              onProgress(progress, stage, detail);
            }

            // If progress reaches 100, upload is complete
            if (progress >= 100) {
              // progressData.fileInfoDTO = null;
              // Progress reached 100, but file info is empty or null, indicating processing failure
              if (!progressData.fileInfoDTO) {
                resolve({
                  success: false,
                  data: undefined,
                  message: '知识库文件处理失败：文件解析错误，请稍后重试',
                  code: ResponseCode.S_OK,
                });
                return;
              }
              resolve({
                success: true,
                data: progressData.fileInfoDTO,
                message: '知识库文件处理完成',
                code: ResponseCode.S_OK,
              });
              return;
            }

            // If max attempts not reached, continue polling
            if (attempts < maxAttempts) {
              setTimeout(poll, interval);
            } else {
              resolve({
                success: false,
                message: '知识库文件处理超时，请稍后重试',
                code: -1,
              });
            }
          } else {
            // Failed to get progress
            resolve({
              success: false,
              message: response.message || '获取上传进度失败',
              code: response.code || -1,
            });
          }
        } catch (error: any) {
          resolve({
            success: false,
            message: error.message || '获取上传进度异常',
            code: -1,
          });
        }
      };

      // Start polling
      poll();
    });
  }

  /**
   * Batch upload tool files
   * @param files List of files
   * @param onProgress Upload progress callback
   * @returns Batch upload result
   */
  async batchUploadToolFiles(
    files: File[],
    onProgress?: (progress: FileUploadProgress[]) => void
  ): Promise<BatchUploadResult> {
    const results: FileUploadProgress[] = files.map((file) => ({
      file,
      progress: 0,
      status: 'pending',
    }));

    const succeeded: FileInfoDTO[] = [];
    const failed: Array<{ file: File; error: string }> = [];

    // Update progress callback
    const updateProgress = () => {
      if (onProgress) {
        onProgress([...results]);
      }
    };

    // Concurrently upload files
    const uploadPromises = files.map(async (file, index) => {
      try {
        results[index].status = 'uploading';
        results[index].progress = 0;
        updateProgress();

        const response = await this.uploadToolFile(file);

        if (response.success && response.data) {
          results[index].status = 'success';
          results[index].progress = 100;
          results[index].result = response.data;
          succeeded.push(response.data);
        } else {
          results[index].status = 'error';
          results[index].error = response.message || '上传失败';
          failed.push({ file, error: response.message || '上传失败' });
        }
      } catch (error: any) {
        results[index].status = 'error';
        results[index].error = error.message || '上传异常';
        failed.push({ file, error: error.message || '上传异常' });
      }

      updateProgress();
    });

    await Promise.all(uploadPromises);

    return {
      succeeded,
      failed,
      total: files.length,
    };
  }

  /**
   * Batch upload knowledge base files
   * @param files List of files
   * @param onProgress Upload progress callback
   * @returns Batch upload result
   */
  async batchUploadKnowledgeFiles(
    files: File[],
    onProgress?: (progress: FileUploadProgress[]) => void
  ): Promise<BatchUploadResult> {
    const results: FileUploadProgress[] = files.map((file) => ({
      file,
      progress: 0,
      status: 'pending',
    }));

    const succeeded: FileInfoDTO[] = [];
    const failed: Array<{ file: File; error: string }> = [];

    // Update progress callback
    const updateProgress = () => {
      if (onProgress) {
        onProgress([...results]);
      }
    };

    // Concurrently upload files
    const uploadPromises = files.map(async (file, index) => {
      try {
        results[index].status = 'uploading';
        results[index].progress = 0;
        updateProgress();

        const response = await this.uploadKnowledgeFile(file);

        if (response.success && response.data) {
          results[index].status = 'success';
          results[index].progress = 100;
          results[index].result = response.data;
          succeeded.push(response.data);
        } else {
          results[index].status = 'error';
          results[index].error = response.message || '上传失败';
          failed.push({ file, error: response.message || '上传失败' });
        }
      } catch (error: any) {
        results[index].status = 'error';
        results[index].error = error.message || '上传异常';
        failed.push({ file, error: error.message || '上传异常' });
      }

      updateProgress();
    });

    await Promise.all(uploadPromises);

    return {
      succeeded,
      failed,
      total: files.length,
    };
  }

  /**
   * Validate file type
   * @param file File object
   * @param type File usage type
   * @returns Validation result
   */
  validateFileType(
    file: File,
    type: FileType
  ): { valid: boolean; message?: string } {
    if (type === 'TOOLS') {
      const validExtensions = ['.json', '.yml', '.yaml'];
      const fileName = file.name.toLowerCase();
      const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

      return {
        valid: isValid,
        message: isValid ? undefined : '工具文件只支持 JSON 或 YML 格式',
      };
    } else if (type === 'KNOWLEDGE') {
      const validExtensions = [
        '.doc',
        '.docx',
        '.ppt',
        '.pptx',
        '.pdf',
        '.txt',
        '.md',
      ];
      const fileName = file.name.toLowerCase();
      const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

      return {
        valid: isValid,
        message: isValid
          ? undefined
          : '知识库文件只支持 DOC、PPT、PDF、TXT、MD 格式',
      };
    }

    return {
      valid: false,
      message: '未知的文件类型',
    };
  }

  /**
   * Format file size
   * @param bytes Number of bytes
   * @returns Formatted size string
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file extension
   * @param fileName File name
   * @returns Extension (including dot)
   */
  getFileExtension(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    return lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : '';
  }

  /**
   * Generate file preview information
   * @param file File object
   * @returns Preview information
   */
  generateFilePreview(file: File): {
    name: string;
    size: string;
    type: string;
    extension: string;
    lastModified: string;
  } {
    return {
      name: file.name,
      size: this.formatFileSize(file.size),
      type: file.type || '未知',
      extension: this.getFileExtension(file.name),
      lastModified: new Date(file.lastModified).toLocaleString('zh-CN'),
    };
  }
}

// Export singleton instance
export const fileService = new FileService();

// Compatibility export
export default fileService;
