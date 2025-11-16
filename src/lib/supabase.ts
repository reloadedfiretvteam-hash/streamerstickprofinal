import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  billing_period: string;
  features: string[];
  is_popular: boolean;
  display_order: number;
  active: boolean;
}

export interface EmailSubscriber {
  email: string;
  source: string;
  metadata?: Record<string, unknown>;
}

export interface CartAbandonment {
  email: string;
  plan_id: string;
  amount: number;
  metadata?: Record<string, unknown>;
}

export interface VisitorAnalytics {
  visitor_id: string;
  page_view: string;
  referrer?: string;
  device_type: string;
  country?: string;
  session_duration?: number;
}
