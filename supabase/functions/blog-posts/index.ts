import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Candidate table names to try, in order of preference
const TABLE_CANDIDATES = ["blogPosts", "blog_posts", "blogposts", "blogs"];

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    // Try service role key first, fall back to anon key
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ 
        success: false,
        error: "Database not configured",
        details: "SUPABASE_URL or auth key missing"
      }), { 
        headers: { "Content-Type": "application/json" }, 
        status: 500 
      });
    }

    const client = createClient(supabaseUrl, supabaseKey);
    
    // Try each table candidate until we find one that works
    let lastError = null;
    for (const tableName of TABLE_CANDIDATES) {
      try {
        const { data, error } = await client
          .from(tableName)
          .select("*")
          .eq("published", true)
          .limit(1000);
        
        if (!error && data) {
          return new Response(JSON.stringify({ 
            success: true,
            table: tableName,
            count: data.length,
            data: data
          }), { 
            headers: { "Content-Type": "application/json" }, 
            status: 200 
          });
        }
        
        lastError = error;
      } catch (err: any) {
        lastError = err;
        // Continue to next candidate
      }
    }
    
    // None of the tables worked
    return new Response(JSON.stringify({ 
      success: false,
      error: "No blog table found",
      details: `Tried tables: ${TABLE_CANDIDATES.join(", ")}`,
      lastError: lastError?.message || "Unknown error"
    }), { 
      headers: { "Content-Type": "application/json" }, 
      status: 404 
    });
    
  } catch (err: any) {
    return new Response(JSON.stringify({ 
      success: false,
      error: "Unexpected error",
      details: err.message 
    }), { 
      headers: { "Content-Type": "application/json" }, 
      status: 500 
    });
  }
});
