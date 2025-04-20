## 2024-06-09: Tag Normalization & Metadata Extraction Standardization
- Decided to migrate from a denormalized `tags TEXT[]` column in `bookmarks` to a normalized schema using `tags` and `bookmark_tags` tables for efficient tag management, suggestions, and queries.
- All tag associations are now managed via the join table, and all tag operations are handled through dedicated service logic.
- Standardized all metadata extraction to use Supabase Edge Functions (previously Cloudflare Functions) for consistency and maintainability across environments.
