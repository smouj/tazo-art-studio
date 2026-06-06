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

// POST - Generate and save a new tazo art
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

    // Build the AI image generation prompt
    const collectionStyles: Record<string, string> = {
      minimon: 'Pokemon-style creature, cute monster, vibrant anime style, yellow and orange tones, cartoon creature design',
      dracobell: 'Dragon Ball Z style warrior, powerful martial artist, spiky hair, orange and red energy aura, anime fighter',
      cybermon: 'Digimon-style digital monster, cybernetic creature, blue and cyan digital patterns, techno-organic being',
    };

    const rarityVisual: Record<string, string> = {
      common: 'simple clean design, minimal effects',
      uncommon: 'subtle glow effect, slight shimmer',
      rare: 'blue energy aura, crystalline highlights, dynamic pose',
      'ultra-rare': 'purple cosmic energy, starfield background, powerful stance, dramatic lighting',
      legendary: 'golden divine glow, crown of light, legendary aura, celestial background, magnificent, godlike presence, holy radiance',
    };

    const roleVisual: Record<string, string> = {
      attacker: 'aggressive fighting stance, power focus, energy fists',
      tank: 'massive defensive posture, shield stance, armored body',
      technical: 'analytical pose, holographic interface elements, precision',
      bouncer: 'acrobatic position, spring-like coiled energy, bouncing',
      heavy: 'ground-shaking stance, massive frame, gravity effect',
      light: 'swift nimble pose, speed lines, ethereal',
      balanced: 'centered meditative stance, equilibrium, harmony',
      special: 'mysterious enigmatic aura, otherworldly, unique form',
    };

    const baseStyle = collectionStyles[collection] || collectionStyles.minimon;
    const rarityStyle = rarityVisual[rarity] || rarityVisual.common;
    const roleStyle = roleVisual[role] || roleVisual.balanced;

    const prompt = customPrompt
      ? customPrompt
      : `Character illustration for collectible tazo disc: ${name}, ${description}. ${baseStyle}. ${rarityStyle}. ${roleStyle}. Character centered on transparent background, full body character art, bold outlines, high contrast, detailed anime illustration style, official collectible card art, high quality, detailed, character design`;

    // Generate image using z-ai-web-dev-sdk
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();

    const response = await zai.images.generations.create({
      prompt: prompt,
      size: '1024x1024',
    });

    const characterBase64 = response.data[0].base64;

    // Select a random frontal background for this collection
    const bgFiles = FRONTAL_BG_FILES[collection] || FRONTAL_BG_FILES.minimon;
    // For legendary/ultra-rare, allow special backgrounds too
    const availableBgs = (rarity === 'legendary' || rarity === 'ultra-rare')
      ? [...bgFiles, ...FRONTAL_BG_FILES.special]
      : bgFiles;
    const selectedBg = availableBgs[Math.floor(Math.random() * availableBgs.length)];

    // Composite character onto frontal background using sharp
    let compositedBase64: string;
    try {
      const sharp = (await import('sharp')).default;

      // Load the frontal background
      const bgPath = path.join(process.cwd(), 'public', 'tazo-assets', 'frontal', collection, selectedBg);
      // Fallback to special if the collection-specific one doesn't exist
      const actualBgPath = fs.existsSync(bgPath)
        ? bgPath
        : path.join(process.cwd(), 'public', 'tazo-assets', 'frontal', 'special', selectedBg);

      if (fs.existsSync(actualBgPath)) {
        const bgBuffer = fs.readFileSync(actualBgPath);
        const bgImage = sharp(bgBuffer);
        const bgMetadata = await bgImage.metadata();

        // Resize character to fit inside the background (about 65% of bg size, centered)
        const bgSize = bgMetadata.width || 1254;
        const charSize = Math.round(bgSize * 0.65);
        const offset = Math.round((bgSize - charSize) / 2);

        const characterBuffer = Buffer.from(characterBase64, 'base64');
        const resizedCharacter = await sharp(characterBuffer)
          .resize(charSize, charSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer();

        // Composite: character on top of background
        const compositedBuffer = await bgImage
          .composite([{
            input: resizedCharacter,
            left: offset,
            top: offset,
          }])
          .png()
          .toBuffer();

        compositedBase64 = compositedBuffer.toString('base64');
      } else {
        // No background found, use character as-is
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

    // Apply rarity modifier
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

    return NextResponse.json({ success: true, data: tazoArt });
  } catch (error) {
    console.error('Error generating tazo art:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate tazo art: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
