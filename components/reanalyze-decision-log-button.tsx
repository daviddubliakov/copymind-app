"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import {
  reanalyzeDecisionLog,
  type ReanalyzeDecisionLogFormState,
} from "@/app/actions/decision-log";
import { Button } from "@/components/ui/button";

type AnalysisStatus = "queued" | "processing" | "completed" | "failed";

type ReanalyzeDecisionLogButtonProps = {
  decisionLogId: string;
  analysisStatus: AnalysisStatus;
};

const initialState: ReanalyzeDecisionLogFormState = {
  ok: false,
  error: null,
  message: null,
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="outline" size="sm" disabled={disabled || pending}>
      {pending ? "Recreating..." : "Recreate analysis"}
    </Button>
  );
}

export function ReanalyzeDecisionLogButton({
  decisionLogId,
  analysisStatus,
}: ReanalyzeDecisionLogButtonProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(reanalyzeDecisionLog, initialState);
  const isReanalyzing = analysisStatus === "queued" || analysisStatus === "processing";

  useEffect(() => {
    if (state.ok) {
      router.refresh();
    }
  }, [router, state.ok]);

  return (
    <div className="space-y-2">
      <form action={formAction}>
        <input type="hidden" name="decisionLogId" value={decisionLogId} />
        <SubmitButton disabled={isReanalyzing} />
      </form>
      {state.error ? <p className="text-xs text-red-600">{state.error}</p> : null}
      {state.ok && state.message ? <p className="text-xs text-green-600">{state.message}</p> : null}
    </div>
  );
}
