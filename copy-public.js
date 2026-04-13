const fs = require('fs');
const path = require('path');

// Копируем папку public в .next/standalone/public
const publicDir = path.join(__dirname, 'public');
const targetDir = path.join(__dirname, '.next', 'standalone', 'public');

if (fs.existsSync(publicDir)) {
  // Создаём папку назначения
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Копируем файлы
  const copyRecursive = (src, dest) => {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (let entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        copyRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };
  
  copyRecursive(publicDir, targetDir);
  console.log('✅ Public files copied to .next/standalone/public');
} else {
  console.log('⚠️ public folder not found');
}
