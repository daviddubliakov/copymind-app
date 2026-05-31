import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { DecisionLogsDashboardSkeleton } from "@/components/decision-log-skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

type AnalysisStatus = "queued" | "processing" | "completed" | "failed";

type DashboardLogRow = {
  id: string;
  situation_description: string;
  analysis_status: AnalysisStatus;
  analysis_result: unknown;
  created_at: string;
};

type AnalysisResult = {
  decision_category?: string;
  confidence?: number;
};

function toAnalysisResult(value: unknown): AnalysisResult | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as AnalysisResult;
}

function parseConfidence(result: AnalysisResult | null): number | null {
  if (!result || typeof result.confidence !== "number" || Number.isNaN(result.confidence)) {
    return null;
  }

  const normalized = result.confidence <= 1 ? result.confidence * 100 : result.confidence;
  return Math.max(0, Math.min(100, normalized));
}

function formatPercent(value: number | null) {
  if (value === null) return "N/A";
  return `${Math.round(value)}%`;
}

export default function DecisionLogsDashboardPage() {
  return (
    <Suspense fallback={<DecisionLogsDashboardSkeleton />}>
      <DecisionLogsDashboardContent />
    </Suspense>
  );
}

async function DecisionLogsDashboardContent() {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    redirect("/auth/login");
  }

  const { data, error } = await supabase
    .from("decision_logs")
    .select("id, situation_description, analysis_status, analysis_result, created_at")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const logs = (data ?? []) as DashboardLogRow[];
  const totalLogs = logs.length;
  const completedCount = logs.filter((log) => log.analysis_status === "completed").length;
  const failedCount = logs.filter((log) => log.analysis_status === "failed").length;
  const inProgressCount = logs.filter(
    (log) => log.analysis_status === "queued" || log.analysis_status === "processing",
  ).length;

  const confidenceValues = logs
    .filter((log) => log.analysis_status === "completed")
    .map((log) => parseConfidence(toAnalysisResult(log.analysis_result)))
    .filter((confidence): confidence is number => confidence !== null);

  const averageConfidence = confidenceValues.length
    ? confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length
    : null;

  const completionRate = totalLogs > 0 ? (completedCount / totalLogs) * 100 : null;

  const categoryCountMap = new Map<string, number>();
  for (const log of logs) {
    const category = toAnalysisResult(log.analysis_result)?.decision_category?.trim();
    if (!category) continue;
    categoryCountMap.set(category, (categoryCountMap.get(category) ?? 0) + 1);
  }

  const topCategories = Array.from(categoryCountMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          A quick view of your decision log activity and analysis quality.
        </p>
      </div>

      {logs.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No data yet</CardTitle>
            <CardDescription>
              Create your first decision log to unlock dashboard insights.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/decision-logs/new">Create first decision log</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total logs</CardDescription>
                <CardTitle className="text-3xl">{totalLogs}</CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Completed analyses</CardDescription>
                <CardTitle className="text-3xl">{completedCount}</CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>In progress</CardDescription>
                <CardTitle className="text-3xl">{inProgressCount}</CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Failed analyses</CardDescription>
                <CardTitle className="text-3xl">{failedCount}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Short analysis</CardTitle>
                <CardDescription>Health of your recent decision analysis pipeline.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Completion rate</span>
                  <span className="font-medium">{formatPercent(completionRate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Average confidence (completed)</span>
                  <span className="font-medium">{formatPercent(averageConfidence)}</span>
                </div>
                <p className="text-muted-foreground">
                  {completedCount > 0
                    ? "Most logs are being analyzed successfully. Keep writing clear outcomes to improve consistency."
                    : "No completed analyses yet. Once processing finishes, this section will show quality signals."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top decision categories</CardTitle>
                <CardDescription>Most frequent categories from your AI analysis.</CardDescription>
              </CardHeader>
              <CardContent>
                {topCategories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No categorized analyses yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {topCategories.map(([category, count]) => (
                      <li key={category} className="flex items-center justify-between text-sm">
                        <span>{category}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
