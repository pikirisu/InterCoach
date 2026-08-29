import { AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "./Button";
import { Card, CardContent } from "./Card";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  title?: string;
}

export function ErrorState({ message, onRetry, title = "Something went wrong" }: ErrorStateProps) {
  return (
    <Card className="border-red-500/20 bg-slate-900">
      <CardContent className="flex flex-col items-center px-6 py-14 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400">
          <AlertCircle aria-hidden="true" size={23} />
        </div>
        <h2 className="mt-5 text-lg font-semibold text-slate-50">{title}</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">{message}</p>
        {onRetry ? (
          <Button className="mt-7" leftIcon={<RefreshCw aria-hidden="true" size={16} />} onClick={onRetry} variant="secondary">
            Try again
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
