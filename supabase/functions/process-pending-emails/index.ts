import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

/**
 * This function processes pending emails that are due to be sent
 * Should be called via cron job every minute (or manually)
 */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Missing configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get pending emails that are due to be sent
    const now = new Date().toISOString();
    const pendingEmailsResponse = await fetch(
      `${supabaseUrl}/rest/v1/pending_emails?select=*&send_at=lte.${now}&status=eq.pending&order=send_at.asc&limit=10`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseKey}`,
          "apikey": supabaseKey,
        },
      }
    );

    if (!pendingEmailsResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch pending emails" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const pendingEmails = await pendingEmailsResponse.json();
    let sentCount = 0;

    for (const email of pendingEmails) {
      try {
        // Send credentials email
        const sendResponse = await fetch(
          `${supabaseUrl}/functions/v1/send-credentials-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseKey}`,
              "apikey": supabaseKey,
            },
            body: JSON.stringify(email.email_data),
          }
        );

        if (sendResponse.ok) {
          // Mark as sent
          await fetch(
            `${supabaseUrl}/rest/v1/pending_emails?id=eq.${email.id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${supabaseKey}`,
                "apikey": supabaseKey,
              },
              body: JSON.stringify({ status: "sent", sent_at: new Date().toISOString() }),
            }
          );
          sentCount++;
        }
      } catch (emailError) {
        console.error(`Error sending email ${email.id}:`, emailError);
        // Mark as failed after 3 attempts
        await fetch(
          `${supabaseUrl}/rest/v1/pending_emails?id=eq.${email.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseKey}`,
              "apikey": supabaseKey,
            },
            body: JSON.stringify({ status: "failed" }),
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true, sent: sentCount, total: pendingEmails.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

