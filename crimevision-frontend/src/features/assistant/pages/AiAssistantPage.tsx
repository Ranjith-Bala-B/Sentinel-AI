import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { apiClient } from "@/shared/lib/api-client";
import { MessageSquare, Send, Mic, Sparkles, Compass, Search, Users, Brain } from "lucide-react";

interface Message {
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export function AiAssistantPage() {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Welcome to Sentinel AI Assistant. I have dynamic access to the MySQL analytical database. How can I assist you with KSP crime intelligence today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || sending) return;

    const userMsg: Message = {
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setSending(true);

    try {
      // Call backend AI query endpoint
      const response = await apiClient.post<{ answer: string }>("/assistant/query", {
        question: text,
        context: { districtFilter: null }
      });

      const aiMsg: Message = {
        sender: "ai",
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Check if AI output controls dashboards / triggers navigation
      const lowerAnswer = response.answer.toLowerCase();
      if (lowerAnswer.includes("opening geo intelligence") || lowerAnswer.includes("opening geospatial")) {
        setTimeout(() => navigate("/geospatial"), 1500);
      } else if (lowerAnswer.includes("opening repeat offenders") || lowerAnswer.includes("opening offenders")) {
        setTimeout(() => navigate("/repeat-offenders"), 1500);
      } else if (lowerAnswer.includes("opening crime analytics")) {
        setTimeout(() => navigate("/crime-analytics"), 1500);
      } else if (lowerAnswer.includes("opening hotspots")) {
        setTimeout(() => navigate("/hotspots"), 1500);
      } else if (lowerAnswer.includes("opening predictions")) {
        setTimeout(() => navigate("/predictions"), 1500);
      } else if (lowerAnswer.includes("opening investigator support") || lowerAnswer.includes("opening investigator")) {
        setTimeout(() => navigate("/investigator"), 1500);
      } else if (lowerAnswer.includes("opening sociological insights")) {
        setTimeout(() => navigate("/sociological"), 1500);
      }
    } catch (err) {
      console.error("Error communicating with AI assistant", err);
      const errMsg: Message = {
        sender: "ai",
        text: "Error: Unable to connect to the assistant service. Please check if the backend is running and the database is configured.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const suggestedQueries = [
    "Show theft hotspots in Mysuru",
    "Show total crime count and solved rate",
    "What are the highest risk districts?",
    "How many repeat offenders are flagged?"
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="label-eyebrow">Interactive Intelligence</p>
        <h1 className="mt-1 font-display text-xl font-semibold text-base-100">AI Crime Assistant Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        {/* Main Chat Interface */}
        <div className="xl:col-span-3 flex flex-col h-[490px]">
          <Card className="flex flex-col h-full overflow-hidden shadow-glass border-base-800 bg-base-850">
            {/* Header */}
            <CardHeader className="py-3 px-5 border-b border-base-800 bg-base-700/50 flex flex-row items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-signal-400" />
                <span className="text-xs font-bold text-base-100 uppercase tracking-wider">Sentinel AI chatbot</span>
              </div>
              <span className="text-[10px] bg-signal-500/10 text-signal-500 font-bold px-2 py-0.5 rounded border border-signal-500/20 uppercase">
                LLM Grounded (Gemini/Local)
              </span>
            </CardHeader>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-base-950/20 scrollbar-thin">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-xl p-3.5 shadow-sm text-xs ${
                      m.sender === "user"
                        ? "bg-signal-500 text-white rounded-br-none"
                        : "bg-base-850 border border-base-800 text-base-200 rounded-bl-none font-semibold leading-relaxed"
                    }`}
                  >
                    <p>{m.text}</p>
                    <span
                      className={`block text-[9px] mt-1.5 text-right ${
                        m.sender === "user" ? "text-blue-100" : "text-base-500"
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-base-850 border border-base-800 rounded-xl p-3 rounded-bl-none text-xs text-base-500 italic font-semibold">
                    Assistant is analyzing database aggregates...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={onSubmit} className="border-t border-base-800 p-3 bg-base-850 flex gap-2 shrink-0">
              <input
                type="text"
                placeholder="Ask about crimes, repeat offenders, or risk statistics..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={sending}
                className="flex-1 bg-base-950 border border-base-800 rounded-lg px-3.5 py-2 text-xs font-semibold text-base-100 focus:outline-none focus:ring-1 focus:ring-signal-500"
              />
              <button
                type="button"
                className="p-2.5 bg-base-950 border border-base-800 hover:bg-base-800 rounded-lg text-base-500 hover:text-base-200 transition-colors"
                title="Voice input"
              >
                <Mic className="h-4 w-4" />
              </button>
              <button
                type="submit"
                disabled={sending || !inputText.trim()}
                className="p-2.5 bg-signal-500 hover:bg-signal-600 rounded-lg text-white shadow-sm disabled:opacity-50 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </Card>
        </div>

        {/* Sidebar panels: Suggested queries & Quick Actions */}
        <div className="space-y-6">
          {/* Suggested Queries */}
          <Card className="shadow-glass border-base-800 bg-base-850">
            <CardHeader className="py-3 px-5 border-b border-base-800 bg-base-700/50">
              <span className="text-xs font-bold text-base-100 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-signal-500" />
                SUGGESTED QUERIES
              </span>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {suggestedQueries.map((q, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="bg-base-950 hover:bg-base-750/30 text-xs font-semibold text-base-200 p-3 rounded-lg border border-base-800 cursor-pointer shadow-sm transition-all"
                >
                  {q}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-glass border-base-800 bg-base-850">
            <CardHeader className="py-3 px-5 border-b border-base-800 bg-base-700/50">
              <span className="text-xs font-bold text-base-100 uppercase tracking-wider">
                QUICK NAV SHORTS
              </span>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-2 gap-2 text-center text-[10px] font-bold text-base-300">
              <button
                onClick={() => navigate("/investigator")}
                className="bg-base-950 hover:bg-base-750/30 p-2.5 border border-base-800 rounded-lg flex flex-col items-center gap-1.5 transition-all"
              >
                <Search className="h-4 w-4 text-blue-500" />
                Search FIR
              </button>
              <button
                onClick={() => navigate("/repeat-offenders")}
                className="bg-base-950 hover:bg-base-750/30 p-2.5 border border-base-800 rounded-lg flex flex-col items-center gap-1.5 transition-all"
              >
                <Users className="h-4 w-4 text-amber-500" />
                Offenders MO
              </button>
              <button
                onClick={() => navigate("/hotspots")}
                className="bg-base-950 hover:bg-base-750/30 p-2.5 border border-base-800 rounded-lg flex flex-col items-center gap-1.5 transition-all"
              >
                <Compass className="h-4 w-4 text-red-500" />
                Find Hotspots
              </button>
              <button
                onClick={() => navigate("/predictions")}
                className="bg-base-950 hover:bg-base-750/30 p-2.5 border border-base-800 rounded-lg flex flex-col items-center gap-1.5 transition-all"
              >
                <Brain className="h-4 w-4 text-purple-500" />
                Predict Crime
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
