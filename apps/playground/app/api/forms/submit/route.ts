import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // server-only, never exposed to any LLM call
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(req: Request) {
  const { sessionId, values } = await req.json();

  if (!sessionId || !values) {
    return Response.json({ error: "Missing sessionId or values" }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    // No Supabase configured yet — skip the write so the chat/form flow
    // isn't blocked. Nothing is persisted in this mode.
    return Response.json({ status: "submitted_no_backend", sessionId });
  }

  // In production: validate sessionId against a `form_sessions` row,
  // encrypt `values` at the column level (pgcrypto/Vault) before insert.
  const { error } = await supabaseAdmin.from("form_submissions").insert({
    session_id: sessionId,
    values_encrypted: values, // placeholder — encrypt before insert in production
    submitted_at: new Date().toISOString(),
  });

  if (error) {
    return Response.json({ error: "Submission failed" }, { status: 500 });
  }

  // No raw values echoed back, and this route has no code path to any
  // LLM provider — that's the whole point.
  return Response.json({ status: "submitted", sessionId });
}
