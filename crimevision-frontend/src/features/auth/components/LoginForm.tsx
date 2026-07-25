import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Loader2, Lock, Mail } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { loginSchema, type LoginFormValues } from "@/features/auth/types/auth.types";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";

const ROLE_HINTS = [
  { role: "Investigator", sample: "investigator@ksp.gov.in" },
  { role: "Analyst", sample: "analyst@ksp.gov.in" },
  { role: "Supervisor", sample: "supervisor@ksp.gov.in" },
  { role: "Administrator", sample: "admin@ksp.gov.in" },
];

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    setIsSubmitting(true);
    try {
      await login(values.email, values.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {serverError && (
        <div className="flex items-center gap-2 rounded-lg border border-alert-red/30 bg-alert-red/10 px-3.5 py-2.5 text-sm text-alert-red">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {serverError}
        </div>
      )}

      <div>
        <Label htmlFor="email">Email address</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-base-500" />
          <Input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="you@ksp.gov.in"
            className="pl-10"
            {...register("email")}
          />
        </div>
        {errors.email && <p className="mt-1.5 text-xs text-alert-red">{errors.email.message}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <a href="/forgot-password" className="mb-1.5 text-xs text-signal-400 hover:text-signal-300">
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-base-500" />
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="pl-10"
            {...register("password")}
          />
        </div>
        {errors.password && <p className="mt-1.5 text-xs text-alert-red">{errors.password.message}</p>}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Sign in to console
      </Button>

      <div className="pt-2">
        <p className="label-eyebrow mb-2">Demo role access</p>
        <div className="grid grid-cols-2 gap-2">
          {ROLE_HINTS.map((r) => (
            <button
              key={r.role}
              type="button"
              onClick={() => {
                setValue("email", r.sample);
                setValue("password", "demo1234");
              }}
              className="rounded-lg border border-base-700 bg-base-900/40 px-3 py-2 text-left text-xs text-base-300 transition-colors hover:border-signal-500/40 hover:text-signal-300"
            >
              {r.role}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
