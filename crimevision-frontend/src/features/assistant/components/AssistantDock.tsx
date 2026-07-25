import { useState } from "react";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useAssistantQuery } from "@/features/assistant/hooks/useAssistantQuery";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const SUGGESTIONS = [
  "Which district has the highest crime growth?",
  "Compare Bengaluru Urban and Mysuru",
  "What's driving the current risk level?",
];

/**
 * Floating dashboard-scoped AI assistant. Calls POST /assistant/query on
 * assistant-service, which grounds every answer in the current dashboard
 * aggregates and refuses anything outside that scope - never a
 * general-purpose chat completion.
 */
export function AssistantDock() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Ask me about what's on your dashboard — hotspots, district comparisons, or risk drivers." },
  ]);
  const [input, setInput] = useState("");
  const { mutate, isPending } = useAssistantQuery();

  function send(question?: string) {
    const text = (question ?? input).trim();
    if (!text || isPending) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");

    mutate(
      { question: text },
      {
        onSuccess: (res) => {
          setMessages((m) => [...m, { role: "assistant", text: res.answer }]);
        },
        onError: () => {
          setMessages((m) => [
            ...m,
            { role: "assistant", text: "I couldn't reach the analytics model just now — please try again shortly." },
          ]);
        },
      }
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-signal-500 text-base-950 shadow-glow transition-transform hover:scale-105"
        aria-label="Open dashboard assistant"
      >
        <Sparkles className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex h-[440px] sm:h-[460px] w-[calc(100vw-2rem)] sm:w-80 flex-col overflow-hidden rounded-xl2 border border-white/5 bg-base-850/90 shadow-glass backdrop-blur-xl">

      <div className="flex items-center justify-between border-b border-base-700/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-signal-400" />
          <p className="text-sm font-medium text-base-100">Dashboard assistant</p>
        </div>
        <button onClick={() => setOpen(false)} aria-label="Close" className="text-base-400 hover:text-base-100">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto p-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "ml-auto max-w-[85%] rounded-lg rounded-br-sm bg-signal-500/15 px-3 py-2 text-xs text-signal-100"
                : "mr-auto max-w-[85%] rounded-lg rounded-bl-sm bg-base-800/70 px-3 py-2 text-xs text-base-300"
            }
          >
            {m.text}
          </div>
        ))}
        {isPending && (
          <div className="mr-auto flex max-w-[85%] items-center gap-2 rounded-lg rounded-bl-sm bg-base-800/70 px-3 py-2 text-xs text-base-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            Analyzing dashboard data…
          </div>
        )}

        {messages.length === 1 && !isPending && (
          <div className="flex flex-col gap-1.5 pt-1">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-lg border border-base-700/60 px-3 py-2 text-left text-[11px] text-base-400 hover:border-signal-500/40 hover:text-signal-300"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-base-700/60 p-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask about districts, trends, risk…"
          className="h-9 text-xs"
          disabled={isPending}
        />
        <Button size="sm" onClick={() => send()} disabled={isPending} aria-label="Send">
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
