import { Card, CardContent, Skeleton } from "../components/ui";

export function RouteLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-300">
      <Card className="w-full max-w-sm">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-3">
            <Skeleton className="size-11" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-44" />
            </div>
          </div>
          <Skeleton className="h-11 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
