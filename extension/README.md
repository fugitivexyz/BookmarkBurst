# Bookmarko Chrome Extension

This Chrome extension allows you to save bookmarks directly to your Bookmarko account while browsing the web.

## Features

- One-click bookmarking of the current page
- Automatic metadata extraction
- Tag management
- Edit and delete functionality for existing bookmarks
- Secure authentication with your Bookmarko account
- Seamless integration with the Bookmarko web app
- Neo-brutalism design matching the main application's aesthetic

## Installation

### Development Mode

1. Clone the repository
2. Navigate to the extension directory
3. Install dependencies:

```bash
npm install
```

4. Configure your Supabase credentials:
   - Rename `lib/config.template.ts` to `lib/config.ts`
   - Update the values in `config.ts` with your Supabase URL and anon key
   - This file is gitignored to keep your credentials private

5. Build the extension:

```bash
npm run build
```

6. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `dist` directory

### Production Use

Once the extension is published to the Chrome Web Store, you can install it directly from there.

## Configuration

The extension uses a configuration file for sensitive values:

- `lib/config.ts` - Contains your Supabase URL and anonymous key (not tracked in git)
- `lib/config.template.ts` - A template for creating your config file (tracked in git)

You can find your Supabase credentials in your Supabase project dashboard:
1. Go to your project in the Supabase dashboard
2. Navigate to Project Settings > API
3. Copy the "Project URL" as SUPABASE_URL
4. Copy the "anon public" key as SUPABASE_ANON_KEY

## Usage

1. Click the Bookmarko extension icon in your browser toolbar
2. Log in with your Bookmarko account credentials or create a new account
3. The current page's details will be automatically extracted
4. Add any tags you want to include
5. Click "Save Bookmark" to add the page to your collection
6. View, edit, or delete your bookmarks directly from the extension

### Managing Bookmarks

- Click on a bookmark to open it in a new tab
- Use the edit button (pencil icon) to modify a bookmark's details
- Use the delete button (trash icon) to remove a bookmark
- All changes sync with your Bookmarko account

## Design

The extension features a Neo-brutalism design approach:
- Bold black borders with visible rectangular shapes
- Strategic use of shadows for depth
- Solid, bold colors with high contrast
- Playful hover and active states
- Responsive design optimized for the extension popup

## Development

The extension is built using:

- React
- TypeScript
- TailwindCSS
- Supabase for authentication and data storage
- Webpack for bundling

## Troubleshooting

- **Text overflow issues:** If you notice text overflowing in the extension popup, please report it as a bug
- **Authentication issues:** If you're having trouble logging in, try clearing your browser cache or reloading the extension
- **Bookmark not saving:** Check your internet connection and verify your Supabase credentials are correct

## License

This project is licensed under the MIT License - see the LICENSE file for details. 