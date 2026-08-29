import {
  BarChart3,
  Briefcase,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Sparkles,
  UploadCloud,
  UserCircle,
  X,
} from "lucide-react";
import { NavLink } from "react-router";

import { cn } from "../../utils/cn";
import { Button } from "../ui";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationSections = [
  {
    items: [
      {
        end: true,
        icon: LayoutDashboard,
        label: "Dashboard",
        to: "/app",
      },
      {
        icon: UploadCloud,
        label: "Upload",
        to: "/app/upload",
      },
      {
        icon: FileText,
        label: "Library",
        to: "/app/resumes",
      },
      {
        icon: ClipboardList,
        label: "Analysis",
        to: "/app/analysis",
      },
      {
        icon: Briefcase,
        label: "Job Descriptions",
        to: "/app/job-descriptions",
      },
      {
        icon: BarChart3,
        label: "Analytics",
        to: "/app/analytics",
      },
    ],
    label: "Workspace",
  },
  {
    items: [
      {
        icon: UserCircle,
        label: "Profile",
        to: "/app/profile",
      },
    ],
    label: "Account",
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isOpen ? (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          type="button"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-800 bg-slate-900/95 backdrop-blur-xl transition-transform duration-200 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-20 items-center justify-between px-5">
          <NavLink className="flex items-center gap-3 text-sm font-semibold text-slate-50" onClick={onClose} to="/app">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
              <Sparkles aria-hidden="true" size={19} />
            </span>
            <span>
              <span className="block text-base">InterCoach</span>
              <span className="block text-xs font-medium text-slate-500">Resume Intelligence</span>
            </span>
          </NavLink>
          <Button aria-label="Close navigation" className="size-9 px-0 lg:hidden" onClick={onClose} size="sm" variant="ghost">
            <X aria-hidden="true" size={18} />
          </Button>
        </div>

        <nav aria-label="Main navigation" className="flex-1 space-y-7 px-4 py-4">
          {navigationSections.map((section) => (
            <div key={section.label}>
              <p className="px-3 text-xs font-semibold uppercase text-slate-500">{section.label}</p>
              <div className="mt-2 space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      className={({ isActive }) =>
                        cn(
                          "group flex h-11 items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition-[background-color,color,box-shadow] duration-200",
                          isActive
                            ? "bg-blue-500 text-white shadow-[0_14px_30px_rgba(0,0,0,0.35)]"
                            : "text-slate-400 hover:bg-slate-800 hover:text-slate-50",
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
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
