# BookmarkBurst

BookmarkBurst is a web application for efficiently organizing, storing, and managing bookmarks across devices.

## Features

- User authentication with Supabase Auth
- CRUD operations for bookmark management
- Automatic metadata extraction from URLs (title, description, favicon)
- Tagging system for organizing bookmarks
- Clean and intuitive user interface built with React and Shadcn UI

## Tech Stack

- **Frontend**: React, TailwindCSS, Shadcn UI
- **Backend**: Supabase (Auth, Database), Cloudflare Functions
- **State Management**: React Query
- **Form Handling**: React Hook Form with Zod validation
- **Deployment**: Cloudflare Pages

## Setup

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Supabase account
- Cloudflare account (for deployment)

### Supabase Setup

1. Create a new Supabase project from the [Supabase Dashboard](https://app.supabase.com/)
2. Run the SQL migrations in the `supabase/migrations` directory in the Supabase SQL Editor
3. Enable Email/Password authentication in the Auth settings

### Local Development

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the client directory based on `.env.example` and add your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:

```bash
cd client
npm run dev
```

5. The application will be available at `http://localhost:5000`

### Cloudflare Pages Deployment

The project is set up to be deployed on Cloudflare Pages, which provides both hosting for the static site and Functions for the metadata extraction:

1. Install Wrangler CLI globally:

```bash
npm install -g wrangler
```

2. Log in to Cloudflare:

```bash
wrangler login
```

3. Deploy to Cloudflare Pages using GitHub integration:
   - Connect your GitHub repository to Cloudflare Pages
   - Configure the build settings:
     - Build command: `cd client && npm install && npm run build`
     - Build output directory: `client/dist`
   - Add environment variables for Supabase connection
   - Enable Function deployment in the settings

4. Alternatively, deploy from your local machine:

```bash
cd client
wrangler pages deploy dist
```

### Troubleshooting

If the metadata extraction function fails:

1. The application will automatically fall back to local metadata extraction
2. For production, ensure that the Cloudflare Function is properly deployed
3. The fallback extraction still provides basic functionality even if the Function is unavailable

## Development

### Project Structure

```
├── client/                  # React frontend application
│   ├── src/                 # Source code
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions and libraries
│   │   └── pages/           # Page components
│   ├── public/              # Static assets
│   └── wrangler.toml        # Cloudflare configuration
├── functions/               # Cloudflare Functions
│   └── extract-metadata/    # Metadata extraction function
├── supabase/                # Supabase configuration
│   ├── functions/           # Supabase Edge Functions (backup)
│   └── migrations/          # SQL migrations for database setup
└── README.md                # Project documentation
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 