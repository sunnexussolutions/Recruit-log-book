// ============================================================
// CAPACITOR WEB ASSETS BUILDER (www/)
// Copies static web assets into www/ folder for Android & iOS
// ============================================================

const fs = require('fs-extra');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const wwwDir = path.join(rootDir, 'www');

async function buildWww() {
  console.log('🚀 Packaging web assets for Capacitor (Android & iOS)...');

  try {
    // 1. Clean / create www folder
    await fs.emptyDir(wwwDir);

    // 2. Files to copy to www
    const filesToCopy = [
      'index.html',
      'login.html',
      'admin-dashboard.html',
      'member-dashboard.html'
    ];

    for (const file of filesToCopy) {
      const src = path.join(rootDir, file);
      const dest = path.join(wwwDir, file);
      if (await fs.pathExists(src)) {
        await fs.copy(src, dest);
        console.log(`  ✓ Copied ${file}`);
      }
    }

    // 3. Subdirectories to copy
    const dirsToCopy = ['assets', 'member'];
    for (const dir of dirsToCopy) {
      const src = path.join(rootDir, dir);
      const dest = path.join(wwwDir, dir);
      if (await fs.pathExists(src)) {
        await fs.copy(src, dest);
        console.log(`  ✓ Copied directory ${dir}/`);
      }
    }

    console.log('✅ Web assets successfully bundled in www/ directory!');
  } catch (err) {
    console.error('❌ Build failed:', err);
    process.exit(1);
  }
}

buildWww();
