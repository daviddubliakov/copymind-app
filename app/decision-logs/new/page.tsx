import { ChatForm } from "@/components/chat-form";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NewDecisionLogFormSkeleton } from "@/components/decision-log-skeletons";

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
    <div className="mx-auto w-full max-w-6xl">
      <Suspense fallback={<NewDecisionLogFormSkeleton />}>
        <ChatProtected />
      </Suspense>
    </div>
  );
}
