import { Database } from "./database.types";

// Export useful types from the Database type
export type Bookmark = Database['public']['Tables']['bookmarks']['Row'];
export type InsertBookmark = Omit<Database['public']['Tables']['bookmarks']['Insert'], 'user_id'>;
export type UpdateBookmark = Database['public']['Tables']['bookmarks']['Update'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type User = {
  id: string;
  username: string;
}; 