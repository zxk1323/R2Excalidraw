import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';

/**
 * 从 chrome.storage 获取 R2 配置
 */
async function getR2Config() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(['r2Endpoint', 'r2Bucket', 'r2AccessKey', 'r2SecretKey'], (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      
      const { r2Endpoint, r2Bucket, r2AccessKey, r2SecretKey } = result;
      
      if (!r2Endpoint || !r2Bucket || !r2AccessKey || !r2SecretKey) {
        reject(new Error('R2 配置不完整，请先在设置页面配置'));
        return;
      }
      
      resolve({ r2Endpoint, r2Bucket, r2AccessKey, r2SecretKey });
    });
  });
}

/**
 * 创建 S3 客户端
 */
async function createS3Client() {
  const config = await getR2Config();
  
  return new S3Client({
    endpoint: config.r2Endpoint,
    region: 'auto',
    credentials: {
      accessKeyId: config.r2AccessKey,
      secretAccessKey: config.r2SecretKey,
    },
    forcePathStyle: false, // R2 使用虚拟主机风格
  });
}

/**
 * 上传数据到 R2
 * @param {Object} data - 要上传的数据对象
 * @param {string} filename - 文件名，默认为 'excalidraw-backup.json'
 */
export async function uploadData(data, filename = 'excalidraw-backup.json') {
  try {
    const client = await createS3Client();
    const config = await getR2Config();
    
    // 先尝试删除旧文件（如果存在），确保覆盖
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: config.r2Bucket,
        Key: filename,
      });
      await client.send(deleteCommand);
    } catch (deleteError) {
      // 如果文件不存在，忽略删除错误（这是正常的）
      if (deleteError.name !== 'NoSuchKey' && deleteError.$metadata?.httpStatusCode !== 404) {
        console.warn('删除旧文件时出现警告（可忽略）:', deleteError.message);
      }
    }
    
    // 上传新文件
    const jsonString = JSON.stringify(data, null, 2);
    const buffer = new TextEncoder().encode(jsonString);
    
    const command = new PutObjectCommand({
      Bucket: config.r2Bucket,
      Key: filename,
      Body: buffer,
      ContentType: 'application/json',
      // 明确设置元数据，确保覆盖
      Metadata: {
        'upload-timestamp': Date.now().toString(),
      },
    });
    
    await client.send(command);
    return { success: true, message: '上传成功（已覆盖旧文件）' };
  } catch (error) {
    console.error('上传失败:', error);
    return { 
      success: false, 
      message: error.message || '上传失败，请检查配置和网络连接' 
    };
  }
}

/**
 * 从 R2 下载数据
 * @param {string} filename - 文件名，默认为 'excalidraw-backup.json'
 */
export async function downloadData(filename = 'excalidraw-backup.json') {
  try {
    const client = await createS3Client();
    const config = await getR2Config();
    
    const command = new GetObjectCommand({
      Bucket: config.r2Bucket,
      Key: filename,
    });
    
    const response = await client.send(command);
    
    // 将流转换为字符串
    const chunks = [];
    const reader = response.Body.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    // 合并所有 chunks
    const allChunks = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      allChunks.set(chunk, offset);
      offset += chunk.length;
    }
    
    // 转换为字符串并解析 JSON
    const text = new TextDecoder().decode(allChunks);
    const data = JSON.parse(text);
    
    return { success: true, data, message: '下载成功' };
  } catch (error) {
    console.error('下载失败:', error);
    
    // 处理文件不存在的情况
    if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
      return { 
        success: false, 
        message: '云端文件不存在，请先上传数据' 
      };
    }
    
    return { 
      success: false, 
      message: error.message || '下载失败，请检查配置和网络连接' 
    };
  }
}

/**
 * 测试 R2 连接
 */
export async function testConnection() {
  try {
    const client = await createS3Client();
    const config = await getR2Config();
    
    // 尝试列出对象（限制为 1 个，仅用于测试）
    const command = new ListObjectsV2Command({
      Bucket: config.r2Bucket,
      MaxKeys: 1,
    });
    
    await client.send(command);
    return { success: true, message: '连接成功' };
  } catch (error) {
    console.error('连接测试失败:', error);
    
    // 提供更友好的错误信息
    let message = '连接失败';
    if (error.name === 'InvalidAccessKeyId' || error.name === 'SignatureDoesNotMatch') {
      message = 'Access Key 或 Secret Key 错误';
    } else if (error.name === 'NoSuchBucket') {
      message = 'Bucket 不存在';
    } else if (error.message) {
      message = error.message;
    }
    
    return { success: false, message };
  }
}

