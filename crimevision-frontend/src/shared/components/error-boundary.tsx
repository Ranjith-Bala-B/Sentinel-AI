import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[CrimeVision] Unhandled UI error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex h-full min-h-[200px] items-center justify-center rounded-xl2 border border-alert-red/30 bg-alert-red/5 p-8 text-center">
            <div>
              <p className="text-sm font-medium text-alert-red">Something went wrong rendering this panel.</p>
              <p className="mt-1 text-xs text-base-400">Try refreshing, or contact your system administrator.</p>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
