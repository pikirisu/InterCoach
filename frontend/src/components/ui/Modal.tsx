import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { cn } from "../../utils/cn";
import { Button } from "./Button";

interface ModalProps {
  children: ReactNode;
  className?: string;
  description?: string;
  footer?: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export function Modal({ children, className, description, footer, isOpen, onClose, title }: ModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
      <div
        aria-describedby={description ? "modal-description" : undefined}
        aria-labelledby="modal-title"
        aria-modal="true"
        className={cn(
          "animate-subtle-pop w-full max-w-lg rounded-lg border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.24)]",
          className,
        )}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-950" id="modal-title">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm leading-6 text-slate-600" id="modal-description">
                {description}
              </p>
            ) : null}
          </div>
          <Button aria-label="Close modal" className="size-8 px-0" onClick={onClose} size="sm" variant="ghost">
            <X aria-hidden="true" size={18} />
          </Button>
        </div>
        <div className="p-5">{children}</div>
        {footer ? <div className="border-t border-slate-200 bg-slate-50/70 p-5">{footer}</div> : null}
      </div>
    </div>
  );
}
