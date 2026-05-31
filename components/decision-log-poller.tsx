"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type AnalysisStatus = "queued" | "processing" | "completed" | "failed";

type DecisionLogPollerProps = {
  analysisStatus: AnalysisStatus;
  intervalMs?: number;
};

export function DecisionLogPoller({ analysisStatus, intervalMs = 3000 }: DecisionLogPollerProps) {
  const router = useRouter();

  useEffect(() => {
    if (analysisStatus === "completed" || analysisStatus === "failed") {
      return;
    }

    const intervalId = window.setInterval(() => {
      router.refresh();
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [analysisStatus, intervalMs, router]);

  return null;
}
