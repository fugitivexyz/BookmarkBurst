# Bookmarko - Project Brief

## Project Overview
Bookmarko is a web-based bookmark management application that allows users to save, organize, and search through their web bookmarks. The application focuses on providing a clean, intuitive interface with robust features for organizing bookmarks through tags and metadata.

## Core Requirements

### Authentication & User Management
- User registration and login using Supabase Authentication
- Email verification flow
- Profile management with username customization

### Bookmark Management
- Add bookmarks with automatic metadata extraction (title, description, favicon)
- Edit and delete existing bookmarks
- Organize bookmarks with tags
- Search through bookmarks by title, URL, and tags

### Technical Requirements
- Modern React frontend with TypeScript
- Supabase for authentication and database
- Responsive design that works on mobile and desktop
- Metadata extraction using Supabase Edge Functions (previously Cloudflare Functions)
- Normalized tag schema: tags and bookmark_tags tables for efficient tag management
- Deployment on Cloudflare Pages

## Architecture

### Frontend
- React (v18+) with TypeScript
- TailwindCSS for styling with Shadcn UI components
- React Query for data fetching and state management
- React Hook Form with Zod for form handling and validation
- Wouter for lightweight routing

### Backend
- Supabase for authentication and PostgreSQL database
- Supabase Edge Functions for metadata extraction (standardized, previously Cloudflare Functions)
- Normalized tag schema: tags and bookmark_tags tables

### Deployment
- Cloudflare Pages for hosting the static assets
- Cloudflare Functions for serverless functionality
- Supabase for database and authentication services

## Project Status
The initial version of Bookmarko is feature-complete with the core bookmark management functionality implemented. The following enhancements are now in development:

- Chrome extension for one-click bookmarking (in progress, manifest v1.1.0 released)

Future enhancements may include:
- Bookmark collections/folders for further organization
- Sharing functionality for bookmark collections
- Import/export functionality with popular bookmark formats
- Analytics dashboard for bookmark usage insights 