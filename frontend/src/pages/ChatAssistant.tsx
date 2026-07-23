import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Bot, User, Loader, Lightbulb, Shield, Cpu } from "lucide-react";
import { api } from "../api";
import { runLocalAiQuery, detectLocalAi } from "../localAi";

const suggestions = [
  "Explain my latest blood report",
  "What are my abnormal values?",
  "Is my cholesterol high?",
  "What should I discuss with my doctor?",
  "Explain HbA1c and diabetes risk",
  "What does high blood pressure mean?",
];

interface Message { role: "user" | "ai"; text: string; ts: string; }

export default function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "Hello! I'm your CareAI Clinical AI Assistant. I can help explain your medical reports, answer health questions, and provide clinical guidance. What would you like to know?", ts: new Date().toLocaleTimeString() }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [localMode, setLocalMode] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", text, ts: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      if (localMode) {
        
        const res = await runLocalAiQuery(text);
        setMessages(prev => [...prev, { role: "ai", text: res.answer, ts: new Date().toLocaleTimeString() }]);
      } else {
        const res = await api.sendChat(text);
        setMessages(prev => [...prev, { role: "ai", text: res.answer, ts: new Date().toLocaleTimeString() }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "I'm having trouble connecting to the AI. Please ensure the backend server is running, or toggle Local On-Device AI for fully private client-side answers.", ts: new Date().toLocaleTimeString() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Clinical AI Assistant</h1>
          <p className="text-gray-500 text-sm mt-0.5">RAG-powered medical Q&A — ask anything about your health</p>
        </div>
        <button
          onClick={() => setLocalMode(!localMode)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
            localMode 
              ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-400" 
              : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700"
          }`}
        >
          <Cpu size={14} className={localMode ? "animate-pulse" : ""} />
          {localMode ? "Local On-Device AI Active" : "Enable Local On-Device AI"}
        </button>
      </div>

      {}
      {messages.length <= 1 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2 text-xs text-gray-500"><Lightbulb size={12} /> Suggested questions</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map(s => (
              <button key={s} onClick={() => sendMessage(s)}
                className="text-xs px-3 py-1.5 bg-gray-800 border border-gray-700 text-gray-300 rounded-full hover:border-blue-500/50 hover:text-blue-400 transition-all"
              >{s}</button>
            ))}
          </div>
        </div>
      )}

      {}
      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-4 overflow-y-auto space-y-4 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "ai" && (
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={14} className="text-blue-400" />
              </div>
            )}
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-blue-600 text-white rounded-tr-sm"
                : "bg-gray-800 text-gray-200 rounded-tl-sm"
            }`}>
              {msg.text}
              <div className={`text-xs mt-1 ${msg.role === "user" ? "text-blue-200" : "text-gray-600"}`}>{msg.ts}</div>
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User size={14} className="text-gray-400" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-blue-400" />
            </div>
            <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader size={14} className="text-gray-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {}
      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
          placeholder="Ask about your health, reports, or medical findings..."
          className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
          disabled={loading}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-xl transition-all shadow-lg shadow-blue-600/20"
        >
          <Send size={16} className="text-white" />
        </button>
      </div>
    </div>
  );
}
