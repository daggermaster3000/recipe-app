import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Recipe = {
  id: string;
  title: string;
  description: string | null;
  ingredients: string[];
  steps: string[];
  step_items?: Array<{ text: string; image_url?: string | null }>; // optional rich steps
  tags?: string[];
  image_url: string | null;
  prep_time: number;
  cook_time: number;
  servings: number;
  user_id: string;
  author_id?: string | null;
  author_name?: string | null;
  created_at: string;
  updated_at: string;
};