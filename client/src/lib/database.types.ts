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
      profiles: {
        Row: {
          id: string
          username: string
          updated_at: string | null
        }
        Insert: {
          id: string
          username: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          username?: string
          updated_at?: string | null
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
  }
} 