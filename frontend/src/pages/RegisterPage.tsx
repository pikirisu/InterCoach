import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";

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
import { registerSchema, type RegisterFormValues } from "../features/auth/auth.schemas";
import { useAuth } from "../hooks/useAuth";
import { getApiErrorMessage } from "../utils/apiError";

export function RegisterPage() {
  const [formError, setFormError] = useState<string | null>(null);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setFormError(null);

    try {
      await registerUser(values);
      showToast({ description: "Your workspace is ready.", title: "Account created", tone: "success" });
      navigate("/app", { replace: true });
    } catch (error) {
      const message = getApiErrorMessage(error);
      setFormError(message);
      showToast({ description: message, title: "Registration failed", tone: "error" });
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
            <CardTitle>Create your account</CardTitle>
            <CardDescription>Start analyzing resumes and preparing for interviews with InterCoach.</CardDescription>
          </CardHeader>

          <CardContent>
            {formError ? (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {formError}
              </div>
            ) : null}

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Input autoComplete="name" error={errors.name?.message} label="Name" type="text" {...register("name")} />

              <Input
                autoComplete="email"
                error={errors.email?.message}
                label="Email"
                type="email"
                {...register("email")}
              />

              <PasswordInput
                autoComplete="new-password"
                error={errors.password?.message}
                label="Password"
                {...register("password")}
              />

              <Button
                className="w-full"
                isLoading={isSubmitting}
                leftIcon={<UserPlus aria-hidden="true" size={18} />}
                type="submit"
              >
                {isSubmitting ? "Creating account" : "Create account"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center border-t border-slate-100 pt-5 sm:pt-5">
            <p className="text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link className="font-medium text-slate-950 underline-offset-4 hover:underline" to="/login">
                Log in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
