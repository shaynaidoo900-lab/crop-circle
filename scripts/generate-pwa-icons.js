import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Clean crop circle logo: concentric rings with healthy crop center
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" fill="none">
  <!-- Outer field circle -->
  <circle cx="96" cy="96" r="88" fill="#22c55e"/>
  <!-- Dark outer ring -->
  <circle cx="96" cy="96" r="88" fill="none" stroke="#166534" stroke-width="4"/>
  <!-- Concentric crop rings -->
  <circle cx="96" cy="96" r="70" fill="none" stroke="#bbf7d0" stroke-width="8" stroke-opacity="0.7"/>
  <circle cx="96" cy="96" r="54" fill="none" stroke="#86efac" stroke-width="7" stroke-opacity="0.8"/>
  <circle cx="96" cy="96" r="38" fill="none" stroke="#4ade80" stroke-width="6" stroke-opacity="0.9"/>
  <circle cx="96" cy="96" r="22" fill="none" stroke="#22c55e" stroke-width="5"/>
  <!-- Center healthy crop -->
  <circle cx="96" cy="96" r="12" fill="#16a34a"/>
  <circle cx="96" cy="96" r="6" fill="#dcfce7"/>
  <!-- Leaf accents -->
  <circle cx="96" cy="16" r="4" fill="#bbf7d0" opacity="0.8"/>
  <circle cx="96" cy="176" r="4" fill="#bbf7d0" opacity="0.8"/>
  <circle cx="16" cy="96" r="4" fill="#bbf7d0" opacity="0.8"/>
  <circle cx="176" cy="96" r="4" fill="#bbf7d0" opacity="0.8"/>
  <!-- Earth tone arc -->
  <path d="M40 156 Q96 144 152 156" stroke="#a16207" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.5"/>
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