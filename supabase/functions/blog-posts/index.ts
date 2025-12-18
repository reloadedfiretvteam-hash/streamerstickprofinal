import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: "Database not configured" }), 
        { headers: { "Content-Type": "application/json" }, status: 500 });
    }

    const client = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await client.from("blogPosts").select("*").eq("published", true);
    
    if (error) throw error;
    return new Response(JSON.stringify({ success: true, data: data || [] }), 
      { headers: { "Content-Type": "application/json" }, status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), 
      { headers: { "Content-Type": "application/json" }, status: 500 });
  }
});
