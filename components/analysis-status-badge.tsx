import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AnalysisStatus = "queued" | "processing" | "completed" | "failed";

function getStatusVariant(status: AnalysisStatus) {
  if (status === "failed") return "destructive";
  if (status === "completed") return "default";
  return "secondary";
}

type AnalysisStatusBadgeProps = {
  status: AnalysisStatus;
};

export function AnalysisStatusBadge({ status }: AnalysisStatusBadgeProps) {
  const isLoading = status === "queued" || status === "processing";

  return (
    <Badge
      variant={getStatusVariant(status)}
      className={cn(isLoading && "gap-1.5")}
      aria-busy={isLoading}
    >
      {status === "processing" ? (
        <Loader2 className="h-3 w-3 shrink-0 animate-spin" aria-hidden />
      ) : null}
      {status === "queued" ? (
        <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
        </span>
      ) : null}
      <span className={cn(isLoading && "animate-pulse")}>{status}</span>
    </Badge>
  );
}
