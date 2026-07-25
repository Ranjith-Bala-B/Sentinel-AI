import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
  {
    variants: {
      tone: {
        neutral: "bg-base-700/60 text-base-300",
        signal: "bg-signal-500/15 text-signal-400",
        amber: "bg-alert-amber/15 text-alert-amber",
        red: "bg-alert-red/15 text-alert-red",
        blue: "bg-alert-blue/15 text-alert-blue",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
