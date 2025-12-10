import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Resilient Edge Function: attempts to read from multiple candidate table names
// Order: blogPosts, blog_posts, blogposts, blogs
// Uses SUPABASE_SERVICE_ROLE_KEY if present, else falls back to anon key
serve(async (req) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers, status: 204 });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "SUPABASE_URL not configured" 
        }), 
        { headers, status: 500 }
      );
    }

    // Prefer service role key, fallback to anon key
    const supabaseKey = serviceRoleKey || anonKey;
    if (!supabaseKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "No Supabase key available (SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY)" 
        }), 
        { headers, status: 500 }
      );
    }

    const client = createClient(supabaseUrl, supabaseKey);
    
    // Candidate table names to try in order
    const tableNames = ["blogPosts", "blog_posts", "blogposts", "blogs"];
    let data = null;
    let successTable = null;
    let lastError = null;

    // Try each table name until one succeeds
    for (const tableName of tableNames) {
      try {
        const { data: result, error } = await client
          .from(tableName)
          .select("*")
          .eq("published", true)
          .limit(1000);
        
        if (!error && result) {
          data = result;
          successTable = tableName;
          break;
        }
        
        lastError = error;
      } catch (err) {
        lastError = err;
        continue;
      }
    }

    // If we found data, return success
    if (data && successTable) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          data, 
          table: successTable,
          count: data.length,
          message: `Successfully retrieved ${data.length} published posts from table '${successTable}'`
        }), 
        { headers, status: 200 }
      );
    }

    // If no table worked, return helpful error
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Could not find blog posts in any candidate table",
        attemptedTables: tableNames,
        lastError: lastError?.message || "Unknown error",
        hint: "Please ensure one of these tables exists: " + tableNames.join(", ")
      }), 
      { headers, status: 404 }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: err.message || "Internal server error"
      }), 
      { headers, status: 500 }
    );
  }
});
