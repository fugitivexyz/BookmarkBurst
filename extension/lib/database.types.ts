export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      bookmarks: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          url: string
          description: string | null
          favicon: string | null
          tags: string[] | null
          metadata: Json | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          url: string
          description?: string | null
          favicon?: string | null
          tags?: string[] | null
          metadata?: Json | null
          user_id?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          url?: string
          description?: string | null
          favicon?: string | null
          tags?: string[] | null
          metadata?: Json | null
          user_id?: string
        }
      }
      tags: {
        Row: {
          id: number
          name: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          created_at?: string
        }
      }
      bookmark_tags: {
        Row: {
          id: number
          bookmark_id: string
          tag_id: number
        }
        Insert: {
          id?: number
          bookmark_id: string
          tag_id: number
        }
        Update: {
          id?: number
          bookmark_id?: string
          tag_id?: number
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string | null
          avatar_url: string | null
          email: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          name?: string | null
          avatar_url?: string | null
          email?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string | null
          avatar_url?: string | null
          email?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_tags_with_counts: {
        Args: Record<string, never>
        Returns: {
          id: number
          name: string
          count: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
} 