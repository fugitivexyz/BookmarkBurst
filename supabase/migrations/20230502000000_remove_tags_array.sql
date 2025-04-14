-- Migration to remove the old tags array column
-- This migration should only be run after the tag normalization is complete and verified

-- Remove the old tags column
ALTER TABLE public.bookmarks DROP COLUMN tags; 