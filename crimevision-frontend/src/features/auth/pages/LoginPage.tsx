import { LoginForm } from "@/features/auth/components/LoginForm";

export function LoginPage() {
  return (
    <div className="flex min-h-screen bg-base-950">
      {/* Left side: Background Image & Title Overlay (hidden on mobile/tablet) */}
      <div className="relative hidden items-start justify-start bg-cover bg-center lg:flex lg:w-[65%] xl:w-[72%]" style={{ backgroundImage: "url('/login-bg.png')" }}>
        <div className="absolute inset-0 bg-gradient-to-r from-base-950/95 via-base-950/70 to-transparent" />
        <div className="absolute inset-0 bg-base-950/25" />
        
        {/* Subtle grid pattern overlay */}
        <div className="pointer-events-none absolute inset-0 bg-grid-overlay bg-grid opacity-30" />
        
        <div className="relative z-10 p-12 max-w-lg text-left mt-8">
          <img 
            src="/ksp-logo.png" 
            alt="Karnataka State Police Logo" 
            className="mb-6 h-28 w-auto object-contain drop-shadow-[0_0_15px_rgba(15,61,163,0.25)]" 
          />
          <p className="label-eyebrow text-signal-400 font-semibold tracking-widest uppercase">Karnataka State Police</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-base-50 tracking-tight">Sentinel AI</h1>
          <p className="mt-1.5 text-xs font-bold text-signal-400 tracking-wider uppercase font-display">AI Guardian watching over citizens</p>
          <div className="mt-8 flex gap-4 text-xs font-medium text-base-400">
            <div className="flex items-center gap-1.5 bg-base-900/60 border border-base-800 rounded-full px-3 py-1.5 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-time Intel Feed</span>
            </div>
            <div className="flex items-center gap-1.5 bg-base-900/60 border border-base-800 rounded-full px-3 py-1.5 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-signal-400 animate-pulse" />
              <span>Predictive Analytics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Login box */}
      <div className="relative flex w-full flex-col justify-center px-6 py-12 lg:w-[35%] xl:w-[28%] xl:px-8 bg-base-950 border-l border-base-900">
        <div className="pointer-events-none absolute inset-0 bg-grid-overlay bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="pointer-events-none absolute -top-40 right-10 h-[520px] w-[520px] rounded-full bg-signal-500/5 blur-[120px]" />

        <div className="relative z-10 mx-auto w-full max-w-sm">
          {/* Logo visible only on mobile/tablet */}
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <img 
              src="/ksp-logo.png" 
              alt="Karnataka State Police Logo" 
              className="mb-4 h-20 w-auto object-contain drop-shadow-[0_0_10px_rgba(15,61,163,0.15)]" 
            />
            <p className="label-eyebrow">Karnataka State Police</p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-base-50">Sentinel AI</h1>
            <p className="mt-1 text-sm text-base-400">AI Guardian watching over citizens</p>
          </div>

          <div className="mb-8 hidden lg:block text-left">
            <h2 className="font-display text-2xl font-bold text-base-50">Sign In</h2>
            <p className="mt-1 text-xs text-base-500 font-medium">Sentinel AI — AI Guardian watching over citizens</p>
          </div>

          <div className="glass-card p-6">
            <LoginForm />
          </div>

          <p className="mt-6 text-center text-xs text-base-500 lg:text-left">
            Access is restricted to authorized personnel and logged for audit purposes.
          </p>
        </div>
      </div>
    </div>
  );
}

