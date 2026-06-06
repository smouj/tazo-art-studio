# 🎴 Tazo Art Studio

AI-powered Tazo Art Creator for Trading Tazos Game. Generate unique tazo art across Minimon, Dracobell & Cybermon collections with authentic 90s magazine aesthetic.

**Aim. Create. Collect.**

## Features

- **3 Collections**: Minimon (Pokemon-inspired), Dracobell (Dragon Ball), Cybermon (Digimon)
- **5 Rarity Tiers**: Common, Uncommon, Rare, Ultra-Rare, Legendary
- **8 Combat Roles**: Attacker, Tank, Technical, Bouncer, Heavy, Light, Balanced, Special
- **9 Combat Stats**: Attack, Defense, Resistance, Weight, Stability, Spin, Control, Bounce, Precision
- **AI Image Generation**: Powered by z-ai-web-dev-sdk
- **Real Tazo Backgrounds**: Authentic frontal backgrounds and back designs for each collection
- **Character Compositing**: AI-generated characters composited onto real tazo backgrounds using Sharp
- **Flip Animation**: See both front and back of each tazo with a flip animation
- **Gallery & Favorites**: Browse, filter, favorite, and download your collection
- **90s Magazine Aesthetic**: Complete design system based on Nintendo Power magazine style

## Collections & Assets

### Frontal Backgrounds
Each collection has unique circular tazo backgrounds:
- **Minimon**: 6 backgrounds (yellow/orange tones)
- **Dracobell**: 4 backgrounds (orange/red tones)
- **Cybermon**: 3 backgrounds (blue/cyan tones)
- **Special**: 1 cross-collection background (for legendary/ultra-rare)

### Back Designs
Each collection has its own back design:
- `back-minimon.png`
- `back-dracobell.png`
- `back-cybermon.png`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 + Magazine Design System |
| UI Components | shadcn/ui (Radix primitives) + Lucide React icons |
| Image Processing | Sharp (compositing AI art onto backgrounds) |
| AI Generation | z-ai-web-dev-sdk (image generation) |
| Database | Prisma ORM + SQLite |
| Runtime | Bun |

## Getting Started

### Prerequisites
- [Bun](https://bun.sh) 1.x (or Node.js 22+)

### Install & Run

```bash
git clone https://github.com/YOUR_USERNAME/tazo-art-studio.git
cd tazo-art-studio
bun install
cp .env.example .env
bunx prisma db push
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

```bash
DATABASE_URL="file:./dev.db"
```

## Project Structure

```
tazo-art-studio/
├── prisma/
│   └── schema.prisma          # TazoArt model + 9 combat stats
├── public/
│   └── tazo-assets/
│       ├── frontal/            # Frontal backgrounds per collection
│       │   ├── minimon/        # 6 PNG backgrounds
│       │   ├── dracobell/      # 4 PNG backgrounds
│       │   ├── cybermon/       # 3 PNG backgrounds
│       │   └── special/        # 1 cross-collection background
│       └── back/               # Back designs per collection
│           ├── back-minimon.png
│           ├── back-dracobell.png
│           └── back-cybermon.png
├── src/
│   ├── app/
│   │   ├── page.tsx            # Main app (Create + Gallery)
│   │   ├── layout.tsx          # Root layout
│   │   ├── globals.css         # Magazine design system
│   │   └── api/
│   │       └── tazo-art/
│   │           ├── route.ts    # GET (list) + POST (generate)
│   │           └── [id]/
│   │               └── route.ts # DELETE + PATCH
│   ├── components/ui/          # shadcn/ui components
│   ├── hooks/                  # Custom hooks
│   └── lib/
│       ├── db.ts               # Prisma client singleton
│       └── utils.ts            # Utilities
├── .env.example
├── package.json
└── tsconfig.json
```

## Design System

The app follows a **90s Nintendo Power / Pokemon Magazine** aesthetic:

- **12-token color palette** (`#FFCC00` yellow, `#E3350D` red, `#3B4CCA` blue, ...)
- **`font-black` + `uppercase`** for all headings, labels, buttons
- **Magazine shadows**: `shadow-[Xpx_Xpx_0px_#1a1a1a]` (no Tailwind shadows)
- **Special effects**: `legendary-glow`, `holo-border`, `metallic-effect`
- **CSS utilities**: `mag-bg`, `mag-card`, `mag-btn`, `mag-stroke`, `tazo-card-hover`

## How AI Generation Works

1. User fills in name, collection, rarity, role, and description
2. The API builds a detailed prompt based on collection style, rarity visuals, and role stance
3. `z-ai-web-dev-sdk` generates a 1024x1024 character illustration
4. `sharp` composites the character onto a randomly selected frontal background (1254x1254)
5. Both the composited image and raw character are stored in the database
6. The tazo appears in the gallery with full front/back view

## License

Source Available — see LICENSE for details.
