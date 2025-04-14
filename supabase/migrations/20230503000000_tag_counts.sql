-- Migration to add tag count function
-- This adds a stored procedure to count tags for display in filters

-- Function to get tags with their bookmark counts for the current user
CREATE OR REPLACE FUNCTION get_tags_with_counts()
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    COUNT(bt.bookmark_id)::BIGINT
  FROM tags t
  JOIN bookmark_tags bt ON t.id = bt.tag_id
  JOIN bookmarks b ON bt.bookmark_id = b.id
  WHERE b.user_id = auth.uid()
  GROUP BY t.id, t.name
  ORDER BY t.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 