# FIFA 2026 World Cup Bracket Simulator

A frontend-only application to simulate and visualize the FIFA 2026 World Cup tournament bracket.

## Features

- View all 12 groups with 48 teams
- Simulate individual matches or entire groups
- Track match results and group standings
- Visualize complete tournament bracket with knockout stages
- Special simulation rules:
  - Colombia has 60% win probability against top 12 teams, always wins against lower ranked teams
  - Mexico cannot advance past Quarter-Finals
  - Tournament winner: 30% Colombia, 70% distributed among top 10 FIFA teams

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: CSS with high-contrast color scheme
- **Storage**: Browser localStorage (client-side only)

## Setup

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## Deployment

**📖 For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)**

### Quick Start (Vercel - Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project" and import `lukaslondono77/fifaSimulation`
3. **Important**: Set "Root Directory" to `frontend`
4. Click "Deploy"
5. Your app will be live in ~2 minutes!

**Why Vercel?**
- Built by Next.js creators - perfect optimization
- Zero configuration needed
- Free tier: Unlimited personal projects
- Automatic deployments on every git push

### Other Options
- **Netlify**: Great alternative with similar setup
- **Cloudflare Pages**: Unlimited bandwidth on free tier
- See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed steps for all platforms

## Project Structure

```
fifa/
├── frontend/
│   ├── app/
│   │   ├── page.tsx         # Main page with tab navigation
│   │   ├── layout.tsx       # Root layout
│   │   ├── globals.css      # Global styles
│   │   ├── data.ts          # Tournament data (groups, teams, rankings)
│   │   ├── simulation.ts    # Match simulation logic
│   │   ├── bracket.ts       # Bracket generation and knockout simulation
│   │   └── components/      # React components
│   │       ├── GroupsView.tsx
│   │       ├── MatchesView.tsx
│   │       ├── StandingsView.tsx
│   │       └── BracketView.tsx
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Tournament Format

- **48 teams** in **12 groups** of 4 teams each
- Top 2 from each group + 8 best third-placed teams advance to Round of 32
- Knockout stages: Round of 32 → Round of 16 → Quarter Finals → Semi Finals → Third Place → Final

## How It Works

- All simulation logic runs in the browser (TypeScript)
- Match results are stored in browser localStorage
- No backend required - fully client-side application
- Team strengths based on FIFA rankings
- Probabilistic match simulation with special rules for Colombia and Mexico

## Notes

- Data persists in browser localStorage (cleared when browser data is cleared)
- Each user's simulation is independent
- No server or database required
