# Step-by-step implementation plan

## Goal
After creating a decision log, run async LLM analysis and show results in UI.

## 1) Extend database schema
Add fields to `decision_logs`:

- `analysis_status text not null default 'queued'`
  Tracks lifecycle: `queued | processing | completed | failed`.
- `analysis_result jsonb null`
  Stores structured LLM output.
- `analysis_error text null`
  Stores failure reason for debugging/retries.
- `analysis_started_at timestamptz null`
  Time when worker started processing.
- `analysis_completed_at timestamptz null`
  Time when worker finished.
- `analysis_attempts integer not null default 0`
  Retry counter to prevent infinite loops.

Also add a check constraint for valid `analysis_status` values.

## 2) Update create action
In `app/actions/decision-log.ts`:

- On insert, set:
  - `analysis_status: "queued"`
  - `analysis_attempts: 0`
- Use `.select("id, analysis_status").single()` after insert.
- Return:
  - `decisionLogId`
  - `analysisStatus`
  in form state.

## 3) Add internal processing endpoint
Create `POST /api/internal/process-decision-logs`:

- Validate secret header (for example `x-internal-secret`).
- Fetch queued logs (batch size 1..N).
- Atomically mark row `processing` + `analysis_started_at` + increment attempts.
- Call LLM with structured JSON output request.
- Save:
  - success -> `completed`, `analysis_result`, `analysis_completed_at`
  - error -> `failed` (or back to `queued`), `analysis_error`, `analysis_completed_at`

## 4) Trigger worker periodically
Use scheduler (recommended: Vercel Cron every minute) to call internal endpoint.

## 5) Define strict LLM response schema
Require JSON with fields like:

- `decision_category`
- `cognitive_biases` (array)
- `missed_alternatives` (array)
- `summary`
- optional `confidence`

Reject invalid response format and mark as failed.

## 6) Retry policy
Recommended:

- Increment `analysis_attempts` on each run.
- Retry while attempts < 3.
- If max attempts reached -> `failed`.

## 7) UI integration
After submit:

- Show "queued" confirmation.
- Use returned `decisionLogId` to open details page or poll status.
- Render statuses:
  - `queued` / `processing` -> loader
  - `completed` -> analysis result
  - `failed` -> error + retry action

## 8) Security and reliability notes
- Keep LLM API keys server-only (never `NEXT_PUBLIC_*`).
- Protect internal endpoint with secret.
- Keep RLS enabled on `decision_logs`.
- Ensure users can read only their own logs/results.
