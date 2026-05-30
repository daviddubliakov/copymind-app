import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const MAX_RETRIES = 3;
const LIMIT = 3;

type AnalysisStatus = "queued" | "processing" | "completed" | "failed";
type DecisionLogRow = {
  id: string;
  situation_description: string;
  decision_made: string;
  expected_outcome: string;
  own_reasoning: string | null;
  analysis_attempts: number;
  analysis_status: AnalysisStatus;
};

const getSupabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) throw new Error("Missing Supabase env vars");
  return createClient(url, serviceRole);
}

async function analyzeDecisionWithLLM(row: DecisionLogRow) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
  const prompt = `
Analyze this decision and return ONLY valid JSON:
{
  "decision_category": "string",
  "cognitive_biases": ["string"],
  "missed_alternatives": ["string"],
  "summary": "string",
  "confidence": 0.0
}
Input:
- Situation: ${row.situation_description}
- Decision: ${row.decision_made}
- Expected outcome: ${row.expected_outcome}
- Reasoning: ${row.own_reasoning ?? ""}
`.trim();
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    }),
  });
  if (!resp.ok) throw new Error(`LLM HTTP ${resp.status}`);
  const json = await resp.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty LLM response");
  const parsed = JSON.parse(content);
  // Minimal runtime validation
  if (
    typeof parsed?.decision_category !== "string" ||
    !Array.isArray(parsed?.cognitive_biases) ||
    !Array.isArray(parsed?.missed_alternatives) ||
    typeof parsed?.summary !== "string"
  ) {
    throw new Error("Invalid LLM JSON schema");
  }
  return parsed;
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const isCron = !!process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`;

    if (!isCron) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { data: queued, error: queueErr } = await supabase
      .from("decision_logs")
      .select("id, situation_description, decision_made, expected_outcome, own_reasoning, analysis_attempts, analysis_status")
      .eq("analysis_status", "queued")
      .lt("analysis_attempts", MAX_RETRIES)
      .order("created_at", { ascending: true })
      .limit(LIMIT);

    if (queueErr) throw queueErr;

    let processed = 0;
    let completed = 0;
    let failed = 0;

    for (const row of (queued ?? []) as DecisionLogRow[]) {
      // Claim row (prevents double-processing by parallel workers)
      const { data: claimed, error: claimErr } = await supabase
        .from("decision_logs")
        .update({
          analysis_status: "processing",
          analysis_started_at: new Date().toISOString(),
          analysis_attempts: row.analysis_attempts + 1,
          analysis_error: null,
        })
        .eq("id", row.id)
        .eq("analysis_status", "queued")
        .select("id, situation_description, decision_made, expected_outcome, own_reasoning, analysis_attempts, analysis_status")
        .single();
      if (claimErr || !claimed) continue; // already claimed elsewhere
      processed += 1;
      try {
        const result = await analyzeDecisionWithLLM(claimed as DecisionLogRow);
        const { error: doneErr } = await supabase
          .from("decision_logs")
          .update({
            analysis_status: "completed",
            analysis_result: result,
            analysis_completed_at: new Date().toISOString(),
            analysis_error: null,
          })
          .eq("id", claimed.id);
        if (doneErr) throw doneErr;
        completed += 1;
      } catch (err) {
        const attempts = (claimed as DecisionLogRow).analysis_attempts;
        const shouldRetry = attempts < MAX_RETRIES;

        await supabase
          .from("decision_logs")
          .update({
            analysis_status: shouldRetry ? "queued" : "failed",
            analysis_error: err instanceof Error ? err.message : "Unknown error",
            analysis_completed_at: new Date().toISOString(),
          })
          .eq("id", claimed.id);
        failed += 1;
      }
    }

    return NextResponse.json({ processed, completed, failed });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}
