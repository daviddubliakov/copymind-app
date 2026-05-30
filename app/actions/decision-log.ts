"use server";

import { createClient } from "@/lib/supabase/server";

export type DecisionLogFormState = {
  ok: boolean;
  error: string | null;
  message: string | null;
};

export async function createDecisionLog(
  _prevState: DecisionLogFormState,
  formData: FormData,
): Promise<DecisionLogFormState> {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { ok: false, error: "Unauthorized", message: null };
  }

  const situationDescription = String(formData.get("situationDescription") ?? "").trim();
  const decisionMade = String(formData.get("decisionMade") ?? "").trim();
  const expectedOutcome = String(formData.get("expectedOutcome") ?? "").trim();
  const ownReasoningRaw = String(formData.get("ownReasoning") ?? "").trim();

  if (!situationDescription || !decisionMade || !expectedOutcome) {
    return { ok: false, error: "Missing required fields", message: null };
  }

  const { error } = await supabase.from("decision_logs").insert({
    user_id: userData.user.id,
    situation_description: situationDescription,
    decision_made: decisionMade,
    expected_outcome: expectedOutcome,
    own_reasoning: ownReasoningRaw || null,
  });

  if (error) {
    return { ok: false, error: error.message, message: null };
  }

  return { ok: true, error: null, message: "Decision log created" };
}
