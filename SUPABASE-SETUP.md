# Supabase Setup Guide for BookmarkBurst

This guide will help you set up your Supabase project for the BookmarkBurst application.

## Step 1: Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com) and log in
2. Click "New Project"
3. Select your organization (or create one)
4. Enter "BookmarkBurst" as the project name
5. Set up a database password (save it securely)
6. Choose the region closest to your users
7. Wait for your project to be created

## Step 2: Set Up Database Schema

1. In your Supabase dashboard, go to the "SQL Editor" section
2. Click "New Query"
3. Copy and paste the following SQL:

```sql
-- Enable RLS on all tables
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  favicon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  metadata JSONB,
  tags TEXT[]
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS bookmarks_user_id_idx ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS bookmarks_created_at_idx ON public.bookmarks(created_at);

-- Set up RLS policies
-- Profiles table policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Bookmarks table policies
CREATE POLICY "Users can view their own bookmarks" ON public.bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks" ON public.bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks" ON public.bookmarks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON public.bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS on tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
```

4. Click "Run" to execute the SQL

## Step 3: Configure Authentication

1. Go to "Authentication" in the Supabase dashboard
2. Under "Providers", ensure "Email" is enabled
3. Under "URL Configuration", add your application URL (e.g., `http://localhost:5000` for development)

## Step 4: Get API Credentials

1. Go to "Project Settings" > "API"
2. Copy the Project URL (e.g., `https://abcdefghijk.supabase.co`)
3. Copy the `anon` public API key

## Step 5: Configure Environment Variables

1. Create a `.env` file in your project root (if not already created)
2. Add the following variables:

```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

3. Replace `your_project_url` and `your_anon_key` with the values copied in Step 4

## Step 6: Start the Application

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`

Your BookmarkBurst application should now be connected to your Supabase backend! 