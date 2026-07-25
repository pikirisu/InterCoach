import { ClipboardList, FileText, LayoutDashboard, Sparkles, X } from "lucide-react";
import { NavLink } from "react-router";

import { cn } from "../../utils/cn";
import { Button } from "../ui";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  {
    end: true,
    icon: LayoutDashboard,
    label: "Dashboard",
    to: "/app",
  },
  {
    icon: FileText,
    label: "Resumes",
    to: "/app/resumes",
  },
  {
    icon: ClipboardList,
    label: "Analysis",
    to: "/app/analysis",
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isOpen ? (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-slate-950/35 lg:hidden"
          onClick={onClose}
          type="button"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          <NavLink className="flex items-center gap-2 text-sm font-semibold text-slate-950" onClick={onClose} to="/app">
            <span className="flex size-8 items-center justify-center rounded-lg bg-slate-950 text-white shadow-sm shadow-slate-950/10">
              <Sparkles aria-hidden="true" size={16} />
            </span>
            InterCoach
          </NavLink>
          <Button aria-label="Close navigation" className="size-9 px-0 lg:hidden" onClick={onClose} size="sm" variant="ghost">
            <X aria-hidden="true" size={18} />
          </Button>
        </div>

        <nav aria-label="Main navigation" className="flex-1 space-y-1 px-3 py-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-slate-950 text-white shadow-sm shadow-slate-950/10"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                  )
                }
                end={item.end}
                key={item.to}
                onClick={onClose}
                to={item.to}
              >
                <Icon aria-hidden="true" size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-950">Resume intelligence</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">Upload, analyze, and track feedback from one focused workspace.</p>
          </div>
        </div>
      </aside>
    </>
  );
}
