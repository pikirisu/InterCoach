import { Card, CardContent, Skeleton } from "../components/ui";

export function RouteLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f8fb] px-4 text-slate-700">
      <Card className="w-full max-w-sm">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-44" />
            </div>
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
