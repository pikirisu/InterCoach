import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2, LogIn, Sparkles } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  LinkButton,
  PasswordInput,
  useToast,
} from "../components/ui";
import { loginSchema, type LoginFormValues } from "../features/auth/auth.schemas";
import { useAuth } from "../hooks/useAuth";
import { getApiErrorMessage } from "../utils/apiError";
import { getAuthRedirectPath } from "../utils/getAuthRedirectPath";

const highlights = ["AI resume feedback", "Job description matching", "Resume history"];

export function LoginPage() {
  const [formError, setFormError] = useState<string | null>(null);
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);

    try {
      await login(values);
      showToast({ description: "You're signed in to InterCoach.", title: "Welcome back", tone: "success" });
      navigate(getAuthRedirectPath(location.state), { replace: true });
    } catch (error) {
      const message = getApiErrorMessage(error);
      setFormError(message);
      showToast({ description: message, title: "Login failed", tone: "error" });
    }
  };

  return (
    <main className="grid min-h-screen bg-slate-950 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden border-r border-slate-800 bg-slate-950 text-white lg:block">
        <div className="premium-grid flex min-h-screen flex-col justify-between p-10">
          <Link className="flex items-center gap-3 text-sm font-semibold" to="/">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
              <Sparkles aria-hidden="true" size={19} />
            </span>
            InterCoach
          </Link>
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-blue-300">Resume intelligence workspace</p>
            <h1 className="mt-5 text-5xl font-semibold leading-tight">Welcome back to sharper resume decisions.</h1>
            <p className="mt-5 text-base leading-7 text-slate-300">
              Continue from your latest uploads, reports, and AI improvement queue.
            </p>
            <div className="mt-8 grid gap-3">
              {highlights.map((item) => (
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4" key={item}>
                  <CheckCircle2 aria-hidden="true" className="text-emerald-300" size={18} />
                  <span className="text-sm font-semibold text-white/85">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-white/50">InterCoach analyzes resumes with a focused, modern workflow.</p>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="w-full max-w-md animate-surface-in">
          <div className="mb-8 flex items-center justify-between gap-4">
            <Link className="flex items-center gap-3 text-sm font-semibold text-slate-50 lg:hidden" to="/">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
                <Sparkles aria-hidden="true" size={19} />
              </span>
              InterCoach
            </Link>
            <LinkButton className="ml-auto" size="sm" to="/" variant="ghost">
              Home
            </LinkButton>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Log in to InterCoach</CardTitle>
              <CardDescription>Continue to your AI-powered resume analysis workspace.</CardDescription>
            </CardHeader>

            <CardContent>
              {formError ? (
                <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400" role="alert">
                  {formError}
                </div>
              ) : null}

              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                <Input autoComplete="email" error={errors.email?.message} label="Email" type="email" {...register("email")} />

                <PasswordInput autoComplete="current-password" error={errors.password?.message} label="Password" {...register("password")} />

                <Button className="w-full" isLoading={isSubmitting} leftIcon={<LogIn aria-hidden="true" size={18} />} type="submit">
                  {isSubmitting ? "Logging in" : "Log in"}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="justify-center border-t border-slate-800 pt-5 sm:pt-5">
              <p className="text-center text-sm text-slate-400">
                New to InterCoach?{" "}
                <Link className="inline-flex items-center gap-1 font-semibold text-blue-400 underline-offset-4 hover:underline" to="/register">
                  Create an account
                  <ArrowRight aria-hidden="true" size={14} />
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </section>
    </main>
  );
}
