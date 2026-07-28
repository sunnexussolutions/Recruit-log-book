// ============================================================
// PIXEL-PERFECT ASSET GENERATOR (SHARP)
// Generates Android icons, adaptive icons, splash screens, & web favicons
// ============================================================

const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');

const rootDir = path.join(__dirname, '..');
const logoSource = path.join(rootDir, 'assets', 'logo.png');
const androidRes = path.join(rootDir, 'android', 'app', 'src', 'main', 'res');

async function generateAssets() {
  console.log('🚀 Generating pixel-perfect Android & Web branding assets from logo.png...');

  if (!await fs.pathExists(logoSource)) {
    console.error('❌ Error: assets/logo.png not found!');
    process.exit(1);
  }

  // Ensure directories
  await fs.ensureDir(path.join(rootDir, 'assets'));
  await fs.ensureDir(path.join(rootDir, 'www', 'assets'));

  // 1. WEB FAVICONS & BRANDING
  console.log('  ➜ Generating Web Favicons & Assets...');
  await sharp(logoSource).resize(32, 32).png().toFile(path.join(rootDir, 'assets', 'favicon.png'));
  await sharp(logoSource).resize(512, 512).png().toFile(path.join(rootDir, 'assets', 'logo-icon.png'));

  // Trim surrounding whitespace from source logo to find exact visual bounds
  const trimmedLogo = await sharp(logoSource).trim().toBuffer();

  // 2. ANDROID LAUNCHER & ADAPTIVE ICONS (PERFECTLY CENTERED WITH BALANCED PADDING - NO ZOOM)
  const iconDensities = [
    { name: 'mipmap-mdpi', iconSize: 48, fgSize: 108, fgInner: 70 },
    { name: 'mipmap-hdpi', iconSize: 72, fgSize: 162, fgInner: 105 },
    { name: 'mipmap-xhdpi', iconSize: 96, fgSize: 216, fgInner: 140 },
    { name: 'mipmap-xxhdpi', iconSize: 144, fgSize: 324, fgInner: 210 },
    { name: 'mipmap-xxxhdpi', iconSize: 192, fgSize: 432, fgInner: 280 }
  ];

  for (const d of iconDensities) {
    const dir = path.join(androidRes, d.name);
    await fs.ensureDir(dir);

    // Standard Launcher Icon (ic_launcher.png) - Centered comfortably on White Canvas (68% scale)
    const bgCanvas = await sharp({
      create: {
        width: d.iconSize,
        height: d.iconSize,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    }).png().toBuffer();

    const logoResized = await sharp(trimmedLogo)
      .resize(Math.round(d.iconSize * 0.68), Math.round(d.iconSize * 0.68), { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toBuffer();

    await sharp(bgCanvas)
      .composite([{ input: logoResized, gravity: 'center' }])
      .toFile(path.join(dir, 'ic_launcher.png'));

    // Round Launcher Icon (ic_launcher_round.png)
    await sharp(bgCanvas)
      .composite([{ input: logoResized, gravity: 'center' }])
      .toFile(path.join(dir, 'ic_launcher_round.png'));

    // Adaptive Icon Foreground (ic_launcher_foreground.png) - Centered in 108x108 Safe Zone (65% scale)
    const fgLogo = await sharp(trimmedLogo)
      .resize(d.fgInner, d.fgInner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    await sharp({
      create: {
        width: d.fgSize,
        height: d.fgSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{ input: fgLogo, gravity: 'center' }])
      .png()
      .toFile(path.join(dir, 'ic_launcher_foreground.png'));

    console.log(`  ✓ Generated ${d.name} launcher & adaptive foreground icons`);
  }

  // 3. SPLASH SCREENS (White background #FFFFFF with centered logo)
  console.log('  ➜ Generating Android Splash Screen Assets...');
  const splashDir = path.join(androidRes, 'drawable');
  await fs.ensureDir(splashDir);

  // General splash.png (800x800 white background, logo centered)
  const splashBase = await sharp({
    create: {
      width: 800,
      height: 800,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  }).png().toBuffer();

  const splashLogo = await sharp(logoSource)
    .resize(400, 400, { fit: 'contain' })
    .toBuffer();

  await sharp(splashBase)
    .composite([{ input: splashLogo, gravity: 'center' }])
    .toFile(path.join(splashDir, 'splash.png'));

  // Portrait and Landscape Splash Densities
  const splashDensities = [
    { name: 'drawable-port-mdpi', w: 320, h: 480, logoW: 180 },
    { name: 'drawable-port-hdpi', w: 480, h: 800, logoW: 260 },
    { name: 'drawable-port-xhdpi', w: 720, h: 1280, logoW: 400 },
    { name: 'drawable-port-xxhdpi', w: 960, h: 1600, logoW: 520 },
    { name: 'drawable-port-xxxhdpi', w: 1280, h: 1920, logoW: 700 },

    { name: 'drawable-land-mdpi', w: 480, h: 320, logoW: 180 },
    { name: 'drawable-land-hdpi', w: 800, h: 480, logoW: 260 },
    { name: 'drawable-land-xhdpi', w: 1280, h: 720, logoW: 400 },
    { name: 'drawable-land-xxhdpi', w: 1600, h: 960, logoW: 520 },
    { name: 'drawable-land-xxxhdpi', w: 1920, h: 1280, logoW: 700 }
  ];

  for (const s of splashDensities) {
    const sDir = path.join(androidRes, s.name);
    await fs.ensureDir(sDir);

    const sBg = await sharp({
      create: {
        width: s.w,
        height: s.h,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    }).png().toBuffer();

    const sLogo = await sharp(logoSource)
      .resize(s.logoW, s.logoW, { fit: 'contain' })
      .toBuffer();

    await sharp(sBg)
      .composite([{ input: sLogo, gravity: 'center' }])
      .toFile(path.join(sDir, 'splash.png'));
  }
  console.log('  ✓ Generated density-specific splash screens (Portrait & Landscape)');

  console.log('🎉 All Android & Web icon/splash assets generated successfully!');
}

generateAssets().catch(err => {
  console.error('❌ Asset generation failed:', err);
  process.exit(1);
});
