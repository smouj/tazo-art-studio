<div align="center">

# 🎴 Tazo Art Studio

**AI-Powered Tazo Art Creator for Trading Tazos Game**

_Create. Collect. Battle._

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-222?logo=github)](https://smouj.github.io/tazo-art-studio/)

</div>

---

## 📖 Overview

Tazo Art Studio is a web application for generating, collecting, and managing AI-created tazo art cards across three iconic collections inspired by 90s pop culture. Each tazo features an AI-generated character composited onto authentic tazo backgrounds with full front-and-back designs.

> 🔗 **Related Project:** [Trading Tazos Game](https://github.com/smouj/Trading-Tazos-Game) — The original game this studio creates art for.

---

## ✨ Features

### 🎨 AI-Powered Generation
- Describe your tazo character and let AI generate the art
- Automatic compositing of AI characters onto real tazo backgrounds using Sharp
- Custom prompt support for advanced users
- Random preset descriptions for quick inspiration

### 🗂️ Three Iconic Collections
| Collection | Inspiration | Backgrounds | Color |
|-----------|------------|-------------|-------|
| **Minimon** | Pokémon-style creatures | 6 frontal BGs | 🟡 Yellow/Orange |
| **Dracobell** | Dragon Ball warriors | 4 frontal BGs | 🟠 Orange/Red |
| **Cybermon** | Digimon digital monsters | 3 frontal BGs | 🔵 Blue/Cyan |

### ⭐ Five Rarity Tiers
| Rarity | Color | Visual Effect |
|--------|-------|---------------|
| Common | Gray | Standard |
| Uncommon | Green | Subtle shimmer |
| Rare | Blue | Holographic border |
| Ultra-Rare | Purple | Metallic glow |
| Legendary | Gold | Animated golden glow + particles |

### ⚔️ Eight Combat Roles
Attacker · Tank · Technical · Bouncer · Heavy · Light · Balanced · Special

Each role determines the distribution of **9 combat stats**: Attack, Defense, Resistance, Weight, Stability, Spin, Control, Bounce, Precision.

### 🖼️ Gallery & Collection Management
- Browse all created tazos with visual grid
- Filter by collection, rarity, or favorites
- Flip animation to see front and back of each tazo
- Download tazo images (front & back)
- Favorite/unfavorite your best designs
- Delete unwanted creations

### 📰 90s Magazine Aesthetic
- Complete design system inspired by Nintendo Power / Pokémon Magazine
- Magazine-style shadows, halftone patterns, and bold typography
- Collection-specific gradients and color schemes
- Animated effects for legendary and ultra-rare tazos

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) | Full-stack React framework |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Type-safe development |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) + Magazine Design System | 90s aesthetic UI |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) (Radix primitives) | Accessible, composable components |
| **Icons** | [Lucide React](https://lucide.dev/) | Consistent icon set |
| **Image Processing** | [Sharp](https://sharp.pixelplumbing.com/) | Character-to-background compositing |
| **AI Generation** | [z-ai-web-dev-sdk](https://www.npmjs.com/package/z-ai-web-dev-sdk) | AI image generation |
| **Database** | [Prisma ORM](https://www.prisma.io/) + SQLite | Persistent storage |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) | Smooth UI transitions |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 22+ or [Bun](https://bun.sh/) 1.x
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/smouj/tazo-art-studio.git
cd tazo-art-studio

# Install dependencies
npm install    # or: bun install

# Set up environment variables
cp .env.example .env

# Initialize the database
npx prisma db push    # or: bunx prisma db push

# Start the development server
npm run dev    # or: bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Description | Default |
|----------|------------|---------|
| `DATABASE_URL` | SQLite database connection string | `file:./dev.db` |

---

## 📁 Project Structure

```
tazo-art-studio/
├── prisma/
│   └── schema.prisma              # TazoArt model with 9 combat stats
├── public/
│   └── tazo-assets/
│       ├── frontal/                # Frontal backgrounds per collection
│       │   ├── minimon/            # 6 PNG backgrounds
│       │   ├── dracobell/          # 4 PNG backgrounds
│       │   ├── cybermon/           # 3 PNG backgrounds
│       │   └── special/            # Cross-collection background
│       └── back/                   # Back designs per collection
│           ├── back-minimon.png
│           ├── back-dracobell.png
│           └── back-cybermon.png
├── src/
│   ├── app/
│   │   ├── page.tsx                # Main application (Create + Gallery)
│   │   ├── layout.tsx              # Root layout with fonts & metadata
│   │   ├── globals.css             # Magazine design system + animations
│   │   └── api/
│   │       └── tazo-art/
│   │           ├── route.ts        # GET (list) + POST (create + generate)
│   │           └── [id]/
│   │               └── route.ts    # GET + PATCH (favorite) + DELETE
│   ├── components/ui/              # shadcn/ui components (Radix-based)
│   ├── hooks/                      # Custom React hooks
│   └── lib/
│       ├── db.ts                   # Prisma client singleton
│       └── utils.ts                # Utility functions
├── .env.example                    # Environment variable template
├── .gitignore
├── LICENSE                         # MIT License
├── package.json
└── tsconfig.json
```

---

## 🎮 How It Works

### AI Generation Flow

```
User Input → Prompt Builder → AI Image Generation → Character Compositing → Database Storage
```

1. **User fills in** the form: name, collection, rarity, role, and visual description
2. **API builds a detailed prompt** based on collection style, rarity visual effects, and role stance
3. **z-ai-web-dev-sdk** generates a 1024×1024 character illustration
4. **Sharp** composites the AI character onto a randomly selected frontal background (1254×1254)
5. **Both images** (composited + raw character) are stored in the database as Base64
6. **Tazo appears** in the gallery with full front/back flip view

### Stat Generation

Stats are generated based on:
- **Rarity tier** — Higher rarity = higher base stats (Common: 25-55, Legendary: 70-99)
- **Combat role** — Each role emphasizes different stats (e.g., Attacker boosts ATK, Tank boosts DEF)
- **Random variance** — ±15% from base to keep each tazo unique

---

## 🎨 Design System

The application follows a **90s Nintendo Power / Pokémon Magazine** aesthetic:

### Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| Magazine Yellow | `#FFCC00` | Primary actions, headings |
| Pokémon Red | `#E3350D` | Destructive actions, alerts |
| Pokémon Blue | `#3B4CCA` | Links, accents |
| Dragon Orange | `#FF6B00` | Dracobell collection |
| Cyber Blue | `#00A1E9` | Cybermon collection |
| Magazine Cream | `#FFFBE6` | Backgrounds |
| Magazine Black | `#1A1A1A` | Text, borders |

### Typography
- **Headings:** `font-black uppercase tracking-wider`
- **Labels:** `font-bold text-xs uppercase`
- **Body:** `font-bold text-sm`

### Special Effects
- `legendary-glow` — Animated golden glow for legendary tazos
- `holo-border` — Holographic shimmer for rare+ tazos
- `mag-stroke` — Text stroke for readability on images
- `tazo-card-hover` — Scale + shadow on hover

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Trading Tazos Game](https://github.com/smouj/Trading-Tazos-Game) — The original game project
- [z-ai-web-dev-sdk](https://www.npmjs.com/package/z-ai-web-dev-sdk) — AI image generation SDK
- [shadcn/ui](https://ui.shadcn.com/) — Beautiful, accessible UI components
- The 90s magazine culture that inspired the aesthetic

---

<div align="center">

**[⬆ Back to Top](#-tazo-art-studio)**

Made with ❤️ and 90s nostalgia

</div>
