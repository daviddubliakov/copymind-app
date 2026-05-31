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
  created_at: string;
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

export default function DecisionLogsPage() {
  return (
    <Suspense fallback={<DecisionLogsListSkeleton />}>
      <DecisionLogsContent />
    </Suspense>
  );
}

async function DecisionLogsContent() {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    redirect("/auth/login");
  }

  const { data, error } = await supabase
    .from("decision_logs")
    .select("id, situation_description, decision_made, analysis_status, created_at")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const logs = (data ?? []) as DecisionLogListRow[];
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
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
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
