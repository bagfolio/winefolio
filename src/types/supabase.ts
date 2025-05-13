
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
      bottles: {
        Row: {
          id: number
          name: string
          varietal: string
          vintage: number | null
          winery: string | null
          region: string | null
          description: string | null
          image_url: string | null
          created_at: string | null
        }
        Insert: {
          id?: number
          name: string
          varietal: string
          vintage?: number | null
          winery?: string | null
          region?: string | null
          description?: string | null
          image_url?: string | null
          created_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          varietal?: string
          vintage?: number | null
          winery?: string | null
          region?: string | null
          description?: string | null
          image_url?: string | null
          created_at?: string | null
        }
      }
      tasting_sessions: {
        Row: {
          id: number
          name: string
          description: string | null
          created_by: string | null
          created_at: string | null
          is_active: boolean | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          created_by?: string | null
          created_at?: string | null
          is_active?: boolean | null
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          created_by?: string | null
          created_at?: string | null
          is_active?: boolean | null
        }
      }
      session_bottles: {
        Row: {
          id: number
          session_id: number
          bottle_id: number
          bottle_order: number
        }
        Insert: {
          id?: number
          session_id: number
          bottle_id: number
          bottle_order: number
        }
        Update: {
          id?: number
          session_id?: number
          bottle_id?: number
          bottle_order?: number
        }
      }
      questions: {
        Row: {
          id: number
          question_text: string
          description: string | null
          question_type: string
          options: Json | null
          created_at: string | null
        }
        Insert: {
          id?: number
          question_text: string
          description?: string | null
          question_type: string
          options?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: number
          question_text?: string
          description?: string | null
          question_type?: string
          options?: Json | null
          created_at?: string | null
        }
      }
      session_questions: {
        Row: {
          id: number
          session_id: number
          question_id: number
          question_order: number
          bottle_number: number | null
        }
        Insert: {
          id?: number
          session_id: number
          question_id: number
          question_order: number
          bottle_number?: number | null
        }
        Update: {
          id?: number
          session_id?: number
          question_id?: number
          question_order?: number
          bottle_number?: number | null
        }
      }
      media: {
        Row: {
          id: number
          title: string
          description: string | null
          media_type: string
          media_url: string
          sommelier_name: string | null
          created_at: string | null
        }
        Insert: {
          id?: number
          title: string
          description?: string | null
          media_type: string
          media_url: string
          sommelier_name?: string | null
          created_at?: string | null
        }
        Update: {
          id?: number
          title?: string
          description?: string | null
          media_type?: string
          media_url?: string
          sommelier_name?: string | null
          created_at?: string | null
        }
      }
      question_media: {
        Row: {
          id: number
          question_id: number
          media_id: number
        }
        Insert: {
          id?: number
          question_id: number
          media_id: number
        }
        Update: {
          id?: number
          question_id?: number
          media_id?: number
        }
      }
      user_responses: {
        Row: {
          id: number
          user_id: string
          session_id: number
          question_id: number
          bottle_id: number | null
          response_text: string | null
          numeric_rating: number | null
          selected_options: Json | null
          created_at: string | null
        }
        Insert: {
          id?: number
          user_id: string
          session_id: number
          question_id: number
          bottle_id?: number | null
          response_text?: string | null
          numeric_rating?: number | null
          selected_options?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string
          session_id?: number
          question_id?: number
          bottle_id?: number | null
          response_text?: string | null
          numeric_rating?: number | null
          selected_options?: Json | null
          created_at?: string | null
        }
      }
    }
  }
}
