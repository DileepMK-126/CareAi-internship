import { useState, useRef } from "react";
import { api } from "../api";
import { Mic, MicOff, Volume2, Globe, Loader, Languages, Send } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Badge } from "../components/ui/Badge";

const LANGUAGES = [
  { code: "en", name: "English",   flag: "🇬🇧", script: "Hello" },
  { code: "hi", name: "Hindi",     flag: "🇮🇳", script: "नमस्ते" },
  { code: "mr", name: "Marathi",   flag: "🇮🇳", script: "नमस्कार" },
  { code: "ta", name: "Tamil",     flag: "🇮🇳", script: "வணக்கம்" },
  { code: "te", name: "Telugu",    flag: "🇮🇳", script: "నమస్కారం" },
  { code: "kn", name: "Kannada",   flag: "🇮🇳", script: "ನಮಸ್ಕಾರ" },
  { code: "ml", name: "Malayalam", flag: "🇮🇳", script: "നമസ്കാരം" },
  { code: "bn", name: "Bengali",   flag: "🇮🇳", script: "নমস্কার" },
];

const SAMPLE_QUESTIONS: Record<string, string[]> = {
  en: ["What foods help control diabetes?", "How can I lower my blood pressure naturally?", "When should I call emergency 108?"],
  hi: ["मधुमेह में क्या खाएं?", "रक्तचाप कम कैसे करें?", "108 कब बुलाएं?"],
  ta: ["நீரிழிவுக்கு என்ன சாப்பிட வேண்டும்?", "ரத்த அழுத்தம் குறைக்க என்ன செய்வது?"],
  te: ["మధుమేహానికి ఏమి తినాలి?", "రక్తపోటు ఎలా తగ్గించాలి?"],
};

interface Message { role: "user" | "assistant"; text: string; lang: string; }

export default function VoiceAssistant() {
  const [lang, setLang] = useState("en");
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Speech recognition not supported. Use Chrome or Edge."); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = LANGUAGES.find(l => l.code === lang)?.code + "-IN" || "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setQuery(transcript);
      recognition.stop();
      setRecording(false);
    };
    recognition.onerror = () => { setRecording(false); };
    recognition.onend = () => setRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
    setRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setRecording(false);
  };

  const speak = (text: string, langCode: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = langCode + "-IN";
    utter.rate = 0.9;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  const handleSend = async (q?: string) => {
    const text = q || query;
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: "user", text, lang }]);
    setQuery(""); setLoading(true);
    try {
      const res = await api.voiceRespond(text, lang);
      const response = res.response || "I am here to assist with your clinical questions.";
      setMessages(prev => [...prev, { role: "assistant", text: response, lang }]);
      speak(response, lang);
    } catch { setMessages(prev => [...prev, { role: "assistant", text: "Sorry, I could not process your query. Please try again.", lang }]); }
    finally { setLoading(false); }
  };

  const selectedLang = LANGUAGES.find(l => l.code === lang)!;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Multilingual Voice Health Assistant"
        subtitle="Voice-activated clinical AI support supporting 8 regional Indian languages"
        icon={Languages}
      />

      {/* Language Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">Select Primary Language</p>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
                lang === l.code
                  ? "bg-blue-600 border-blue-700 text-white shadow-2xs"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.name}</span>
              <span className="text-[11px] opacity-70 font-normal">({l.script})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Voice Chat Window */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col h-[440px]">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800">Voice AI Session — {selectedLang.flag} {selectedLang.name}</span>
          </div>
          {speaking && (
            <Badge variant="info" size="sm" dot>Synthesizing Voice Output...</Badge>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
          {messages.length === 0 && (
            <div className="text-center py-10">
              <Globe size={36} className="text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600 mb-3">Ask any health question via voice or text input</p>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
                {(SAMPLE_QUESTIONS[lang] || SAMPLE_QUESTIONS.en).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="text-xs font-medium px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-full hover:border-blue-300 hover:bg-blue-50 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs font-medium ${
                m.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-xs shadow-2xs"
                  : "bg-slate-50 border border-slate-200 text-slate-900 rounded-tl-xs"
              }`}>
                {m.role === "assistant" && (
                  <button
                    onClick={() => speak(m.text, lang)}
                    className="float-right ml-2 mt-0.5 text-slate-400 hover:text-blue-600 transition-colors p-0.5"
                    title="Replay Audio"
                  >
                    <Volume2 size={13} />
                  </button>
                )}
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl rounded-tl-xs flex items-center gap-2">
                <Loader size={13} className="animate-spin text-blue-600" />
                <span className="text-xs text-slate-500 font-medium">Synthesizing response...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex gap-2">
          <button
            onClick={recording ? stopRecording : startRecording}
            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
              recording
                ? "bg-red-600 text-white animate-pulse shadow-xs"
                : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-100"
            }`}
            title={recording ? "Stop Recording" : "Start Voice Input"}
          >
            {recording ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder={`Type or speak query in ${selectedLang.name}...`}
            className="flex-1 bg-white border border-slate-300 rounded-lg px-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 font-medium transition-all"
          />
          <button
            onClick={() => handleSend()}
            disabled={!query.trim() || loading}
            className="w-10 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center flex-shrink-0 transition-all shadow-xs"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
