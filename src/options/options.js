import { testConnection } from '../utils/r2.js';

// DOM 元素
const endpointInput = document.getElementById('r2Endpoint');
const bucketInput = document.getElementById('r2Bucket');
const accessKeyInput = document.getElementById('r2AccessKey');
const secretKeyInput = document.getElementById('r2SecretKey');
const testBtn = document.getElementById('testBtn');
const saveBtn = document.getElementById('saveBtn');
const messageDiv = document.getElementById('message');

// 加载已保存的配置
function loadConfig() {
  chrome.storage.sync.get(['r2Endpoint', 'r2Bucket', 'r2AccessKey', 'r2SecretKey'], (result) => {
    if (result.r2Endpoint) endpointInput.value = result.r2Endpoint;
    if (result.r2Bucket) bucketInput.value = result.r2Bucket;
    if (result.r2AccessKey) accessKeyInput.value = result.r2AccessKey;
    if (result.r2SecretKey) secretKeyInput.value = result.r2SecretKey;
  });
}

// 显示消息
function showMessage(text, isError = false) {
  messageDiv.textContent = text;
  messageDiv.className = `message ${isError ? 'error' : 'success'}`;
  setTimeout(() => {
    messageDiv.className = 'message';
  }, 5000);
}

// 保存配置
function saveConfig() {
  const config = {
    r2Endpoint: endpointInput.value.trim(),
    r2Bucket: bucketInput.value.trim(),
    r2AccessKey: accessKeyInput.value.trim(),
    r2SecretKey: secretKeyInput.value.trim(),
  };
  
  // 验证
  if (!config.r2Endpoint || !config.r2Bucket || !config.r2AccessKey || !config.r2SecretKey) {
    showMessage('请填写所有字段', true);
    return;
  }
  
  chrome.storage.sync.set(config, () => {
    if (chrome.runtime.lastError) {
      showMessage('保存失败: ' + chrome.runtime.lastError.message, true);
    } else {
      showMessage('配置已保存');
    }
  });
}

// 测试连接
async function testConnectionHandler() {
  // 先保存当前配置
  const config = {
    r2Endpoint: endpointInput.value.trim(),
    r2Bucket: bucketInput.value.trim(),
    r2AccessKey: accessKeyInput.value.trim(),
    r2SecretKey: secretKeyInput.value.trim(),
  };
  
  if (!config.r2Endpoint || !config.r2Bucket || !config.r2AccessKey || !config.r2SecretKey) {
    showMessage('请先填写所有字段', true);
    return;
  }
  
  // 临时保存配置用于测试
  await new Promise((resolve) => {
    chrome.storage.sync.set(config, resolve);
  });
  
  testBtn.disabled = true;
  testBtn.textContent = '测试中...';
  
  try {
    const result = await testConnection();
    if (result.success) {
      showMessage('连接成功！配置正确');
    } else {
      showMessage('连接失败: ' + result.message, true);
    }
  } catch (error) {
    showMessage('测试失败: ' + error.message, true);
  } finally {
    testBtn.disabled = false;
    testBtn.textContent = '测试连接';
  }
}

// 事件监听
saveBtn.addEventListener('click', saveConfig);
testBtn.addEventListener('click', testConnectionHandler);

// 页面加载时读取配置
loadConfig();

