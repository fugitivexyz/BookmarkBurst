-- Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT user_tag_unique UNIQUE (user_id, name) -- Ensure unique tag names per user
);

-- Create bookmark_tags join table
CREATE TABLE IF NOT EXISTS public.bookmark_tags (
  bookmark_id INTEGER REFERENCES public.bookmarks(id) ON DELETE CASCADE NOT NULL,
  tag_id INTEGER REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- Denormalized for easier RLS/queries
  PRIMARY KEY (bookmark_id, tag_id) -- Composite primary key
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS tags_user_id_idx ON public.tags(user_id);
CREATE INDEX IF NOT EXISTS bookmark_tags_user_id_idx ON public.bookmark_tags(user_id);
CREATE INDEX IF NOT EXISTS bookmark_tags_bookmark_id_idx ON public.bookmark_tags(bookmark_id);
CREATE INDEX IF NOT EXISTS bookmark_tags_tag_id_idx ON public.bookmark_tags(tag_id);

-- Set up RLS policies for tags table
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tags" ON public.tags
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tags" ON public.tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags" ON public.tags
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags" ON public.tags
  FOR DELETE USING (auth.uid() = user_id);

-- Set up RLS policies for bookmark_tags table
ALTER TABLE public.bookmark_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookmark_tags" ON public.bookmark_tags
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmark_tags" ON public.bookmark_tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Note: Update policy might not be needed if links are just added/deleted.
-- If needed, add: CREATE POLICY "Users can update their own bookmark_tags" ON public.bookmark_tags FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmark_tags" ON public.bookmark_tags
  FOR DELETE USING (auth.uid() = user_id);
