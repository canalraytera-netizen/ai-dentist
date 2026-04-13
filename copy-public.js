const fs = require('fs');
const path = require('path');

console.log('🚀 Starting to copy public files...');

const publicDir = path.join(__dirname, 'public');
// Это та самая "правильная" папка на сервере
const targetDir = path.join(__dirname, '.next', 'standalone', 'public');

if (fs.existsSync(publicDir)) {
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    // Функция для рекурсивного копирования всех файлов и папок
    const copyRecursiveSync = (src, dest) => {
        const entries = fs.readdirSync(src, { withFileTypes: true });
        for (let entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            if (entry.isDirectory()) {
                if (!fs.existsSync(destPath)) {
                    fs.mkdirSync(destPath, { recursive: true });
                }
                copyRecursiveSync(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    };

    copyRecursiveSync(publicDir, targetDir);
    console.log('✅ Successfully copied public files to .next/standalone/public');
} else {
    console.log('⚠️ public folder not found, skipping copy.');
}
