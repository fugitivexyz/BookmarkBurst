import { Database } from './database.types';

export type Bookmark = Database['public']['Tables']['bookmarks']['Row'];
export type InsertBookmark = Omit<Database['public']['Tables']['bookmarks']['Insert'], 'user_id'>;
export type UpdateBookmark = Database['public']['Tables']['bookmarks']['Update'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

export interface Metadata {
  title?: string;
  description?: string;
  favicon?: string;
  [key: string]: any;
} 