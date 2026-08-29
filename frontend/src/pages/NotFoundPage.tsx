import { ArrowLeft, SearchX, Sparkles } from "lucide-react";

import { Card, CardContent, LinkButton } from "../components/ui";

export function NotFoundPage() {
  return (
    <main className="premium-grid flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <Card className="w-full max-w-lg animate-surface-in">
        <CardContent className="flex flex-col items-center px-6 py-14 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
            <SearchX aria-hidden="true" size={26} />
          </div>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-800/60 px-3 py-1 text-xs font-semibold text-slate-400">
            <Sparkles aria-hidden="true" size={14} />
            InterCoach
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-slate-50">Page not found</h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
            The page may have moved, or the link is no longer available.
          </p>
          <LinkButton className="mt-7" to="/app" variant="secondary">
            <ArrowLeft aria-hidden="true" size={16} />
            Back to Dashboard
          </LinkButton>
        </CardContent>
      </Card>
    </main>
  );
}
