import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    // Try service role key first, fallback to anon key
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ 
          error: "Database not configured",
          details: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY environment variables"
        }), 
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    const client = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await client.from("realProducts").select("*");
    
    if (error) throw error;
    return new Response(
      JSON.stringify({ success: true, data: data || [] }), 
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ 
        error: err.message || "Internal server error",
        details: err.toString()
      }), 
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
