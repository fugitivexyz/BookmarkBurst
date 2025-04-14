export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T] 