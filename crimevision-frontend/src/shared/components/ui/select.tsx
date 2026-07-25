import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "h-10 w-full appearance-none rounded-lg border border-base-300 bg-white px-3 pr-8 text-sm text-base-900 font-medium shadow-sm",
          "focus-visible:outline-none focus-visible:border-signal-500 focus-visible:ring-1 focus-visible:ring-signal-500/40",
          "transition-colors cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-base-500" />
    </div>
  )
);
Select.displayName = "Select";
