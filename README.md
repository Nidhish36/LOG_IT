# LOG_IT

LOG_IT is a full-stack media tracking application for discovering and organizing movies, TV shows, and anime in one place. Users can build a personal library, record their progress and ratings, review viewing statistics, and export their data.

## Live Demo

**[Open LOG_IT](https://log-it-mu.vercel.app/)**

## Features

- Search for movies, television series, and anime
- Browse trending media
- Maintain watchlist, watching, and watched collections
- Record ratings, reviews, favorites, and episode progress
- View watch-time, genre, and rating statistics
- Export personal library data as JSON or CSV
- Email and password authentication
- Responsive light and dark interface

## Tech Stack

- **Framework:** Next.js 16 with the App Router
- **Language:** TypeScript
- **UI:** React 19 and Tailwind CSS
- **Animations:** GSAP
- **Database and authentication:** Supabase
- **Charts:** Recharts
- **Media data:** TMDB, OMDb, and AniList APIs
- **Deployment:** Vercel

## How It Works

LOG_IT combines results from multiple media providers into a shared `UnifiedMediaItem` model. Next.js route handlers perform external API requests without exposing private API keys to the browser. Supabase manages authentication and stores each user's media library, ratings, reviews, progress, and favorites.

The application uses server-rendered pages for library and statistics data, client components for interactive controls and animations, and server actions for authenticated database updates.

## Project Structure

```text
src/
├── actions/              # Authentication and media mutations
├── app/
│   ├── api/              # Auth, search, trending, and export routes
│   ├── auth/login/       # Login and registration page
│   ├── library/          # Personal media library
│   ├── stats/            # Viewing analytics
│   ├── layout.tsx        # Root application layout
│   └── page.tsx          # Dashboard
├── components/
│   ├── home/             # Trending and animated media reels
│   ├── layout/           # Navigation
│   ├── media/            # Media cards, ratings, and action modal
│   ├── search/           # Search interface
│   └── ui/               # Shared interface components
├── lib/
│   ├── supabase/         # Browser and server Supabase clients
│   ├── anilist.ts        # AniList integration
│   ├── omdb.ts           # OMDb integration
│   ├── tmdb.ts           # TMDB integration
│   └── trending.ts       # Aggregated trending content
└── types/                # Shared TypeScript models
```

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm
- A Supabase project
- TMDB and OMDb API credentials

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Nidhish36/LOG_IT.git
   cd LOG_IT
   ```

2. Install dependencies:

   ```bash
   npm ci
   ```

3. Create a local environment file:

   ```bash
   cp .env.example .env.local
   ```

4. Add the required credentials to `.env.local`:

   ```env
   TMDB_API_KEY=your_tmdb_api_key
   OMDB_API_KEY=your_omdb_api_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. Configure Supabase email/password authentication and the `media` and `user_media` tables used by the application. Apply row-level security policies so users can access only their own `user_media` records.

6. Start the development server:

   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run the configured lint checks |

## Data Sources

- [TMDB](https://www.themoviedb.org/) provides movie and television metadata.
- [OMDb API](https://www.omdbapi.com/) provides IMDb-linked movie and series search data.
- [AniList](https://anilist.co/) provides anime metadata through its GraphQL API.

This product uses third-party media metadata and is not affiliated with or endorsed by TMDB, OMDb, or AniList.

## Deployment

The project can be deployed to Vercel. Add the same environment variables from `.env.local` to the Vercel project settings before deploying.

## Future Improvements

- Add automated unit and integration tests
- Include database migrations for reproducible Supabase setup
- Improve recommendation and discovery features
- Add import support for existing watch-history data
- Strengthen API validation and error reporting

