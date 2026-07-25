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
    <Card>
      <CardContent className="flex flex-col items-center px-6 py-12 text-center">
        <div className="flex size-11 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-600">
          <AlertCircle aria-hidden="true" size={22} />
        </div>
        <h2 className="mt-4 text-base font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{message}</p>
        {onRetry ? (
          <Button className="mt-6" leftIcon={<RefreshCw aria-hidden="true" size={16} />} onClick={onRetry} variant="secondary">
            Try again
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
