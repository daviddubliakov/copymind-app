import Link from "next/link";

import { Button } from "@/components/ui/button";

export function BackToLogsButton() {
  return (
    <Button asChild variant="outline">
      <Link href="/decision-logs">Back to logs</Link>
    </Button>
  );
}
