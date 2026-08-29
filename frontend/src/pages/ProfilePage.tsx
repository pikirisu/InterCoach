import { Mail, UserCircle } from "lucide-react";

import { PageHeader } from "../components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui";
import { useAuth } from "../hooks/useAuth";

function getInitials(name?: string) {
  if (!name) {
    return "IC";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="animate-surface-in">
      <PageHeader description="Your InterCoach account identity." eyebrow="Profile" title="Your Profile" />

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="overflow-hidden">
          <div className="h-28 bg-slate-950 premium-grid" />
          <CardContent className="-mt-10 p-6">
            <div className="flex size-20 items-center justify-center rounded-2xl border-4 border-slate-900 bg-blue-500 text-xl font-semibold text-white shadow-[0_18px_45px_rgba(0,0,0,0.4)]">
              {getInitials(user?.name)}
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-slate-50">{user?.name || "InterCoach user"}</h2>
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-400">
              <Mail aria-hidden="true" size={16} />
              {user?.email || "No email set"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                <UserCircle aria-hidden="true" size={20} />
              </div>
              <div>
                <CardTitle>Personal information</CardTitle>
                <CardDescription>Account details from your InterCoach session.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-slate-200">Name</p>
              <p className="mt-2 text-sm text-slate-400">{user?.name || "Not available"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">Email</p>
              <p className="mt-2 text-sm text-slate-400">{user?.email || "Not available"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
