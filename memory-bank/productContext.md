# Bookmarko - Product Context

## Product Vision
Bookmarko aims to be a modern, intuitive bookmark management solution that helps users organize their web discoveries efficiently. It addresses the limitations of browser-based bookmarking by providing robust organization features, cross-platform accessibility, and rich metadata.

## User Personas

### Primary: Digital Professional
- **Name**: Alex
- **Age**: 25-45
- **Job**: Knowledge worker (developer, writer, researcher)
- **Goals**: Organize research materials, save technical resources, quickly find saved content
- **Pain Points**: Browser bookmarks become unmanageable, difficulty finding saved content, no good tagging system

### Secondary: Casual Internet Explorer
- **Name**: Jordan
- **Age**: 18-65
- **Job**: Various
- **Goals**: Save interesting articles, remember shopping sites, keep track of recipes/DIY projects
- **Pain Points**: Forgets where things are saved, can't search effectively, loses track of important links

## User Workflows

### Registration & Auth
1. User visits BookmarkBurst
2. Signs up with email and password
3. Verifies email via confirmation link
4. Creates username for profile
5. Accesses dashboard

### Adding Bookmarks
1. User pastes URL into the input field
2. System automatically extracts metadata (title, description, favicon)
3. User can edit metadata if needed
4. User adds tags for organization
5. User saves bookmark

### Finding Bookmarks
1. User visits dashboard
2. Uses search box to find bookmark by title/URL/tag
3. Alternatively, filters by tags
4. Clicks on bookmark to visit the saved URL

### Managing Bookmarks
1. User hovers over bookmark
2. Clicks edit to update metadata or tags
3. Clicks delete to remove bookmark
4. Changes take effect immediately

## UI/UX Philosophy

### Design Principles
1. **Simplicity**: Minimize cognitive load with clear, focused interfaces
2. **Efficiency**: Optimize for speed and minimal clicks
3. **Feedback**: Provide clear feedback for all user actions
4. **Consistency**: Maintain consistent patterns throughout the app

### Visual Language
- Clean, modern aesthetic with ample whitespace
- Neo-brutalist design elements for distinctive character
- High contrast for readability
- Accent colors to highlight interactive elements

## Features & Priorities

### Must-Have (MVP)
- User authentication
- Basic bookmark CRUD operations
- Metadata extraction
- Tagging system (now normalized: tags and bookmark_tags tables)
- Basic search functionality

### Should-Have (Next Iteration)
- Advanced search with filters
- Import/export bookmarks
- Sorting options
- Tag management (improved with normalized schema)
- Mobile-optimized interface

### Could-Have (Future)
- Bookmark collections/folders
- Sharing capabilities
- Browser extensions (Chrome extension manifest v1.1.0 released)
- Public/private bookmark options
- Analytics dashboard

## Success Metrics
- User registration and retention
- Number of bookmarks saved per user
- Search frequency and success rate
- Tag usage metrics
- Session duration and frequency 