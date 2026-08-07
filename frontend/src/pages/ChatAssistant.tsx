import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Bot, User, Loader, Lightbulb, Cpu, Paperclip, X, FileText, CheckCircle, FileCheck } from "lucide-react";
import { api } from "../api";
import { runLocalAiQuery } from "../localAi";
import { PageHeader } from "../components/ui/PageHeader";
import { Badge } from "../components/ui/Badge";

const suggestions = [
  "Explain my uploaded medical report details",
  "What are the abnormal test values in my report?",
  "Is my fasting glucose or cholesterol elevated?",
  "Summarize key diagnosis and doctor recommendations",
  "Explain HbA1c and diabetes risk level",
  "What critical alerts are in my clinical file?",
];

interface Message { role: "user" | "ai"; text: string; ts: string; reportInfo?: { filename: string; summary?: string } }

export default function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Hello! I am your Clinical AI Assistant. You can ask health questions or attach a medical report (PDF, DOCX, TXT) to get instant report summaries and detailed clinical extractions. How can I assist you today?",
      ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [localMode, setLocalMode] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedReportAnalysis, setAttachedReportAnalysis] = useState<any>(null);
  const [uploadingReport, setUploadingReport] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleFileUpload = async (file: File) => {
    setAttachedFile(file);
    setUploadingReport(true);
    try {
      const res = await api.uploadReport(file);
      setAttachedReportAnalysis(res.analysis || res);
      
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const summaryText = res.analysis?.summary 
        ? `📄 **Report Ingested: ${file.name}**\n\n**Executive Summary:**\n${res.analysis.summary}\n\nAsk me any questions regarding test values, diagnosis, or recommendations!`
        : `📄 **Report Ingested: ${file.name}**\n\nMedical document uploaded successfully. Ask me any details or summaries regarding this report!`;

      setMessages(prev => [
        ...prev,
        { role: "user", text: `Uploaded clinical report: ${file.name}`, ts: timeStr, reportInfo: { filename: file.name } },
        { role: "ai", text: summaryText, ts: timeStr, reportInfo: { filename: file.name, summary: res.analysis?.summary } }
      ]);
    } catch (e: any) {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [
        ...prev,
        { role: "ai", text: `⚠️ Failed to parse uploaded document "${file.name}": ${e.message || "File error"}. You can still ask general health questions.`, ts: timeStr }
      ]);
    } finally {
      setUploadingReport(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { role: "user", text, ts: timeStr };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const reportContextText = attachedReportAnalysis?.summary 
      ? `Report Summary (${attachedFile?.name}): ${attachedReportAnalysis.summary}. ${JSON.stringify(attachedReportAnalysis.test_metrics || [])}`
      : undefined;

    try {
      if (localMode) {
        const res = await runLocalAiQuery(text);
        setMessages(prev => [...prev, { role: "ai", text: res.answer, ts: timeStr }]);
      } else {
        const res = await api.sendChat(text, reportContextText);
        setMessages(prev => [...prev, { role: "ai", text: res.reply || res.answer, ts: timeStr }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "I encountered a connection issue with the clinical LLM server. Please ensure the backend API is active or toggle Local On-Device AI mode.", ts: timeStr }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <PageHeader
          title="Clinical AI Assistant Workspace"
          subtitle="Upload medical reports or ask health questions with RAG-augmented clinical LLM"
          icon={MessageSquare}
        />
        <button
          onClick={() => setLocalMode(!localMode)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
            localMode 
              ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs" 
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Cpu size={14} className={localMode ? "text-emerald-600 animate-pulse" : "text-slate-500"} />
          <span>{localMode ? "Local Private AI Active" : "Enable On-Device AI Mode"}</span>
        </button>
      </div>

      {/* Suggested Prompts */}
      {messages.length <= 1 && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Lightbulb size={13} className="text-amber-500" />
            <span>Suggested Clinical Prompts</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map(s => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-xs font-medium px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-full hover:border-blue-400 hover:bg-blue-50/60 hover:text-blue-700 transition-all shadow-2xs"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
      />

      {/* Chat Messages Viewport */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl p-5 overflow-y-auto space-y-4 shadow-xs min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "ai" && (
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-200">
                <Bot size={16} />
              </div>
            )}
            <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
              msg.role === "user"
                ? "bg-blue-600 text-white rounded-tr-xs font-medium shadow-xs"
                : "bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs font-medium"
            }`}>
              <div className="whitespace-pre-line">{msg.text}</div>
              <div className={`text-[10px] mt-1.5 font-semibold text-right ${msg.role === "user" ? "text-blue-200" : "text-slate-400"}`}>
                {msg.ts}
              </div>
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-300">
                <User size={16} />
              </div>
            )}
          </div>
        ))}

        {uploadingReport && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 border border-blue-200">
              <Bot size={16} />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 flex items-center gap-2">
              <Loader size={14} className="text-blue-600 animate-spin" />
              <span className="text-xs text-slate-600 font-semibold">Extracting report details & generating AI summary...</span>
            </div>
          </div>
        )}

        {loading && !uploadingReport && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 border border-blue-200">
              <Bot size={16} />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 flex items-center gap-2">
              <Loader size={14} className="text-blue-600 animate-spin" />
              <span className="text-xs text-slate-500 font-medium">Synthesizing clinical response...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Attached File Preview Bar */}
      {attachedFile && (
        <div className="mt-2.5 flex items-center justify-between px-3.5 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs">
          <div className="flex items-center gap-2 text-blue-900 font-semibold truncate">
            <FileCheck size={16} className="text-blue-600 flex-shrink-0" />
            <span className="truncate">Attached Report: <strong>{attachedFile.name}</strong></span>
            {attachedReportAnalysis && <Badge variant="success" size="sm">Report Parsed</Badge>}
          </div>
          <button
            onClick={() => { setAttachedFile(null); setAttachedReportAnalysis(null); }}
            className="text-blue-700 hover:text-red-600 transition-colors p-1"
            title="Remove Attached Report"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Message Input Controls */}
      <div className="mt-2.5 flex gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading || uploadingReport}
          className="px-3.5 bg-white border border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-700 rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 text-xs font-semibold"
          title="Upload Medical Report (PDF, DOCX, TXT)"
        >
          <Paperclip size={16} className="text-slate-500" />
          <span className="hidden sm:inline">Attach Report</span>
        </button>

        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
          placeholder={attachedFile ? `Ask details about ${attachedFile.name}...` : "Ask a question or attach a medical report..."}
          className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 font-medium transition-all shadow-2xs"
          disabled={loading || uploadingReport}
        />

        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading || uploadingReport}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl font-semibold transition-all shadow-xs flex items-center justify-center"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
