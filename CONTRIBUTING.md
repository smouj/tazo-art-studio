# Contributing to Tazo Art Studio

First off, thank you for considering contributing to Tazo Art Studio! 🎴

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected behavior** vs. **Actual behavior**
- **Screenshots** if applicable
- **Environment details** (OS, Node.js version, browser)

### 💡 Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. Include:

- **Clear title** summarizing the suggestion
- **Use case** — why is this enhancement useful?
- **Detailed description** of the proposed behavior
- **Examples** or mockups if applicable

### 🔧 Pull Requests

1. **Fork** the repo and create your branch from `main`
2. **Make your changes** with clear, descriptive commits
3. **Test your changes** — run `npm run lint` and `npm run build`
4. **Update documentation** if you've changed behavior
5. **Submit a pull request** with a clear description

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/tazo-art-studio.git
cd tazo-art-studio

# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Initialize database
npx prisma db push

# Start dev server
npm run dev
```

## Code Style

- **TypeScript** throughout — strict mode enabled
- **ESLint** — run `npm run lint` before committing
- **shadcn/ui** components preferred over custom implementations
- **Tailwind CSS** — use utility classes, follow the magazine design system
- **Commits** — use descriptive messages, follow [Conventional Commits](https://www.conventionalcommits.org/) when possible

## Project Architecture

```
Frontend (React)  →  API Routes (Next.js)  →  Database (Prisma + SQLite)
                           ↓
                    AI Generation (z-ai-web-dev-sdk)
                           ↓
                    Image Compositing (Sharp)
```

- **Frontend:** Single-page app with Create/Gallery tabs
- **API:** RESTful endpoints at `/api/tazo-art`
- **Database:** SQLite via Prisma ORM
- **AI:** Server-side image generation and compositing

## Adding New Collections

To add a new tazo collection:

1. Add collection data to `COLLECTIONS` array in `src/app/page.tsx`
2. Add preset descriptions to `PRESET_DESCRIPTIONS`
3. Add frontal backgrounds to `public/tazo-assets/frontal/{collection}/`
4. Add back design to `public/tazo-assets/back/back-{collection}.png`
5. Update the prompt builder in `src/app/api/tazo-art/route.ts`
6. Update this README with the new collection info

## Questions?

Feel free to open an issue with the `question` label.

---

Thank you for contributing! 🎉
