/**
 * Auto-generated Supabase types
 * Run: pnpm db:gen-types to regenerate
 *
 * This is a placeholder. After setting up Supabase and running migrations,
 * regenerate this file with actual types.
 */

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
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          stripe_customer_id: string | null;
          subscription_status: string | null;
          subscription_plan: string | null;
          subscription_current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          stripe_customer_id?: string | null;
          subscription_status?: string | null;
          subscription_plan?: string | null;
          subscription_current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          stripe_customer_id?: string | null;
          subscription_status?: string | null;
          subscription_plan?: string | null;
          subscription_current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      subscription_status: "active" | "canceled" | "past_due" | "trialing" | "inactive";
      subscription_plan: "free" | "monthly" | "yearly" | "lifetime";
    };
  };
}
