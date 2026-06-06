import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import path from 'path';
import fs from 'fs';

// Frontal background files per collection
const FRONTAL_BG_FILES: Record<string, string[]> = {
  minimon: ['minimon-01.png', 'minimon-02.png', 'minimon-03.png', 'minimon-04.png', 'minimon-05.png', 'minimon-06.png'],
  dracobell: ['dracobell-01.png', 'dracobell-02.png', 'dracobell-03.png', 'dracobell-04.png'],
  cybermon: ['cybermon-01.png', 'cybermon-02.png', 'cybermon-03.png'],
  special: ['special-01.png'],
};

// GET - List all tazo arts
export async function GET() {
  try {
    const tazoArts = await db.tazoArt.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: tazoArts });
  } catch (error) {
    console.error('Error fetching tazo arts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tazo arts' },
      { status: 500 }
    );
  }
}

// ────────────────────────────────────────────────────────────
// STRICT PROMPT BUILDERS — No backgrounds, no scenery, no text
// ────────────────────────────────────────────────────────────

/** Visual style per collection — character design aesthetic only, no environment */
const COLLECTION_STYLES: Record<string, string> = {
  minimon:
    '90s anime collectible creature style, expressive cute monster design, bold clean outlines, cel shading, toy-like proportions, readable silhouette, vibrant character colors',
  dracobell:
    'retro martial arts anime fighter style, dynamic combat pose, energy aura attached to the body, bold cel shading, expressive action silhouette, dramatic character lighting',
  cybermon:
    'retro digital monster anime style, cybernetic creature design, glowing circuit accents on the body, angular silhouette, metallic plates on the character, electric energy attached to the body',
};

/** Rarity visual effects — must be attached to the character, NEVER a background */
const RARITY_VISUAL: Record<string, string> = {
  common:
    'simple clean character design, minimal body details, straightforward pose',
  uncommon:
    'subtle glow effect attached to the character silhouette only, slight shimmer on the body',
  rare:
    'blue energy highlights attached to the body, crystalline accents on the character, dynamic pose',
  'ultra-rare':
    'purple aura around the character body, metallic highlights on the character, powerful stance, dramatic lighting on the figure',
  legendary:
    'golden aura attached to the character, crown-like light effect above the head, magnificent character presence, godlike radiance from the body',
};

/** Role visual cues — character pose and energy, no background */
const ROLE_VISUAL: Record<string, string> = {
  attacker: 'aggressive fighting stance, power focus, energy fists, forward-leaning pose',
  tank: 'massive defensive posture, shield stance, armored body, grounded wide stance',
  technical: 'analytical pose, holographic interface lines near the hands, precision focus',
  bouncer: 'acrobatic position, spring-like coiled energy, mid-air jumping pose',
  heavy: 'ground-shaking stance, massive frame, gravity ripple effect beneath the feet',
  light: 'swift nimble pose, speed lines trailing the body, ethereal floating stance',
  balanced: 'centered meditative stance, equilibrium pose, harmonious energy around the hands',
  special: 'mysterious enigmatic aura attached to the body, otherworldly character presence, unique form',
};

/** Mandatory transparency guard — appended to EVERY prompt */
const TRANSPARENCY_GUARD = `
Mandatory output requirements:
- Real transparent alpha background — absolutely no background visible.
- Character only — isolated figure with no environment.
- No scenery, no landscape, no room, no sky, no ground.
- No circular frame, no tazo border, no card edge.
- No text, no letters, no numbers, no watermark, no logo.
- No white background, no black background, no gradient background.
- No background pattern, no stars background, no galaxy background.
- No dirty cutout edges — clean character silhouette.
- Soft transparent contact shadow beneath the feet only — no ground plane.
`;

/** Negative prompt — what must NEVER appear in the output */
const NEGATIVE_PROMPT =
  'background, scenery, landscape, room, sky, stars background, galaxy background, gradient background, white background, black background, circular frame, coin frame, card border, text, letters, watermark, logo, UI, stats, number, nameplate, dirty cutout, square image background, environmental background, scene, platform, floor, ground, pedestal';

