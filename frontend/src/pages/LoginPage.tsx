import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, Sparkles } from "lucide-react";
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
  PasswordInput,
  useToast,
} from "../components/ui";
import { loginSchema, type LoginFormValues } from "../features/auth/auth.schemas";
import { useAuth } from "../hooks/useAuth";
import { getApiErrorMessage } from "../utils/apiError";
import { getAuthRedirectPath } from "../utils/getAuthRedirectPath";

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
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex size-11 items-center justify-center rounded-lg bg-slate-950 text-white shadow-sm shadow-slate-950/10">
            <Sparkles aria-hidden="true" size={20} />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-950">InterCoach</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Log in to InterCoach</CardTitle>
            <CardDescription>Continue to your resume analysis and interview coaching workspace.</CardDescription>
          </CardHeader>

          <CardContent>
            {formError ? (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {formError}
              </div>
            ) : null}

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Input
                autoComplete="email"
                error={errors.email?.message}
                label="Email"
                type="email"
                {...register("email")}
              />

              <PasswordInput
                autoComplete="current-password"
                error={errors.password?.message}
                label="Password"
                {...register("password")}
              />

              <Button
                className="w-full"
                isLoading={isSubmitting}
                leftIcon={<LogIn aria-hidden="true" size={18} />}
                type="submit"
              >
                {isSubmitting ? "Logging in" : "Log in"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center border-t border-slate-100 pt-5 sm:pt-5">
            <p className="text-center text-sm text-slate-600">
              New to InterCoach?{" "}
              <Link className="font-medium text-slate-950 underline-offset-4 hover:underline" to="/register">
                Create an account
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
