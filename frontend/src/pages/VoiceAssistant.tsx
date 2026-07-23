import { useState, useRef } from "react";
import { api } from "../api";
import { Mic, MicOff, Volume2, Globe, Loader, Languages, Send } from "lucide-react";

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
      const response = res.response || "I'm here to help with your health questions.";
      setMessages(prev => [...prev, { role: "assistant", text: response, lang }]);
      speak(response, lang);
    } catch { setMessages(prev => [...prev, { role: "assistant", text: "Sorry, I could not process your query. Please try again.", lang }]); }
    finally { setLoading(false); }
  };

  const selectedLang = LANGUAGES.find(l => l.code === lang)!;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center">
          <Languages size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Multilingual Voice Health Assistant</h1>
          <p className="text-sm text-gray-500">Multilingual health assistant supporting 8 regional languages with offline capability</p>
        </div>
      </div>

      {}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <p className="text-xs text-gray-500 mb-3">Choose Your Language</p>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => setLang(l.code)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                lang === l.code
                  ? "bg-violet-600 border-violet-500 text-white"
                  : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white"
              }`}>
              <span>{l.flag}</span>
              <span>{l.name}</span>
              <span className="text-xs opacity-60">{l.script}</span>
            </button>
          ))}
        </div>
      </div>

      {}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col h-[420px]">
        <div className="p-3 border-b border-gray-800 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-gray-400">AI Health Assistant — {selectedLang.flag} {selectedLang.name}</span>
          {speaking && <span className="ml-auto text-xs text-violet-400 flex items-center gap-1"><Volume2 size={11} /> Speaking...</span>}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Globe size={32} className="text-gray-700 mx-auto mb-2" />
              <p className="text-gray-600 text-sm mb-4">Ask any health question in your language</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {(SAMPLE_QUESTIONS[lang] || SAMPLE_QUESTIONS.en).map((q, i) => (
                  <button key={i} onClick={() => handleSend(q)}
                    className="text-xs px-3 py-1.5 bg-gray-800 border border-gray-700 hover:border-violet-500/50 text-gray-400 hover:text-white rounded-xl transition-all">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                m.role === "user"
                  ? "bg-violet-600 text-white rounded-tr-sm"
                  : "bg-gray-800 text-gray-200 rounded-tl-sm"
              }`}>
                {m.role === "assistant" && (
                  <button onClick={() => speak(m.text, lang)}
                    className="float-right ml-2 mt-0.5 text-gray-500 hover:text-violet-400 transition-colors">
                    <Volume2 size={12} />
                  </button>
                )}
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 px-4 py-2.5 rounded-2xl rounded-tl-sm flex items-center gap-2">
                <Loader size={12} className="animate-spin text-violet-400" />
                <span className="text-xs text-gray-400">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        {}
        <div className="p-3 border-t border-gray-800 flex gap-2">
          <button onClick={recording ? stopRecording : startRecording}
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
              recording ? "bg-red-600 animate-pulse" : "bg-gray-800 hover:bg-gray-700"
            }`}>
            {recording ? <MicOff size={16} className="text-white" /> : <Mic size={16} className="text-gray-400" />}
          </button>
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder={`Type or speak in ${selectedLang.name}...`}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500" />
          <button onClick={() => handleSend()} disabled={!query.trim() || loading}
            className="w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 flex items-center justify-center flex-shrink-0 transition-all">
            <Send size={14} className="text-white" />
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-gray-600">
        🎙️ Uses browser's built-in Speech Recognition (works offline in Chrome/Edge) · 🌐 AI responses via Groq LLM · 🚑 Emergency: 108
      </div>
    </div>
  );
}
