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
          id: number
          user_id: string
          url: string
          title: string
          description: string | null
          favicon: string | null
          created_at: string
          metadata: Json | null
          tags: string[] | null
        }
        Insert: {
          id?: number
          user_id: string
          url: string
          title: string
          description?: string | null
          favicon?: string | null
          created_at?: string
          metadata?: Json | null
          tags?: string[] | null
        }
        Update: {
          id?: number
          user_id?: string
          url?: string
          title?: string
          description?: string | null
          favicon?: string | null
          created_at?: string
          metadata?: Json | null
          tags?: string[] | null
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
          bookmark_id: number
          tag_id: number
        }
        Insert: {
          id?: number
          bookmark_id: number
          tag_id: number
        }
        Update: {
          id?: number
          bookmark_id?: number
          tag_id?: number
        }
      }
      profiles: {
        Row: {
          id: string
          username: string
          email: string
          updated_at: string | null
        }
        Insert: {
          id: string
          username: string
          email: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          username?: string
          email?: string
          updated_at?: string | null
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