/** Build the final prompt with transparency guard always applied */
function buildFinalPrompt(
  name: string,
  description: string,
  collection: string,
  rarity: string,
  role: string,
  customPrompt?: string
): string {
  const baseStyle = COLLECTION_STYLES[collection] || COLLECTION_STYLES.minimon;
  const rarityStyle = RARITY_VISUAL[rarity] || RARITY_VISUAL.common;
  const roleStyle = ROLE_VISUAL[role] || ROLE_VISUAL.balanced;

  if (customPrompt && customPrompt.trim().length > 0) {
    // Even with custom prompts, always append the transparency guard
    return `${customPrompt.trim()}\n\n${TRANSPARENCY_GUARD}`;
  }

  return `Transparent PNG character illustration for a collectible tazo disc: ${name}, ${description}.
${baseStyle}. ${rarityStyle}. ${roleStyle}.
Full body character only, centered composition, real alpha transparent background.
Clean silhouette, bold 90s anime outlines, cel shading, soft transparent contact shadow.
Designed to be composited over a separate tazo frontal background.
${TRANSPARENCY_GUARD}`;
}

// ──────────────────────────────────────────────
// TRANSPARENCY VALIDATION
// ──────────────────────────────────────────────

interface TransparencyCheck {
  hasAlpha: boolean;
  cornersTransparent: boolean;
  warning?: string;
}

async function checkTransparency(buffer: Buffer): Promise<TransparencyCheck> {
  try {
    const sharp = (await import('sharp')).default;
    const metadata = await sharp(buffer).metadata();
    const hasAlpha = metadata.hasAlpha === true;

    if (!hasAlpha) {
      return { hasAlpha: false, cornersTransparent: false, warning: 'Image has no alpha channel — background is not transparent.' };
    }

    // Check the 4 corners for transparency
    const { data, info } = await sharp(buffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height, channels } = info;
    // Sample a 5x5 area in each corner
    const sampleSize = 5;
    const corners = [
      { x: 0, y: 0 },
      { x: width - sampleSize, y: 0 },
      { x: 0, y: height - sampleSize },
      { x: width - sampleSize, y: height - sampleSize },
    ];

    let allTransparent = true;
    for (const corner of corners) {
      for (let dy = 0; dy < sampleSize && allTransparent; dy++) {
        for (let dx = 0; dx < sampleSize && allTransparent; dx++) {
          const idx = ((corner.y + dy) * width + (corner.x + dx)) * channels;
          const alpha = data[idx + 3]; // Alpha is the 4th channel
          if (alpha > 10) {
            // More than 10/255 alpha — not transparent
            allTransparent = false;
          }
        }
      }
      if (!allTransparent) break;
    }

    return {
      hasAlpha: true,
      cornersTransparent: allTransparent,
      warning: allTransparent
        ? undefined
        : 'Generated image may not have a real transparent background. Corners are not transparent — the AI may have added a background.',
    };
  } catch {
    return { hasAlpha: false, cornersTransparent: false, warning: 'Could not verify transparency.' };
  }
}

