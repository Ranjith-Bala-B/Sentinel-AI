import { Hammer } from "lucide-react";

export function ModulePlaceholder({ title }: { title: string }) {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center rounded-xl2 border border-dashed border-base-700 text-center">
      <Hammer className="mb-3 h-6 w-6 text-base-500" />
      <p className="font-display text-base font-medium text-base-100">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-base-500">
        This module is scheduled next in the build order and will be delivered as its own complete, tested module.
      </p>
    </div>
  );
}
