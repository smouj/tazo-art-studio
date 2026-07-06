import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const assetsDir = path.join(repoRoot, 'public', 'tazo-assets');
const outDir = path.join(repoRoot, 'public', 'examples');
fs.mkdirSync(outDir, { recursive: true });

const COLLECTIONS = [
  {
    id: 'minimon',
    name: 'Minimon',
    color: '#FFCB05',
    accent: '#E3350D',
    bgFiles: ['minimon-agua.png', 'minimon-fuego.png', 'minimon-planta.png', 'minimon-electrico.png'],
    backFile: 'back-minimon.png',
    desc: '18 elemental creature backgrounds',
  },
  {
    id: 'dracobell',
    name: 'Dracobell',
    color: '#FF6B00',
    accent: '#FF4500',
    bgFiles: ['dracobell-draco.png', 'dracobell-fuego.png', 'dracobell-rayo.png', 'dracobell-oscuro.png'],
    backFile: 'back-dracobell.png',
    desc: '10 mystic warrior backgrounds',
  },
  {
    id: 'cybermon',
    name: 'Cybermon',
    color: '#00A1E9',
    accent: '#3B4CCA',
    bgFiles: ['cybermon-base.png', 'cybermon-nexus.png', 'cybermon-villano.png', 'cybermon-personaje.png'],
    backFile: 'back-cybermon.png',
    desc: '9 digital realm backgrounds',
  },
];

// Label helper: draw text on canvas
async function addLabel(canvas, text, x, y, fontSize, color) {
  const svg = `<svg width="800" height="100">
    <text x="${x}" y="${y + fontSize}" 
      font-family="Arial, sans-serif" font-weight="900" font-size="${fontSize}"
      fill="${color}" text-anchor="middle" 
      stroke="#1a1a1a" stroke-width="3" paint-order="stroke">
      ${text.toUpperCase()}
    </text>
  </svg>`;
  return sharp(canvas)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png()
    .toBuffer();
}

