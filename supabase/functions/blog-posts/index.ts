import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Candidate table names to try (camelCase vs snake_case variations)
const CANDIDATE_TABLES = ["blogPosts", "blog_posts", "blogposts", "blogs"];
const RESULT_LIMIT = 1000;

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
    const checkedTables: string[] = [];
    
    // Try each candidate table name until one succeeds
    for (const tableName of CANDIDATE_TABLES) {
      checkedTables.push(tableName);
      
      try {
        const { data, error } = await client
          .from(tableName)
          .select("*")
          .eq("published", true)
          .limit(RESULT_LIMIT);
        
        if (!error && data) {
          return new Response(
            JSON.stringify({ 
              success: true, 
              table: tableName,
              data: data || [],
              count: data.length
            }), 
            { headers: { "Content-Type": "application/json" }, status: 200 }
          );
        }
      } catch (tableErr) {
        // Continue to next table candidate
        continue;
      }
    }
    
    // None of the table names worked
    return new Response(
      JSON.stringify({ 
        error: "Blog posts table not found",
        checked_tables: checkedTables,
        suggestion: "Create a view or table named 'blogPosts' or 'blog_posts' with 'published' column. See scripts/create-blogview.sql"
      }), 
      { headers: { "Content-Type": "application/json" }, status: 404 }
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
