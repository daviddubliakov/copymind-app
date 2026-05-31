import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DecisionLogsListSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={idx}>
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <Skeleton className="h-6 w-4/5" />
                <Skeleton className="h-6 w-24 shrink-0 rounded-full" />
              </div>
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent className="pt-0">
              <Skeleton className="h-4 w-11/12" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function DecisionLogDetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="space-y-5">
          {Array.from({ length: 4 }).map((_, idx) => (
            <section className="space-y-2" key={idx}>
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </section>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-3">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-52" />
        </CardHeader>
        <CardContent className="space-y-4">
          <section className="space-y-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-full" />
          </section>
          <section className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-3/4" />
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

export function NewDecisionLogFormSkeleton() {
  return (
    <Card className="w-full max-w-6xl">
      <CardHeader>
        <Skeleton className="h-8 w-56" />
      </CardHeader>
      <CardContent className="space-y-6">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div className="space-y-2" key={idx}>
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-28 w-full" />
          </div>
        ))}
        <Skeleton className="h-10 w-28" />
      </CardContent>
    </Card>
  );
}

export function DecisionLogsDashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-12" />
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, idx) => (
          <Card key={idx}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-7 w-44" />
              <Skeleton className="h-4 w-64 max-w-full" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-14" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-4 w-14" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function AuthControlsSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-20" />
    </div>
  );
}
