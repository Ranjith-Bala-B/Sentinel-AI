import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { MailCheck, Shield } from "lucide-react";
import { authApi } from "@/features/auth/api/auth.api";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/features/auth/types/auth.types";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordFormValues) {
    await authApi.requestPasswordReset(values.email);
    setSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-signal-500/30 bg-signal-500/10">
            <Shield className="h-7 w-7 text-signal-400" />
          </div>
          <h1 className="font-display text-xl font-semibold text-base-50">Reset your password</h1>
          <p className="mt-1 text-sm text-base-400">We'll email you a secure reset link</p>
        </div>

        <div className="glass-card p-8">
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <MailCheck className="h-8 w-8 text-signal-400" />
              <p className="text-sm text-base-200">Check your inbox for a reset link.</p>
              <Link to="/login" className="text-xs text-signal-400 hover:text-signal-300">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" placeholder="you@ksp.gov.in" {...register("email")} />
                {errors.email && <p className="mt-1.5 text-xs text-alert-red">{errors.email.message}</p>}
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                Send reset link
              </Button>
              <Link to="/login" className="block text-center text-xs text-base-400 hover:text-base-200">
                Back to sign in
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
