"use server";

import { createClient } from "@/lib/supabase/server";

export type DecisionLogFormState = {
  ok: boolean;
  error: string | null;
  message: string | null;
  decisionLogId: string | null;
  analysisStatus: "queued" | "processing" | "completed" | "failed" | null;
};

export async function createDecisionLog(
  _prevState: DecisionLogFormState,
  formData: FormData,
): Promise<DecisionLogFormState> {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { ok: false, error: "Unauthorized", message: null, decisionLogId: null, analysisStatus: null };
  }

  const situationDescription = String(formData.get("situationDescription") ?? "").trim();
  const decisionMade = String(formData.get("decisionMade") ?? "").trim();
  const expectedOutcome = String(formData.get("expectedOutcome") ?? "").trim();
  const ownReasoningRaw = String(formData.get("ownReasoning") ?? "").trim();

  if (!situationDescription || !decisionMade || !expectedOutcome) {
    return { ok: false, error: "Missing required fields", message: null, decisionLogId: null, analysisStatus: null };
  }

  const { data, error } = await supabase.from("decision_logs").insert({
    user_id: userData.user.id,
    situation_description: situationDescription,
    decision_made: decisionMade,
    expected_outcome: expectedOutcome,
    own_reasoning: ownReasoningRaw || null,
    analysis_status: "queued",
    analysis_attempts: 0,
  }).select("id, analysis_status").single();

  if (error || !data) {
    return {
      ok: false,
      error: error?.message ?? "Failed to create decision log",
      message: null,
      decisionLogId: null,
      analysisStatus: null,
    };
  }

  return {
    ok: true,
    error: null,
    message: "Decision log created and queued for analysis",
    decisionLogId: data.id,
    analysisStatus: data.analysis_status,
  };
}
