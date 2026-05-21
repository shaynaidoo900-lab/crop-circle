import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Clean crop circle logo: concentric rings with healthy crop center
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" fill="none">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#16a34a"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>
    <linearGradient id="ring1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#86efac"/>
      <stop offset="100%" stop-color="#4ade80"/>
    </linearGradient>
  </defs>
  <circle cx="96" cy="96" r="90" fill="url(#bg)"/>
  <circle cx="96" cy="96" r="82" fill="none" stroke="#166534" stroke-width="2.5" stroke-opacity="0.6"/>
  <circle cx="96" cy="96" r="62" fill="none" stroke="url(#ring1)" stroke-width="7" stroke-linecap="round"/>
  <circle cx="96" cy="96" r="38" fill="none" stroke="#4ade80" stroke-width="5" stroke-opacity="0.75" stroke-linecap="round"/>
  <circle cx="96" cy="96" r="12" fill="#166534"/>
  <circle cx="96" cy="96" r="5" fill="#ffffff"/>
  <path d="M46 150 Q96 142 146 150" stroke="#a3a3a3" stroke-width="4" stroke-linecap="round" fill="none" stroke-opacity="0.35"/>
</svg>`;

const sizes = [
  { name: 'pwa-192.png', size: 192 },
  { name: 'pwa-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'maskable-icon.png', size: 512 },
];

const outDir = path.join(__dirname, '..', 'public');

async function generateIcons() {
  // Generate main icons
  for (const { name, size } of sizes) {
    await sharp(Buffer.from(svg))
      .resize(size, size, { fit: 'contain', background: '#22c55e' })
      .png()
      .toFile(path.join(outDir, name));
    console.log(`Generated ${name} (${size}x${size})`);
  }

  // Generate favicon-32.png
  await sharp(Buffer.from(svg))
    .resize(32, 32, { fit: 'contain', background: '#22c55e' })
    .png()
    .toFile(path.join(outDir, 'favicon-32.png'));
  console.log('Generated favicon-32.png (32x32)');

  // Also save SVG version
  const fs = await import('fs');
  fs.writeFileSync(path.join(outDir, 'favicon.svg'), svg);
  console.log('Generated favicon.svg');
}

generateIcons().catch(console.error);