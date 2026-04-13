// copy-public.js
const fs = require('fs');
const path = require('path');

// Папка с твоими исходными файлами
const publicDir = path.join(__dirname, 'public');
// Конечная папка, откуда сервер будет их отдавать (ключевой момент!)
const targetDir = path.join(__dirname, '.next', 'standalone', 'public');

console.log('🚀 Начинаем копирование статических файлов...');

if (fs.existsSync(publicDir)) {
    // Создаем конечную папку, если её нет
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    // Функция для копирования всех файлов и папок рекурсивно
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
    console.log('✅ Статические файлы успешно скопированы в .next/standalone/public');
} else {
    console.log('⚠️ Папка public не найдена, копирование отменено.');
}