# Titer

A marketplace/brokerage for AI-era digital assets — digital businesses, domains, AI agents, datasets, APIs, and compute. See `PRODUCT.md`, `ARCHITECTURE.md`, `DATABASE.md`, and `ROADMAP.md` for the full picture.

## Setup

Requires Node 20.19+ (see `.nvmrc`/`engines` in `package.json`).

```bash
npm install
cp .env.example .env.local   # fill in Supabase + DATABASE_URL/DIRECT_URL, see DATABASE.md
npx prisma migrate dev
npx prisma db seed           # populates demo listings
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Other commands

```bash
npm run lint
npx tsc --noEmit
npm run test:e2e
npx prisma studio             # browse the database
```
