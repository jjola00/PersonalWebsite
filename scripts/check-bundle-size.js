#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeBundleSize() {
  const nextDir = path.join(process.cwd(), '.next');
  const staticDir = path.join(nextDir, 'static');
  
  if (!fs.existsSync(staticDir)) {
    console.log('❌ No build found. Run "npm run build" first.');
    return;
  }

  console.log('📊 Bundle Size Analysis\n');
  
  // Get all JS files in static directory
  function getJSFiles(dir) {
    let files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files = files.concat(getJSFiles(fullPath));
      } else if (item.endsWith('.js')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }
  
  const jsFiles = getJSFiles(staticDir);
  let totalSize = 0;
  
  console.log('JavaScript Files:');
  jsFiles.forEach(file => {
    const size = getFileSize(file);
    totalSize += size;
    const relativePath = path.relative(process.cwd(), file);
    console.log(`  ${relativePath}: ${formatBytes(size)}`);
  });
  
  console.log(`\n📦 Total JS Bundle Size: ${formatBytes(totalSize)}`);
  
  // Check against limits
  const limits = {
    warning: 400 * 1024, // 400KB
    error: 500 * 1024    // 500KB
  };
  
  if (totalSize > limits.error) {
    console.log('🚨 Bundle size exceeds 500KB limit!');
    process.exit(1);
  } else if (totalSize > limits.warning) {
    console.log('⚠️  Bundle size approaching 500KB limit');
  } else {
    console.log('✅ Bundle size is within acceptable limits');
  }
}

analyzeBundleSize();