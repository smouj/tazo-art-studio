import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
      stats,
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
      : `Circular tazo disc art: ${name}, ${description}. ${baseStyle}. ${rarityStyle}. ${roleStyle}. Vintage 90s collectible tazo design, circular composition, bold outlines, high contrast, detailed illustration on white background, official tazo card art style, high quality, detailed, centered composition fitting a circular frame`;

    // Generate image using z-ai-web-dev-sdk
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();

    const response = await zai.images.generations.create({
      prompt: prompt,
      size: '1024x1024',
    });

    const imageBase64 = response.data[0].base64;

    // Generate balanced stats based on role
    const generateStat = (base: number, variance: number) =>
      Math.max(10, Math.min(99, base + Math.floor(Math.random() * variance * 2) - variance));

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

    const finalStats = {
      attack: Math.min(99, Math.round(baseStats.attack * multiplier + (Math.random() * 10 - 5))),
      defense: Math.min(99, Math.round(baseStats.defense * multiplier + (Math.random() * 10 - 5))),
      resistance: Math.min(99, Math.round(baseStats.resistance * multiplier + (Math.random() * 10 - 5))),
      weight: Math.min(99, Math.round(baseStats.weight * multiplier + (Math.random() * 10 - 5))),
      stability: Math.min(99, Math.round(baseStats.stability * multiplier + (Math.random() * 10 - 5))),
      spin: Math.min(99, Math.round(baseStats.spin * multiplier + (Math.random() * 10 - 5))),
      control: Math.min(99, Math.round(baseStats.control * multiplier + (Math.random() * 10 - 5))),
      bounce: Math.min(99, Math.round(baseStats.bounce * multiplier + (Math.random() * 10 - 5))),
      precision: Math.min(99, Math.round(baseStats.precision * multiplier + (Math.random() * 10 - 5))),
    };

    // Override with provided stats if any
    const mergedStats = stats ? { ...finalStats, ...stats } : finalStats;

    // Save to database
    const tazoArt = await db.tazoArt.create({
      data: {
        name,
        collection,
        rarity,
        role,
        description,
        prompt,
        imageData: imageBase64,
        ...mergedStats,
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
