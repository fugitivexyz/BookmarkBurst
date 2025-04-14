-- Migration for tag normalization
-- Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create junction table
CREATE TABLE IF NOT EXISTS public.bookmark_tags (
  id SERIAL PRIMARY KEY,
  bookmark_id INTEGER REFERENCES public.bookmarks(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES public.tags(id) ON DELETE CASCADE,
  UNIQUE(bookmark_id, tag_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS bookmark_tags_bookmark_id_idx ON public.bookmark_tags(bookmark_id);
CREATE INDEX IF NOT EXISTS bookmark_tags_tag_id_idx ON public.bookmark_tags(tag_id);
CREATE INDEX IF NOT EXISTS tags_name_idx ON public.tags(name);

-- Enable RLS on new tables
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmark_tags ENABLE ROW LEVEL SECURITY;

-- Tags table policies
CREATE POLICY "Tags are viewable by everyone" ON public.tags
  FOR SELECT USING (true);

CREATE POLICY "Users can insert tags" ON public.tags
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Junction table policies (bookmark_tags)
CREATE POLICY "Users can view their own bookmark tags" ON public.bookmark_tags
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.bookmarks WHERE id = bookmark_id
    )
  );

CREATE POLICY "Users can create their own bookmark tags" ON public.bookmark_tags
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.bookmarks WHERE id = bookmark_id
    )
  );

CREATE POLICY "Users can delete their own bookmark tags" ON public.bookmark_tags
  FOR DELETE USING (
    auth.uid() IN (
      SELECT user_id FROM public.bookmarks WHERE id = bookmark_id
    )
  );

-- Create migration function
CREATE OR REPLACE FUNCTION migrate_tags() RETURNS void AS $$
DECLARE
  bookmark_record RECORD;
  tag_name TEXT;
  tag_record RECORD;
BEGIN
  -- Loop through all bookmarks
  FOR bookmark_record IN SELECT id, tags, user_id FROM public.bookmarks WHERE tags IS NOT NULL LOOP
    -- Loop through each tag in the array
    FOREACH tag_name IN ARRAY bookmark_record.tags LOOP
      -- Insert tag if it doesn't exist yet and get its ID
      INSERT INTO public.tags (name)
      VALUES (LOWER(TRIM(tag_name)))
      ON CONFLICT (name) DO NOTHING;
      
      -- Get the tag record
      SELECT id INTO tag_record FROM public.tags WHERE name = LOWER(TRIM(tag_name));
      
      -- Link tag to bookmark
      INSERT INTO public.bookmark_tags (bookmark_id, tag_id)
      VALUES (bookmark_record.id, tag_record.id)
      ON CONFLICT (bookmark_id, tag_id) DO NOTHING;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the migration
SELECT migrate_tags();

-- Create helper function
CREATE OR REPLACE FUNCTION get_bookmark_tags(bookmark_id INTEGER)
RETURNS TABLE (tag_name TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT t.name
  FROM public.tags t
  JOIN public.bookmark_tags bt ON t.id = bt.tag_id
  WHERE bt.bookmark_id = bookmark_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 