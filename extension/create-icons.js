// Script to create optimized PNG icon files
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Ensure assets directory exists
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}

// Base SVG icon for BookmarkBurst (simple bookmark icon)
const svgIcon = `
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="4" width="120" height="120" rx="8" fill="#f9f9f9" stroke="black" stroke-width="4"/>
  <path d="M35 25 V95 L64 75 L93 95 V25 Z" fill="#4a9fff" stroke="black" stroke-width="4"/>
</svg>
`;

// Create different sized optimized PNG files
async function createIcons() {
  // Create SVG buffer
  const svgBuffer = Buffer.from(svgIcon);
  
  // Create 16x16 icon
  await sharp(svgBuffer)
    .resize(16, 16)
    .png({ quality: 60, compressionLevel: 9 })
    .toFile(path.join(assetsDir, 'icon16.png'));
  
  // Create 32x32 icon
  await sharp(svgBuffer)
    .resize(32, 32)
    .png({ quality: 70, compressionLevel: 9 })
    .toFile(path.join(assetsDir, 'icon32.png'));
  
  // Create 48x48 icon
  await sharp(svgBuffer)
    .resize(48, 48)
    .png({ quality: 75, compressionLevel: 9 })
    .toFile(path.join(assetsDir, 'icon48.png'));
  
  // Create 128x128 icon
  await sharp(svgBuffer)
    .resize(128, 128)
    .png({ quality: 80, compressionLevel: 9 })
    .toFile(path.join(assetsDir, 'icon128.png'));
  
  console.log('Optimized icon files created successfully in the assets directory!');
}

// Run the icon creation
createIcons().catch(err => {
  console.error('Error creating icons:', err);
}); 