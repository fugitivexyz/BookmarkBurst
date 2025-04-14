# Bookmarko

Bookmarko is a web application for efficiently organizing, storing, and managing bookmarks across devices.

## Features

- User authentication with Supabase Auth
- CRUD operations for bookmark management
- Automatic metadata extraction from URLs (title, description, favicon)
- Advanced tagging system with suggestions and quick filtering
- Clean and intuitive user interface built with React and Shadcn UI
- Chrome extension for one-click bookmarking from any website

## Tech Stack

- **Frontend**: React, TailwindCSS, Shadcn UI
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **State Management**: React Query
- **Form Handling**: React Hook Form with Zod validation
- **Deployment**: Cloudflare Pages
- **Extension**: Chrome Extension with React, TypeScript, and Webpack

## Setup

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Supabase account
- Cloudflare account (for deployment)
- Chrome browser (for extension development)

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

### Chrome Extension Development

1. Navigate to the extension directory:

```bash
cd extension
```

2. Install dependencies:

```bash
npm install
```

3. Configure your Supabase credentials:
   - Rename `lib/config.template.ts` to `lib/config.ts`
   - Update the values in `config.ts` with your Supabase URL and anon key

4. Build the extension:

```bash
npm run build
```

5. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `dist` directory in the extension folder

### Cloudflare Pages Deployment

The project is set up to be deployed on Cloudflare Pages, which provides hosting for the static site:

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
2. For production, ensure that the Supabase Edge Function is properly deployed
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
│   └── wrangler.toml        # Cloudflare Pages configuration
├── functions/               # Cloudflare Functions
│   └── extract-metadata/    # Metadata extraction function
├── extension/               # Chrome extension
│   ├── components/          # React components for the extension
│   ├── lib/                 # Extension utilities and API functions
│   ├── popup/               # Extension popup UI
│   ├── content/             # Content scripts
│   └── background.ts        # Background script
├── supabase/                # Supabase configuration
│   ├── functions/           # Supabase Edge Functions
│   │   └── extract-metadata/# Metadata extraction function
│   └── migrations/          # SQL migrations for database setup
└── README.md                # Project documentation
```

## Chrome Extension Features

- One-click bookmarking from any web page
- Automatic metadata extraction (title, URL, favicon, description)
- Tag management directly from the extension
- Edit and delete functionality for existing bookmarks
- Neo-brutalism design matching the main application's aesthetic
- Responsive design optimized for extension popup

## Recent Updates

### Enhanced Tag System

- Normalized database schema for efficient tag storage and retrieval
- Tag suggestions based on recently used tags
- Consistent tag handling between web app and browser extension
- Quick filtering by multiple tags
- Improved tag creation UX with autocomplete

## License

This project is licensed under the MIT License - see the LICENSE file for details. 