import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg border border-base-300 bg-white px-3 text-sm text-base-900 placeholder:text-base-400 font-medium shadow-sm",
        "focus-visible:outline-none focus-visible:border-signal-500 focus-visible:ring-1 focus-visible:ring-signal-500/40",
        "transition-colors",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
