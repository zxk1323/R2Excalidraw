import { uploadData, downloadData } from '../utils/r2.js';

const uploadBtn = document.getElementById('uploadBtn');
const downloadBtn = document.getElementById('downloadBtn');
const settingsBtn = document.getElementById('settingsBtn');
const statusDiv = document.getElementById('status');

// 显示状态消息
function showStatus(message, type = 'info') {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  setTimeout(() => {
    statusDiv.className = 'status';
  }, 5000);
}

// 获取当前活动的 Excalidraw 标签页
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) {
    throw new Error('无法获取当前标签页');
  }
  
  // 检查是否是 Excalidraw 页面
  if (!tab.url || !tab.url.includes('excalidraw.com')) {
    throw new Error('当前页面不是 Excalidraw，请先打开 Excalidraw.com');
  }
  
  return tab;
}

// 从 Excalidraw 页面读取 localStorage 数据
async function readExcalidrawData(tabId) {
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const keys = ['excalidraw', 'excalidraw-state', 'excalidraw-files'];
      const data = {};
      
      keys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value !== null) {
          data[key] = value;
        }
      });
      
      return data;
    },
  });
  
  return result[0].result;
}

// 写入数据到 Excalidraw 页面并刷新
async function writeExcalidrawData(tabId, data) {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (dataToWrite) => {
      // 清空现有数据
      localStorage.clear();
      
      // 写入新数据
      Object.entries(dataToWrite).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
      
      // 刷新页面以加载新数据
      location.reload();
    },
    args: [data],
  });
}

// 上传功能
async function handleUpload() {
  try {
    uploadBtn.disabled = true;
    showStatus('正在读取数据...', 'info');
    
    const tab = await getCurrentTab();
    const data = await readExcalidrawData(tab.id);
    
    if (Object.keys(data).length === 0) {
      showStatus('未找到 Excalidraw 数据', 'error');
      uploadBtn.disabled = false;
      return;
    }
    
    showStatus('正在上传...', 'info');
    const result = await uploadData(data);
    
    if (result.success) {
      showStatus('✅ ' + result.message, 'success');
    } else {
      showStatus('❌ ' + result.message, 'error');
    }
  } catch (error) {
    showStatus('❌ ' + error.message, 'error');
  } finally {
    uploadBtn.disabled = false;
  }
}

// 下载功能
async function handleDownload() {
  try {
    downloadBtn.disabled = true;
    showStatus('正在下载...', 'info');
    
    const tab = await getCurrentTab();
    const result = await downloadData();
    
    if (!result.success) {
      showStatus('❌ ' + result.message, 'error');
      downloadBtn.disabled = false;
      return;
    }
    
    showStatus('正在写入数据...', 'info');
    await writeExcalidrawData(tab.id, result.data);
    
    showStatus('✅ 数据已下载，页面即将刷新', 'success');
    // 注意：页面会刷新，所以这个状态可能看不到
  } catch (error) {
    showStatus('❌ ' + error.message, 'error');
    downloadBtn.disabled = false;
  }
}

// 打开设置页面
function handleSettings() {
  chrome.runtime.openOptionsPage();
}

// 事件监听
uploadBtn.addEventListener('click', handleUpload);
downloadBtn.addEventListener('click', handleDownload);
settingsBtn.addEventListener('click', handleSettings);

