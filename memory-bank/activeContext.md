# Bookmarko - Active Context

## Current Focus
- The shared folder structure has been removed from the project.
- We are reverting to a different approach for organizing the codebase for the Bookmarko website and Chrome extension.

## Recent Changes
- Deleted the `shared` folder and its contents (`components`, `utils`, `types`, `styles`).
- Migrated to a normalized tag schema: introduced `tags` and `bookmark_tags` tables, removed/deprecated `tags TEXT[]` in `bookmarks`.
- Updated tag management logic throughout the app and extension to use the normalized schema.
- Fixed tag saving bug and improved tag suggestion logic in the Chrome extension (manifest updated to v1.1.0).

## Next Steps
- **Monitor and optimize the new tag system in production.**
- Continue collecting user feedback on the Chrome extension and tag management experience.
- Plan next features (collections/folders, sharing, import/export, etc.).

## Current Focus
The current development focus is on post-launch activities for the Chrome extension after its approval and listing on the Chrome Web Store, with emphasis on:

1. **User Feedback Collection**: Gathering user reviews and feedback from Chrome Web Store users to identify areas for improvement.
2. **Performance Monitoring**: Tracking extension performance and user engagement metrics.
3. **Bug Fixes and Iterations**: Addressing any issues reported by users and iterating on features based on feedback.
4. **Marketing and Promotion**: Increasing visibility through marketing efforts and social media campaigns.
5. **Planning for Next Features**: Prioritizing and planning the next set of features based on user needs.

## Current Challenges

### Technical
- Ensuring CORS compatibility across all environments
- Gracefully handling transient network failures
- Optimizing metadata extraction for diverse URL formats
- Optimizing image loading performance
- Managing authentication tokens securely in the Chrome extension
- Maintaining consistent UI across extension and main app

### User Experience
- Balancing feature richness with interface simplicity
- Providing intuitive error recovery paths
- Maintaining performance with growing bookmark collections
- Ensuring smooth operation across all device types
- Creating a simple, efficient extension UI for quick bookmarking
- Ensuring text does not overflow in the extension popup

## Next Actions

### Immediate (Current Sprint)
1. **Set up Playwright testing infrastructure (install, configure, create basic test).**
2. Monitor performance metrics and error logs for the extension.
3. Address any immediate bugs or issues reported by users.
4. Develop a marketing plan to promote the extension.
5. Engage with early users to gather detailed feedback.

### Short-term (Next Sprint)
1. Implement user preferences system.
2. Enhance mobile responsiveness further.
3. Create collections/folders feature.
4. Add sharing capabilities.
5. Optimize extension performance and reduce bundle size.

## Chrome Extension Implementation Summary

### Structure
- Built with TypeScript, React, and TailwindCSS
- Organized with a modular component structure
- Created secure authentication and storage mechanism
- Implemented automatic metadata extraction
- Uses Neo-brutalism design principles for UI

### Key Features
- One-click bookmark saving
- Automatic metadata extraction
- Tag management interface
- Secure authentication with Supabase
- Recent bookmarks viewing
- Duplicate bookmark detection
- Edit and delete functionality for bookmarks
- Responsive design within the extension popup

### Integration Points
- Shares authentication system with the main app via Supabase
- Uses the same database schema and API endpoints
- Reuses metadata extraction logic

## Design Decisions

### Neo-brutalism Design Implementation
Decision to implement Neo-brutalism design across the application:
1. Bold black borders (2px) with visible rectangular shapes
2. Strategic use of shadows (3-4px offset) for depth
3. Solid, bold colors with high contrast
4. Sharp corners rather than rounded elements
5. Playful, exaggerated hover and active states

### Metadata Extraction Approach
Decision to implement a two-tier fallback mechanism:
1. Use Supabase Edge Function as primary method
2. Use local client-side extraction as fallback

This ensures users can always add bookmarks, even if serverless functions are unavailable.

### Authentication Flow
Decision to handle email verification gracefully:
- Show clear status messages during verification process
- Implement automatic creation of user profiles if they don't exist
- Handle edge cases like missing profiles with automatic recovery

### UI Architecture
Decision to use Shadcn UI with custom styling:
- Provides accessible, well-tested component primitives
- Allows for consistent styling across the application
- Enables future theming capabilities
- Maintains flexibility for custom component development

## Current Questions

1. Should we implement a right-click context menu for the extension?
2. How can we optimize token refresh to reduce authentication issues?
3. What's the best approach for importing bookmarks from browsers?
4. How should we handle rate limiting for the metadata extraction function?
5. What metrics should we track to measure user engagement with the extension?
6. How can we further optimize the extension's bundle size?
7. Should we implement offline functionality for the extension?

## Platform-Specific Feature Strategies

To ensure a harmonized experience between the Bookmarko website and Chrome extension while addressing platform-specific needs, the following feature strategies are defined:

### Shared Features (Consistent Across Platforms)
- **Authentication**: Both platforms use Supabase for user authentication, ensuring seamless user identity and data access.
- **Bookmark Management**: Core actions like creating, editing, and deleting bookmarks are supported on both, leveraging the same backend for data consistency.
- **Design Language**: Neo-brutalism design principles (bold borders, high contrast, sharp corners) are applied to maintain a unified visual identity.
- **Tagging**: Basic tagging functionality is available on both, though the interface may differ based on space constraints.

### Adapted Features (Tailored to Platform Context)
- **Bookmark Creation**: On the website, this includes detailed forms with extensive metadata visualization; in the extension, it's streamlined for one-click saving with automatic metadata extraction from the current tab.
- **User Interface**: The website offers a comprehensive, full-page layout with advanced navigation; the extension uses a compact popup (550x350 pixels) with a focus on quick tasks, toggling between form and list views.
- **Feedback Mechanisms**: The website uses toast notifications for user feedback; the extension may rely on simpler visual cues due to space limitations.

### Website-Specific Features (Unique to Full Interface)
- **Advanced Search and Filtering**: In progress, these features are suited to the website's larger interface for detailed bookmark discovery.
- **Analytics Dashboard**: Planned for future implementation, providing insights into bookmark usage and trends.
- **Collaborative Collections**: A future feature for sharing and managing bookmarks with others, more feasible on the website.

### Extension-Specific Features (Unique to Browser Integration)
- **One-Click Bookmarking**: Focused on quick saving of the current tab, a core feature of the extension.
- **Right-Click Context Menu**: Under consideration, to enhance quick access within the browser environment.
- **Keyboard Shortcuts**: In progress, for efficient actions within the popup.
- **Offline Support**: Planned, to allow bookmarking without an active connection, leveraging browser storage.

### Harmonization Goals
- **Backend Reuse**: Continue leveraging shared Supabase backend and API endpoints to minimize duplicate logic.
- **UI Consistency**: Align core interaction patterns (e.g., button styles, error messaging) despite platform differences.
- **Feature Prioritization**: Use user feedback from the Chrome Web Store to guide which features to adapt or develop for each platform, ensuring user needs drive divergence. 