// Create individual tazo card showcase (front + back side by side)
async function createTazoCard(collection) {
  const frontBgPath = path.join(assetsDir, 'frontal', collection.id, collection.bgFiles[0]);
  const backPath = path.join(assetsDir, 'back', collection.backFile);

  const cardSize = 400;
  const gap = 40;
  const labelHeight = 80;
  const totalWidth = cardSize * 2 + gap + 60;
  const totalHeight = cardSize + labelHeight + 60;

  // Circular mask
  const circleMask = Buffer.from(
    `<svg width="${cardSize}" height="${cardSize}">
      <circle cx="${cardSize / 2}" cy="${cardSize / 2}" r="${cardSize / 2 - 4}" fill="white"/>
    </svg>`
  );

  // Front
  const front = await sharp(frontBgPath)
    .resize(cardSize, cardSize, { fit: 'cover', position: 'center' })
    .composite([{
      input: circleMask,
      blend: 'dest-in'
    }])
    .png()
    .toBuffer();

  // Front border
  const frontBorder = Buffer.from(
    `<svg width="${cardSize}" height="${cardSize}">
      <circle cx="${cardSize / 2}" cy="${cardSize / 2}" r="${cardSize / 2 - 4}" 
        fill="none" stroke="${collection.color}" stroke-width="6"/>
    </svg>`
  );

  const frontWithBorder = await sharp(front)
    .composite([{ input: frontBorder }])
    .png()
    .toBuffer();

  // Back
  const back = await sharp(backPath)
    .resize(cardSize, cardSize, { fit: 'cover', position: 'center' })
    .composite([{ input: circleMask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const backBorder = Buffer.from(
    `<svg width="${cardSize}" height="${cardSize}">
      <circle cx="${cardSize / 2}" cy="${cardSize / 2}" r="${cardSize / 2 - 4}" 
        fill="none" stroke="${collection.accent}" stroke-width="6"/>
    </svg>`
  );

  const backWithBorder = await sharp(back)
    .composite([{ input: backBorder }])
    .png()
    .toBuffer();

  // Create labels
  const frontLabel = Buffer.from(
    `<svg width="${cardSize}" height="${labelHeight}">
      <text x="${cardSize / 2}" y="${labelHeight / 2 + 10}" 
        font-family="Arial, sans-serif" font-weight="900" font-size="24"
        fill="${collection.color}" text-anchor="middle" 
        stroke="#1a1a1a" stroke-width="2" paint-order="stroke">
        FRONT
      </text>
    </svg>`
  );

  const backLabel = Buffer.from(
    `<svg width="${cardSize}" height="${labelHeight}">
      <text x="${cardSize / 2}" y="${labelHeight / 2 + 10}" 
        font-family="Arial, sans-serif" font-weight="900" font-size="24"
        fill="${collection.accent}" text-anchor="middle" 
        stroke="#1a1a1a" stroke-width="2" paint-order="stroke">
        BACK
      </text>
    </svg>`
  );

  // Assemble full card image
  const padding = 30;
  const cardWidth = cardSize * 2 + gap + padding * 2;
  const cardHeight = cardSize + labelHeight + padding * 2;

  const cardCanvas = await sharp({
    create: {
      width: cardWidth,
      height: cardHeight,
      channels: 4,
      background: { r: 26, g: 26, b: 26, alpha: 1 },
    },
  })
    .png()
    .toBuffer();

  // Add title
  const titleSvg = Buffer.from(
    `<svg width="${cardWidth}" height="40">
      <text x="${cardWidth / 2}" y="26" 
        font-family="Arial, sans-serif" font-weight="900" font-size="20"
        fill="${collection.color}" text-anchor="middle">
        ${collection.name.toUpperCase()} TAZO
      </text>
    </svg>`
  );

  const result = await sharp(cardCanvas)
    .composite([
      { input: titleSvg, top: 5, left: 0 },
      { input: frontWithBorder, top: padding + 10, left: padding },
      { input: frontLabel, top: padding + cardSize + 5, left: padding },
      { input: backWithBorder, top: padding + 10, left: padding + cardSize + gap },
      { input: backLabel, top: padding + cardSize + 5, left: padding + cardSize + gap },
    ])
    .png()
    .toBuffer();

  return result;
}

// Create a dense showcase grid with all background variants
async function createShowcaseGrid(collection) {
  const bgFiles = fs.readdirSync(path.join(assetsDir, 'frontal', collection.id))
    .filter(f => f.endsWith('.png'));

  const cols = 3;
  const rows = Math.ceil(bgFiles.length / cols);
  const tile = 250;
  const gap = 16;
  const padding = 40;
  const labelHeight = 40;
  const width = tile * cols + gap * (cols - 1) + padding * 2;
  const height = tile * rows + gap * (rows - 1) + padding * 2 + labelHeight;

  const circleMask = Buffer.from(
    `<svg width="${tile}" height="${tile}">
      <circle cx="${tile / 2}" cy="${tile / 2}" r="${tile / 2 - 3}" fill="white"/>
    </svg>`
  );

  const composites = [];

  // Title
  const titleSvg = Buffer.from(
    `<svg width="${width}" height="${labelHeight}">
      <text x="${width / 2}" y="${labelHeight - 8}" 
        font-family="Arial, sans-serif" font-weight="900" font-size="28"
        fill="${collection.color}" text-anchor="middle" 
        stroke="#1a1a1a" stroke-width="3" paint-order="stroke">
        ${collection.name.toUpperCase()} — ${bgFiles.length} FRONTAL BACKGROUNDS
      </text>
    </svg>`
  );
  composites.push({ input: titleSvg, top: 0, left: 0 });

  for (let i = 0; i < bgFiles.length; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = padding + col * (tile + gap);
    const y = padding + labelHeight + row * (tile + gap);

    const bgBuffer = await sharp(
      path.join(assetsDir, 'frontal', collection.id, bgFiles[i])
    )
      .resize(tile, tile, { fit: 'cover', position: 'center' })
      .composite([{ input: circleMask, blend: 'dest-in' }])
      .png()
      .toBuffer();

    // Border
    const border = Buffer.from(
      `<svg width="${tile}" height="${tile}">
        <circle cx="${tile / 2}" cy="${tile / 2}" r="${tile / 2 - 4}" 
          fill="none" stroke="${collection.color}" stroke-width="4"/>
      </svg>`
    );

    const withBorder = await sharp(bgBuffer)
      .composite([{ input: border }])
      .png()
      .toBuffer();

    composites.push({ input: withBorder, top: y, left: x });
  }

  const canvas = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 26, g: 26, b: 26, alpha: 1 },
    },
  })
    .composite(composites)
    .png()
    .toBuffer();

  return canvas;
}

