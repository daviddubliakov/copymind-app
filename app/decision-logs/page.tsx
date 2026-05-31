import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { DecisionLogPoller } from "@/components/decision-log-poller";
import { DecisionLogsListSkeleton } from "@/components/decision-log-skeletons";
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

type DecisionLogListRow = {
  id: string;
  situation_description: string;
  decision_made: string;
  analysis_status: AnalysisStatus;
  analysis_result: unknown;
  created_at: string;
};

type DecisionLogCategory = {
  value: string;
  label: string;
};

function getStatusVariant(status: AnalysisStatus) {
  if (status === "failed") return "destructive";
  if (status === "completed") return "default";
  return "secondary";
}

function shorten(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
}

function getDecisionCategory(analysisResult: unknown): string | null {
  if (!analysisResult || typeof analysisResult !== "object" || Array.isArray(analysisResult)) {
    return null;
  }

  const candidate = (analysisResult as { decision_category?: string }).decision_category;
  if (typeof candidate !== "string" || !candidate.trim()) {
    return null;
  }

  return candidate.trim();
}

function getCategoryLabel(value: string) {
  if (value === "all") return "All categories";
  if (value === "uncategorized") return "Uncategorized";
  return value;
}

export default function DecisionLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  return (
    <Suspense fallback={<DecisionLogsListSkeleton />}>
      <DecisionLogsContent searchParams={searchParams} />
    </Suspense>
  );
}

async function DecisionLogsContent({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    redirect("/auth/login");
  }

  const { data, error } = await supabase
    .from("decision_logs")
    .select("id, situation_description, decision_made, analysis_status, analysis_result, created_at")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const logs = (data ?? []) as DecisionLogListRow[];
  const resolvedSearchParams = await searchParams;
  const selectedCategoryValue = (resolvedSearchParams.category?.trim() || "all").toLowerCase();

  const categorySet = new Set<string>();
  for (const log of logs) {
    const category = getDecisionCategory(log.analysis_result);
    if (category) {
      categorySet.add(category);
    }
  }

  const categoryOptions: DecisionLogCategory[] = [
    { value: "all", label: "All categories" },
    ...Array.from(categorySet)
      .sort((a, b) => a.localeCompare(b))
      .map((category) => ({ value: category, label: category })),
    { value: "uncategorized", label: "Uncategorized" },
  ];

  const selectedCategory = categoryOptions.some((option) => option.value.toLowerCase() === selectedCategoryValue)
    ? categoryOptions.find((option) => option.value.toLowerCase() === selectedCategoryValue)?.value ?? "all"
    : "all";

  const filteredLogs = logs.filter((log) => {
    if (selectedCategory === "all") return true;
    const category = getDecisionCategory(log.analysis_result);
    if (selectedCategory === "uncategorized") return !category;
    return category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  const hasInProgressAnalysis = logs.some(
    (log) => log.analysis_status === "queued" || log.analysis_status === "processing",
  );

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <DecisionLogPoller
        analysisStatus={hasInProgressAnalysis ? "processing" : "completed"}
        intervalMs={3000}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Decision logs</h1>
          <p className="text-sm text-muted-foreground">
            Review your decisions and their analysis status.
          </p>
        </div>
        <Button asChild>
          <Link href="/decision-logs/new">Create new log</Link>
        </Button>
      </div>

      {logs.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {categoryOptions.map((category) => (
            <Button
              key={category.value}
              asChild
              size="sm"
              variant={selectedCategory === category.value ? "default" : "outline"}
            >
              <Link href={category.value === "all" ? "/decision-logs" : `/decision-logs?category=${encodeURIComponent(category.value)}`}>
                {category.label}
              </Link>
            </Button>
          ))}
        </div>
      ) : null}

      {logs.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No decision logs yet</CardTitle>
            <CardDescription>
              Start by creating your first decision log.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/decision-logs/new">Go to new log form</Link>
            </Button>
          </CardContent>
        </Card>
      ) : filteredLogs.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No logs in this category</CardTitle>
            <CardDescription>
              No decision logs match{" "}
              <span className="font-medium text-foreground">{getCategoryLabel(selectedCategory)}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/decision-logs">Show all categories</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <Link href={`/decision-logs/${log.id}`} key={log.id} className="block">
              <Card className="transition-colors hover:bg-muted/30">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base leading-6">
                      {shorten(log.situation_description, 150)}
                    </CardTitle>
                    <Badge variant={getStatusVariant(log.analysis_status)}>
                      {log.analysis_status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {new Date(log.created_at).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Decision:</span>{" "}
                    {shorten(log.decision_made, 160)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
