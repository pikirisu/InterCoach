import { AlertCircle, CheckCircle2, Info, LoaderCircle, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { cn } from "../../utils/cn";

type ToastTone = "success" | "error" | "info" | "loading";

interface ToastInput {
  description?: string;
  duration?: number;
  title: string;
  tone?: ToastTone;
}

interface ToastMessage extends ToastInput {
  id: string;
  tone: ToastTone;
}

interface ToastContextValue {
  dismissToast: (id: string) => void;
  showToast: (toast: ToastInput) => string;
  updateToast: (id: string, toast: Partial<ToastInput>) => void;
}

interface ToastProviderProps {
  children: ReactNode;
}

const DEFAULT_DURATION = 4200;
const MAX_TOASTS = 4;

const ToastContext = createContext<ToastContextValue | null>(null);

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  loading: LoaderCircle,
} satisfies Record<ToastTone, typeof CheckCircle2>;

const toneClasses: Record<ToastTone, string> = {
  success: "border-emerald-200 text-emerald-700",
  error: "border-red-200 text-red-700",
  info: "border-slate-200 text-slate-700",
  loading: "border-slate-200 text-slate-700",
};

const makeToastId = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timers = useRef(new Map<string, number>());

  const clearTimer = useCallback((id: string) => {
    const timer = timers.current.get(id);

    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const dismissToast = useCallback(
    (id: string) => {
      clearTimer(id);
      setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
    },
    [clearTimer],
  );

  const scheduleDismissal = useCallback(
    (id: string, duration = DEFAULT_DURATION) => {
      clearTimer(id);

      if (duration === 0) {
        return;
      }

      const timer = window.setTimeout(() => dismissToast(id), duration);
      timers.current.set(id, timer);
    },
    [clearTimer, dismissToast],
  );

  const showToast = useCallback(
    ({ duration, tone = "info", ...toast }: ToastInput) => {
      const id = makeToastId();
      const nextToast: ToastMessage = { ...toast, id, tone };

      setToasts((currentToasts) => [nextToast, ...currentToasts].slice(0, MAX_TOASTS));
      scheduleDismissal(id, duration);

      return id;
    },
    [scheduleDismissal],
  );

  const updateToast = useCallback(
    (id: string, toast: Partial<ToastInput>) => {
      setToasts((currentToasts) =>
        currentToasts.map((currentToast) =>
          currentToast.id === id ? { ...currentToast, ...toast, tone: toast.tone ?? currentToast.tone } : currentToast,
        ),
      );
      scheduleDismissal(id, toast.duration);
    },
    [scheduleDismissal],
  );

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current.clear();
    },
    [],
  );

  const value = useMemo<ToastContextValue>(
    () => ({ dismissToast, showToast, updateToast }),
    [dismissToast, showToast, updateToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-relevant="additions text"
        className="pointer-events-none fixed right-4 top-4 z-[70] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6"
      >
        {toasts.map((toast) => {
          const Icon = iconMap[toast.tone];

          return (
            <div
              className={cn(
                "animate-toast-in pointer-events-auto flex gap-3 rounded-lg border bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.14)]",
                toneClasses[toast.tone],
              )}
              key={toast.id}
              role={toast.tone === "error" ? "alert" : "status"}
            >
              <Icon
                aria-hidden="true"
                className={cn("mt-0.5 size-5 shrink-0", toast.tone === "loading" && "animate-spin")}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-950">{toast.title}</p>
                {toast.description ? <p className="mt-1 text-sm leading-5 text-slate-600">{toast.description}</p> : null}
              </div>
              <button
                aria-label="Dismiss notification"
                className="-mr-1 -mt-1 flex size-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
                onClick={() => dismissToast(toast.id)}
                type="button"
              >
                <X aria-hidden="true" size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }

  return context;
}
