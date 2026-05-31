import { Suspense } from "react";
import { redirect } from "next/navigation";

import { BackToLogsButton } from "@/components/back-to-logs-button";
import { ChatForm } from "@/components/chat-form";
import { NewDecisionLogFormSkeleton } from "@/components/decision-log-skeletons";
import { createClient } from "@/lib/supabase/server";

async function ChatProtected() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return <ChatForm />
}

export default function NewDecisionLogPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex items-center justify-end">
        <BackToLogsButton />
      </div>
      <Suspense fallback={<NewDecisionLogFormSkeleton />}>
        <ChatProtected />
      </Suspense>
    </div>
  );
}
