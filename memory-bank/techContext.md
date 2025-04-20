# Bookmarko - Technical Context

## Tech Stack Overview

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS with Shadcn UI components
- **State Management**: React Query for server state, React Context for global application state
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: Wouter (lightweight alternative to React Router)

### Chrome Extension
- **Framework**: React with TypeScript
- **Build Tool**: Webpack
- **Styling**: TailwindCSS with custom Neo-brutalism components
- **State Management**: React hooks and Chrome storage API
- **Authentication**: Supabase Auth with token storage in Chrome
- **API**: Same Supabase endpoints as the main application
- **Manifest**: Updated to v1.1.0 (latest release)
- **Bug Fixes**: Fixed tag saving bug and improved tag suggestion logic in the extension popup

### Backend
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth
- **API**: Supabase automatically generated RESTful API
- **Serverless Functions**: Supabase Edge Functions for metadata extraction

## Development Environment

### Prerequisites
- Node.js v16 or higher
- npm or yarn
- Supabase CLI (for database migrations)
- Chrome browser for extension testing

### Local Setup
1. Client development uses Vite with port 5000
2. Supabase local development using Docker (optional)
3. Chrome extension development using Webpack with watch mode

## Key Dependencies

### Core
- `react`: v18.2.0+
- `@tanstack/react-query`: For data fetching and caching
- `@supabase/supabase-js`: For Supabase integration
- `wouter`: For routing
- `tailwindcss`: For styling

### UI Components
- `@radix-ui/react-*`: Primitive components used by Shadcn UI
- `lucide-react`: Icon library

### Form Handling
- `react-hook-form`: Form management
- `zod`: Schema validation
- `@hookform/resolvers`: Integration between RHF and Zod

### Chrome Extension Specific
- `webpack`: For bundling the extension
- `copy-webpack-plugin`: For copying static assets
- `html-webpack-plugin`: For generating HTML files
- `@types/chrome`: TypeScript definitions for Chrome APIs

## Database Schema

### Tables
- `profiles`: User profiles with username
  - `id`: UUID (references auth.users)
  - `username`: TEXT
  - `updated_at`: TIMESTAMP

- `bookmarks`: User bookmarks
  - `id`: SERIAL
  - `user_id`: UUID (references auth.users)
  - `url`: TEXT
  - `title`: TEXT
  - `description`: TEXT (nullable)
  - `favicon`: TEXT (nullable)
  - `created_at`: TIMESTAMP
  - `metadata`: JSONB (nullable)
- `tags`: Tag definitions (normalized, unique per user)
  - `id`: SERIAL
  - `user_id`: UUID (references auth.users)
  - `name`: TEXT (unique per user, lowercase)
- `bookmark_tags`: Join table for many-to-many relationship between bookmarks and tags
  - `bookmark_id`: INTEGER (references bookmarks.id)
  - `tag_id`: INTEGER (references tags.id)

### Tag Normalization
- The previous `tags TEXT[]` column in `bookmarks` is deprecated. All tag associations are now managed via the normalized `tags` and `bookmark_tags` tables, supporting efficient tag suggestions, queries, and management.

### Row-Level Security (RLS)
- Profiles: Users can only view their own profile
- Bookmarks: Users can only view, create, update, and delete their own bookmarks

## API Structure

### Authentication
- `supabase.auth.signUp`: Register a new user
- `supabase.auth.signInWithPassword`: Login existing user
- `supabase.auth.signOut`: Logout user

### Bookmarks
- `supabase.from('bookmarks').select()`: Get user bookmarks
- `supabase.from('bookmarks').insert()`: Create bookmark
- `supabase.from('bookmarks').update()`: Update bookmark
- `supabase.from('bookmarks').delete()`: Delete bookmark

### Metadata Extraction
- `supabase.functions.invoke('extract-metadata')`: Supabase Edge Function for metadata extraction
- Fallback to local extraction if Supabase Edge Function fails

## Chrome Extension Architecture

### Components
- **Popup**: Main extension UI that appears when clicking the extension icon
- **Background Script**: Handles events and maintains state between popup sessions
- **Content Script**: Extracts metadata from the current page when requested

### Storage
- **Chrome Storage Local**: Stores user session and authentication tokens
- **Supabase**: Stores all bookmark data in the same database as the main app

### Authentication Flow
1. User logs in via the popup UI
2. Authentication tokens are stored in Chrome's local storage
3. Tokens are refreshed as needed during extension usage

### Key Files
- `popup/popup.tsx`: Entry point for the extension popup UI
- `background.ts`: Background script for event handling
- `lib/auth.ts`: Authentication utilities for Supabase
- `lib/bookmarks.ts`: Bookmark management functions
- `components/BookmarksList.tsx`: UI for displaying and managing bookmarks
- `components/BookmarkForm.tsx`: Form for creating/editing bookmarks

## Deployment Architecture

### Production
- Frontend: Cloudflare Pages
- Extension: Chrome Web Store
- Functions: Supabase Edge Functions
- Database & Auth: Supabase Cloud

### Development
- Frontend: Local Vite dev server
- Extension: Local Chrome browser with developer mode
- Database & Auth: Supabase Project 

## Chrome Web Store Requirements

### Technical Requirements
- Manifest Version 3 compliance
- No remotely hosted code (all code must be included in the extension package)
- Content Security Policy following Chrome recommendations
- No execution of arbitrary strings
- Asset size optimization (recommended limit: 244 KiB per file)

### Store Listing Requirements
- Short description (up to 132 characters)
- Detailed description (up to 16,000 characters)
- Screenshots (1280x800 or 640x400 for landscape, 800x1280 or 400x640 for portrait)
- Store icon (128x128 PNG)
- Privacy policy document
- Permission justifications 

### Serverless Functions
- **Metadata Extraction**: Now uses Supabase Edge Functions for all environments (previously Cloudflare Functions) 