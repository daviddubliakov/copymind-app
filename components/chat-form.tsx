import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function ChatForm() {
  return (
    <Card className="w-full max-w-6xl">
      <CardHeader>
        <CardTitle className="text-2xl">New Decision Log</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="situation-description">Situation description</Label>
            <textarea
              id="situation-description"
              name="situationDescription"
              required
              rows={4}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Describe the context and constraints."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="decision-made">Decision made</Label>
            <textarea
              id="decision-made"
              name="decisionMade"
              required
              rows={3}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="What decision was made?"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="expected-outcome">Expected outcome</Label>
            <textarea
              id="expected-outcome"
              name="expectedOutcome"
              required
              rows={3}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="What result do you expect from this decision?"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="own-reasoning">Own reasoning (optional)</Label>
            <textarea
              id="own-reasoning"
              name="ownReasoning"
              rows={3}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Share your thought process if needed."
            />
          </div>

          <Button type="submit" className="w-full sm:w-fit">
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
