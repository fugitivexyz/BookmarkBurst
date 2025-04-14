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