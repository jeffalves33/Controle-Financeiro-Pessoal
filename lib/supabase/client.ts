import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      goals: {
        Row: {
          id: string
          user_id: string
          year: number
          annual_income: number
          monthly_budget: number
          emergency_reserve: number
          planned_investments: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          year: number
          annual_income?: number
          monthly_budget?: number
          emergency_reserve?: number
          planned_investments?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          year?: number
          annual_income?: number
          monthly_budget?: number
          emergency_reserve?: number
          planned_investments?: number
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: "income" | "expense" | "savings" | "investment"
          amount: number
          description: string | null
          category: string | null
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: "income" | "expense" | "savings" | "investment"
          amount: number
          description?: string | null
          category?: string | null
          date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: "income" | "expense" | "savings" | "investment"
          amount?: number
          description?: string | null
          category?: string | null
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
