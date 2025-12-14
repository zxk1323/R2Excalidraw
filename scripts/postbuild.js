import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = join(__dirname, '..', 'dist');

// 移动 HTML 文件到根目录
const popupHtmlPath = join(distDir, 'src', 'popup', 'popup.html');
const optionsHtmlPath = join(distDir, 'src', 'options', 'options.html');
const targetPopupHtml = join(distDir, 'popup.html');
const targetOptionsHtml = join(distDir, 'options.html');

if (existsSync(popupHtmlPath)) {
  let content = readFileSync(popupHtmlPath, 'utf-8');
  // 修复脚本路径：从 /assets/ 改为 ./assets/
  content = content.replace(/src="\/assets\//g, 'src="./assets/');
  content = content.replace(/href="\/assets\//g, 'href="./assets/');
  writeFileSync(targetPopupHtml, content, 'utf-8');
  console.log('✓ Moved and fixed popup.html');
}

if (existsSync(optionsHtmlPath)) {
  let content = readFileSync(optionsHtmlPath, 'utf-8');
  // 修复脚本路径：从 /assets/ 改为 ./assets/
  content = content.replace(/src="\/assets\//g, 'src="./assets/');
  content = content.replace(/href="\/assets\//g, 'href="./assets/');
  writeFileSync(targetOptionsHtml, content, 'utf-8');
  console.log('✓ Moved and fixed options.html');
}

// 复制 manifest.json（如果插件没有自动复制）
const manifestSrc = join(__dirname, '..', 'manifest.json');
const manifestDest = join(distDir, 'manifest.json');
if (existsSync(manifestSrc) && !existsSync(manifestDest)) {
  copyFileSync(manifestSrc, manifestDest);
  console.log('✓ Copied manifest.json');
}

// 确保 icons 目录存在
const iconsDest = join(distDir, 'icons');
if (!existsSync(iconsDest)) {
  mkdirSync(iconsDest, { recursive: true });
}

console.log('✓ Post-build processing complete');

