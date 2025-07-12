const fs = require('fs');
const path = require('path');

// Simple SVG to PNG conversion (using Canvas)
const { createCanvas, loadImage } = require('canvas');

// SVG data
const svgData = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background circle -->
  <circle cx="256" cy="256" r="240" fill="#7c3aed" stroke="#5b21b6" stroke-width="8"/>
  
  <!-- Microphone icon -->
  <rect x="220" y="160" width="72" height="120" rx="36" fill="white"/>
  <rect x="240" y="280" width="32" height="60" rx="16" fill="white"/>
  
  <!-- Sound wave lines -->
  <path d="M 320 200 Q 340 180, 360 200 Q 380 220, 400 200 Q 420 180, 440 200" stroke="white" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M 320 240 Q 340 220, 360 240 Q 380 260, 400 240 Q 420 220, 440 240" stroke="white" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M 320 280 Q 340 260, 360 280 Q 380 300, 400 280 Q 420 260, 440 280" stroke="white" stroke-width="8" fill="none" stroke-linecap="round"/>
  
  <!-- Voice detection indicator points -->
  <circle cx="180" cy="200" r="8" fill="#ef4444"/>
  <circle cx="180" cy="240" r="8" fill="#ef4444"/>
  <circle cx="180" cy="280" r="8" fill="#ef4444"/>
  <circle cx="180" cy="320" r="8" fill="#10b981"/>
</svg>`;

async function generateIcons() {
  try {
    // Convert SVG to Data URL
    const svgDataUrl = 'data:image/svg+xml;base64,' + Buffer.from(svgData).toString('base64');
    
    // Generate different icon sizes
    const sizes = [16, 32, 192, 512];
    
    for (const size of sizes) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      // Load SVG image
      const img = await loadImage(svgDataUrl);
      
      // Draw to canvas
      ctx.drawImage(img, 0, 0, size, size);
      
      // Save as PNG
      const buffer = canvas.toBuffer('image/png');
      const filename = size === 16 ? 'favicon.ico' : `logo${size}.png`;
      const filepath = path.join(__dirname, 'public', filename);
      
      fs.writeFileSync(filepath, buffer);
      console.log(`Generated ${filename}`);
    }
    
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    console.log('Please install canvas: npm install canvas');
  }
}

generateIcons(); 