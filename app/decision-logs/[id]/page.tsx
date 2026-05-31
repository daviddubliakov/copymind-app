import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { DecisionLogDetailSkeleton } from "@/components/decision-log-skeletons";
import { DecisionLogPoller } from "@/components/decision-log-poller";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

type AnalysisStatus = "queued" | "processing" | "completed" | "failed";

type DecisionLogRow = {
  id: string;
  situation_description: string;
  decision_made: string;
  expected_outcome: string;
  own_reasoning: string | null;
  analysis_status: AnalysisStatus;
  analysis_error: string | null;
  analysis_result: unknown;
  created_at: string;
  analysis_completed_at: string | null;
};

type AnalysisResult = {
  decision_category?: string;
  cognitive_biases?: string[];
  missed_alternatives?: string[];
  summary?: string;
  confidence?: number;
};

function toAnalysisResult(value: unknown): AnalysisResult | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as AnalysisResult;
}

function getStatusVariant(status: AnalysisStatus) {
  if (status === "failed") return "destructive";
  if (status === "completed") return "default";
  return "secondary";
}

export default async function DecisionLogByIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<DecisionLogDetailSkeleton />}>
      <DecisionLogByIdContent params={params} />
    </Suspense>
  );
}

async function DecisionLogByIdContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    redirect("/auth/login");
  }

  const { data, error } = await supabase
    .from("decision_logs")
    .select(
      "id, situation_description, decision_made, expected_outcome, own_reasoning, analysis_status, analysis_error, analysis_result, created_at, analysis_completed_at",
    )
    .eq("id", id)
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    notFound();
  }

  const decisionLog = data as DecisionLogRow;
  const analysis = toAnalysisResult(decisionLog.analysis_result);

  return (
    <>
      <DecisionLogPoller analysisStatus={decisionLog.analysis_status} />
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Decision log</h1>
          <Link className="text-sm underline" href="/decision-logs">
            Back to logs
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span>Log details</span>
              <Badge variant={getStatusVariant(decisionLog.analysis_status)}>
                {decisionLog.analysis_status}
              </Badge>
            </CardTitle>
            <CardDescription>
              Created at {new Date(decisionLog.created_at).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <section className="space-y-2">
              <h2 className="font-medium">Situation</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {decisionLog.situation_description}
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-medium">Decision made</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {decisionLog.decision_made}
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-medium">Expected outcome</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {decisionLog.expected_outcome}
              </p>
            </section>

            {decisionLog.own_reasoning ? (
              <section className="space-y-2">
                <h2 className="font-medium">Own reasoning</h2>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {decisionLog.own_reasoning}
                </p>
              </section>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI analysis</CardTitle>
            <CardDescription>
              {decisionLog.analysis_completed_at
                ? `Completed at ${new Date(decisionLog.analysis_completed_at).toLocaleString()}`
                : "Analysis is still in progress."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {decisionLog.analysis_error ? (
              <p className="text-sm text-red-600">{decisionLog.analysis_error}</p>
            ) : null}

            {analysis ? (
              <>
                {analysis.decision_category ? (
                  <section className="space-y-2">
                    <h3 className="font-medium">Decision category</h3>
                    <p className="text-sm text-muted-foreground">{analysis.decision_category}</p>
                  </section>
                ) : null}

                {Array.isArray(analysis.cognitive_biases) && analysis.cognitive_biases.length > 0 ? (
                  <section className="space-y-2">
                    <h3 className="font-medium">Cognitive biases</h3>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                      {analysis.cognitive_biases.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {Array.isArray(analysis.missed_alternatives) && analysis.missed_alternatives.length > 0 ? (
                  <section className="space-y-2">
                    <h3 className="font-medium">Missed alternatives</h3>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                      {analysis.missed_alternatives.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No analysis result yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