// ──────────────────────────────────────────────
// POST — Generate and save a new tazo art
// ──────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      collection,
      rarity,
      role,
      description,
      customPrompt,
    } = body;

    // Validate required fields
    if (!name || !collection || !rarity || !role || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Build the strict transparency-safe prompt
    const prompt = buildFinalPrompt(name, description, collection, rarity, role, customPrompt);

    // Generate image using z-ai-web-dev-sdk
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();

    const response = await zai.images.generations.create({
      prompt: prompt,
      negative_prompt: NEGATIVE_PROMPT,
      size: '1024x1024',
    });

    const characterBase64 = response.data[0].base64;
    const characterBuffer = Buffer.from(characterBase64, 'base64');

    // Validate transparency
    const transparencyCheck = await checkTransparency(characterBuffer);

    // Select a random frontal background for this collection
    const bgFiles = FRONTAL_BG_FILES[collection] || FRONTAL_BG_FILES.minimon;
    const availableBgs =
      rarity === 'legendary' || rarity === 'ultra-rare'
        ? [...bgFiles, ...FRONTAL_BG_FILES.special]
        : bgFiles;
    const selectedBg = availableBgs[Math.floor(Math.random() * availableBgs.length)];

    // Composite character onto frontal background using sharp
    let compositedBase64: string;
    try {
      const sharp = (await import('sharp')).default;

      const bgPath = path.join(
        process.cwd(),
        'public',
        'tazo-assets',
        'frontal',
        collection,
        selectedBg
      );
      const actualBgPath = fs.existsSync(bgPath)
        ? bgPath
        : path.join(process.cwd(), 'public', 'tazo-assets', 'frontal', 'special', selectedBg);

      if (fs.existsSync(actualBgPath)) {
        const bgBuffer = fs.readFileSync(actualBgPath);
        const bgImage = sharp(bgBuffer);
        const bgMetadata = await bgImage.metadata();

        const bgSize = bgMetadata.width || 1254;
        const charSize = Math.round(bgSize * 0.65);
        const offset = Math.round((bgSize - charSize) / 2);

        const resizedCharacter = await sharp(characterBuffer)
          .resize(charSize, charSize, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .png()
          .toBuffer();

        const compositedBuffer = await bgImage
          .composite([
            {
              input: resizedCharacter,
              left: offset,
              top: offset,
            },
          ])
          .png()
          .toBuffer();

        compositedBase64 = compositedBuffer.toString('base64');
      } else {
        compositedBase64 = characterBase64;
      }
    } catch (compositeError) {
      console.error('Compositing error, using raw character:', compositeError);
      compositedBase64 = characterBase64;
    }

    // Generate balanced stats based on role
    const roleStats: Record<string, Record<string, number>> = {
      attacker: { attack: 80, defense: 35, resistance: 40, weight: 50, stability: 35, spin: 55, control: 45, bounce: 40, precision: 60 },
      tank: { attack: 35, defense: 85, resistance: 80, weight: 75, stability: 70, spin: 30, control: 40, bounce: 25, precision: 35 },
      technical: { attack: 50, defense: 45, resistance: 40, weight: 40, stability: 50, spin: 65, control: 80, bounce: 55, precision: 80 },
      bouncer: { attack: 45, defense: 40, resistance: 35, weight: 30, stability: 30, spin: 75, control: 55, bounce: 90, precision: 50 },
      heavy: { attack: 65, defense: 70, resistance: 75, weight: 95, stability: 80, spin: 20, control: 30, bounce: 15, precision: 25 },
      light: { attack: 45, defense: 30, resistance: 25, weight: 15, stability: 25, spin: 60, control: 70, bounce: 65, precision: 75 },
      balanced: { attack: 55, defense: 55, resistance: 55, weight: 55, stability: 55, spin: 55, control: 55, bounce: 55, precision: 55 },
      special: { attack: 70, defense: 55, resistance: 60, weight: 50, stability: 60, spin: 70, control: 65, bounce: 60, precision: 65 },
    };

    const baseStats = roleStats[role] || roleStats.balanced;

    const rarityMultiplier: Record<string, number> = {
      common: 0.8,
      uncommon: 0.9,
      rare: 1.0,
      'ultra-rare': 1.1,
      legendary: 1.25,
    };

    const multiplier = rarityMultiplier[rarity] || 1.0;

    const clamp = (v: number) => Math.max(10, Math.min(99, v));
    const finalStats = {
      attack: clamp(Math.round(baseStats.attack * multiplier + (Math.random() * 10 - 5))),
      defense: clamp(Math.round(baseStats.defense * multiplier + (Math.random() * 10 - 5))),
      resistance: clamp(Math.round(baseStats.resistance * multiplier + (Math.random() * 10 - 5))),
      weight: clamp(Math.round(baseStats.weight * multiplier + (Math.random() * 10 - 5))),
      stability: clamp(Math.round(baseStats.stability * multiplier + (Math.random() * 10 - 5))),
      spin: clamp(Math.round(baseStats.spin * multiplier + (Math.random() * 10 - 5))),
      control: clamp(Math.round(baseStats.control * multiplier + (Math.random() * 10 - 5))),
      bounce: clamp(Math.round(baseStats.bounce * multiplier + (Math.random() * 10 - 5))),
      precision: clamp(Math.round(baseStats.precision * multiplier + (Math.random() * 10 - 5))),
    };

    // Save to database
    const tazoArt = await db.tazoArt.create({
      data: {
        name,
        collection,
        rarity,
        role,
        description,
        prompt,
        imageData: compositedBase64,
        characterData: characterBase64,
        frontalBg: selectedBg,
        ...finalStats,
      },
    });

    return NextResponse.json({
      success: true,
      data: tazoArt,
      transparency: transparencyCheck.hasAlpha
        ? transparencyCheck.cornersTransparent
          ? 'ok'
          : 'warning'
        : 'error',
      transparencyDetails: transparencyCheck,
    });
  } catch (error) {
    console.error('Error generating tazo art:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          'Failed to generate tazo art: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}