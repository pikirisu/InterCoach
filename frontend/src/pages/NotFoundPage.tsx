import { ArrowLeft, SearchX } from "lucide-react";

import { Card, CardContent, LinkButton } from "../components/ui";

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardContent className="flex flex-col items-center px-6 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
            <SearchX aria-hidden="true" size={24} />
          </div>
          <h1 className="mt-5 text-2xl font-semibold text-slate-950">Page not found</h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
            The page may have moved, or the link is no longer available.
          </p>
          <LinkButton className="mt-6" to="/app" variant="secondary">
            <ArrowLeft aria-hidden="true" size={16} />
            Back to Dashboard
          </LinkButton>
        </CardContent>
      </Card>
    </main>
  );
}
