-- Corrective Migration for Tag Schema Drift

-- === Correct tags table ===

-- Add user_id column (nullable for now, add NOT NULL later if possible after backfill)
ALTER TABLE public.tags
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add unique constraint for user_id and name
-- Note: This will fail if duplicate (user_id, name) pairs exist or if user_id is NULL for multiple rows with the same name.
-- Consider cleaning data before applying if necessary.
ALTER TABLE public.tags
ADD CONSTRAINT user_tag_unique UNIQUE (user_id, name);

-- Add index on user_id
CREATE INDEX IF NOT EXISTS tags_user_id_idx ON public.tags(user_id);

-- Enable RLS (if not already enabled)
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Apply RLS Policies
DROP POLICY IF EXISTS "Users can view their own tags" ON public.tags;
CREATE POLICY "Users can view their own tags" ON public.tags
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own tags" ON public.tags;
CREATE POLICY "Users can insert their own tags" ON public.tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tags" ON public.tags;
CREATE POLICY "Users can update their own tags" ON public.tags
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own tags" ON public.tags;
CREATE POLICY "Users can delete their own tags" ON public.tags
  FOR DELETE USING (auth.uid() = user_id);


-- === Correct bookmark_tags table ===

-- Add user_id column (nullable for now)
ALTER TABLE public.bookmark_tags
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop the default primary key constraint (assuming name is bookmark_tags_pkey)
ALTER TABLE public.bookmark_tags
DROP CONSTRAINT IF EXISTS bookmark_tags_pkey;

-- Drop the redundant id column
ALTER TABLE public.bookmark_tags
DROP COLUMN IF EXISTS id;

-- Add the composite primary key
-- Note: This requires bookmark_id and tag_id to be NOT NULL implicitly.
-- Ensure they are NOT NULL if they aren't already. Based on schema info, they seem nullable.
ALTER TABLE public.bookmark_tags ALTER COLUMN bookmark_id SET NOT NULL;
ALTER TABLE public.bookmark_tags ALTER COLUMN tag_id SET NOT NULL;
ALTER TABLE public.bookmark_tags
ADD PRIMARY KEY (bookmark_id, tag_id);

-- Add indexes
CREATE INDEX IF NOT EXISTS bookmark_tags_user_id_idx ON public.bookmark_tags(user_id);
CREATE INDEX IF NOT EXISTS bookmark_tags_bookmark_id_idx ON public.bookmark_tags(bookmark_id);
CREATE INDEX IF NOT EXISTS bookmark_tags_tag_id_idx ON public.bookmark_tags(tag_id);

-- Ensure foreign keys have ON DELETE CASCADE (Add if missing/incorrect)
ALTER TABLE public.bookmark_tags DROP CONSTRAINT IF EXISTS bookmark_tags_bookmark_id_fkey;
ALTER TABLE public.bookmark_tags ADD CONSTRAINT bookmark_tags_bookmark_id_fkey
  FOREIGN KEY (bookmark_id) REFERENCES public.bookmarks(id) ON DELETE CASCADE;

ALTER TABLE public.bookmark_tags DROP CONSTRAINT IF EXISTS bookmark_tags_tag_id_fkey;
ALTER TABLE public.bookmark_tags ADD CONSTRAINT bookmark_tags_tag_id_fkey
  FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;

-- Enable RLS (if not already enabled)
ALTER TABLE public.bookmark_tags ENABLE ROW LEVEL SECURITY;

-- Apply RLS Policies
DROP POLICY IF EXISTS "Users can view their own bookmark_tags" ON public.bookmark_tags;
CREATE POLICY "Users can view their own bookmark_tags" ON public.bookmark_tags
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own bookmark_tags" ON public.bookmark_tags;
CREATE POLICY "Users can insert their own bookmark_tags" ON public.bookmark_tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own bookmark_tags" ON public.bookmark_tags;
CREATE POLICY "Users can delete their own bookmark_tags" ON public.bookmark_tags
  FOR DELETE USING (auth.uid() = user_id);

-- Consider adding NOT NULL constraints after potential backfill
-- ALTER TABLE public.tags ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE public.bookmark_tags ALTER COLUMN user_id SET NOT NULL;