// Create back designs showcase
async function createBackShowcase() {
  const backFiles = fs.readdirSync(path.join(assetsDir, 'back')).filter(f => f.endsWith('.png'));
  const tile = 300;
  const gap = 30;
  const padding = 40;
  const labelHeight = 50;
  const width = tile * backFiles.length + gap * (backFiles.length - 1) + padding * 2;
  const height = tile + labelHeight + padding * 2;

  const circleMask = Buffer.from(
    `<svg width="${tile}" height="${tile}">
      <circle cx="${tile / 2}" cy="${tile / 2}" r="${tile / 2 - 3}" fill="white"/>
    </svg>`
  );

  const composites = [];

  const titleSvg = Buffer.from(
    `<svg width="${width}" height="${labelHeight}">
      <text x="${width / 2}" y="${labelHeight - 12}" 
        font-family="Arial, sans-serif" font-weight="900" font-size="28"
        fill="#FFCC00" text-anchor="middle" 
        stroke="#1a1a1a" stroke-width="3" paint-order="stroke">
        COLLECTION BACK DESIGNS
      </text>
    </svg>`
  );
  composites.push({ input: titleSvg, top: 0, left: 0 });

  const backColors = {
    'back-minimon.png': '#FFCB05',
    'back-dracobell.png': '#FF6B00',
    'back-cybermon.png': '#00A1E9',
  };

  for (let i = 0; i < backFiles.length; i++) {
    const x = padding + i * (tile + gap);
    const y = padding + labelHeight;

    const imgBuffer = await sharp(path.join(assetsDir, 'back', backFiles[i]))
      .resize(tile, tile, { fit: 'cover', position: 'center' })
      .composite([{ input: circleMask, blend: 'dest-in' }])
      .png()
      .toBuffer();

    const borderColor = backColors[backFiles[i]] || '#FFCC00';
    const border = Buffer.from(
      `<svg width="${tile}" height="${tile}">
        <circle cx="${tile / 2}" cy="${tile / 2}" r="${tile / 2 - 4}" 
          fill="none" stroke="${borderColor}" stroke-width="4"/>
      </svg>`
    );

    const withBorder = await sharp(imgBuffer)
      .composite([{ input: border }])
      .png()
      .toBuffer();

    composites.push({ input: withBorder, top: y, left: x });
  }

  const canvas = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 26, g: 26, b: 26, alpha: 1 },
    },
  })
    .composite(composites)
    .png()
    .toBuffer();

  return canvas;
}

// Main
async function main() {
  console.log('Generating example images...');

  // Generate per-collection card examples
  for (const col of COLLECTIONS) {
    console.log(`  → ${col.id} card...`);
    const card = await createTazoCard(col);
    fs.writeFileSync(path.join(outDir, `tazo-${col.id}-card.png`), card);

    console.log(`  → ${col.id} showcase...`);
    const showcase = await createShowcaseGrid(col);
    fs.writeFileSync(path.join(outDir, `tazo-${col.id}-showcase.png`), showcase);
  }

  // Generate back designs showcase
  console.log('  → back designs showcase...');
  const backShow = await createBackShowcase();
  fs.writeFileSync(path.join(outDir, 'tazo-backs-showcase.png'), backShow);

  console.log('Done! Files written to public/examples/');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
