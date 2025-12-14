// Content Script - 在 Excalidraw 页面中运行
// 这个脚本主要用于确保页面已加载，实际的数据读写由 popup 通过 chrome.scripting.executeScript 完成

console.log('Excalidraw R2 Sync: Content script loaded');

// 可以在这里添加一些辅助功能，比如监听页面变化等
// 目前主要的数据操作都在 popup.js 中通过 executeScript 完成

