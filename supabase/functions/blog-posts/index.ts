import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Candidate table names in priority order
const CANDIDATE_TABLES = ["blogPosts", "blog_posts", "blogposts", "blogs"];

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    // Try service role key first, fall back to anon key
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ 
        success: false,
        error: "Database not configured",
        message: "Missing SUPABASE_URL or authentication key"
      }), 
        { headers: { "Content-Type": "application/json" }, status: 500 });
    }

    const client = createClient(supabaseUrl, supabaseKey);
    
    // Try each candidate table in order
    let lastError = null;
    for (const tableName of CANDIDATE_TABLES) {
      try {
        const { data, error } = await client
          .from(tableName)
          .select("*")
          .eq("published", true)
          .limit(1000);
        
        if (!error && data) {
          return new Response(JSON.stringify({ 
            success: true, 
            data: data,
            table: tableName,
            count: data.length
          }), 
            { headers: { "Content-Type": "application/json" }, status: 200 });
        }
        
        lastError = error;
      } catch (err) {
        lastError = err;
        // Continue to next table
      }
    }
    
    // All attempts failed
    return new Response(JSON.stringify({ 
      success: false,
      error: "No blog table found",
      message: `Attempted tables: ${CANDIDATE_TABLES.join(", ")}`,
      lastError: lastError?.message || "Unknown error",
      data: []
    }), 
      { headers: { "Content-Type": "application/json" }, status: 200 });
      
  } catch (err: any) {
    return new Response(JSON.stringify({ 
      success: false,
      error: err.message || "Internal server error",
      data: []
    }), 
      { headers: { "Content-Type": "application/json" }, status: 500 });
  }
});
