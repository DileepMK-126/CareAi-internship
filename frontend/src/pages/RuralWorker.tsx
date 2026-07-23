import { useState } from "react";
import { api } from "../api";
import { MapPin, Loader, AlertTriangle, Phone, ClipboardList, Plus } from "lucide-react";

const URGENCY_STYLES: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  RED:    { bg: "bg-red-950/60",    border: "border-red-500/60",    text: "text-red-300",    badge: "bg-red-600" },
  ORANGE: { bg: "bg-orange-950/40", border: "border-orange-500/40", text: "text-orange-300", badge: "bg-orange-600" },
  YELLOW: { bg: "bg-yellow-950/30", border: "border-yellow-500/30", text: "text-yellow-300", badge: "bg-yellow-600" },
  GREEN:  { bg: "bg-green-950/20",  border: "border-green-500/30",  text: "text-green-300",  badge: "bg-green-600" },
};

const LANGS = [
  { code: "hi", name: "हिंदी" }, { code: "en", name: "English" },
  { code: "mr", name: "मराठी" }, { code: "ta", name: "தமிழ்" },
  { code: "te", name: "తెలుగు"}, { code: "bn", name: "বাংলা" },
];

const QUICK_SYMPTOMS = [
  "High fever", "Chest pain", "Difficulty breathing", "Vomiting",
  "Diarrhea", "Seizure", "Unconscious", "Heavy bleeding",
  "Child not eating", "Severe headache", "Jaundice", "Rash",
];

export default function RuralWorker() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [lang, setLang] = useState("hi");
  const [symptoms, setSymptoms] = useState("");
  const [village, setVillage] = useState("");
  const [workerName, setWorkerName] = useState("");
  const [history, setHistory] = useState<any[]>([]);

  const handleTriage = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    try {
      const res = await api.ruralTriage({ symptoms_text: symptoms, language: lang, village, worker_name: workerName });
      setResult(res);
      setHistory(prev => [res, ...prev.slice(0, 9)]);
    } catch { setResult(null); }
    finally { setLoading(false); }
  };

  const addSymptom = (s: string) => {
    setSymptoms(prev => prev ? `${prev}, ${s}` : s);
  };

  const style = result ? (URGENCY_STYLES[result.urgency] || URGENCY_STYLES.GREEN) : null;

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4">
      {}
      <div className={`rounded-2xl p-4 border ${result ? style!.bg + " " + style!.border : "bg-gray-900 border-gray-800"}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center">
              <MapPin size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">ASHA / Rural Health Worker</h1>
              <p className="text-xs text-gray-400">Community healthcare decision support and clinical triage for health workers</p>
            </div>
          </div>
          {result && (
            <div className={`text-center px-4 py-2 rounded-xl ${style!.badge}`}>
              <div className="text-white font-black text-lg">{result.urgency}</div>
              <div className="text-white/80 text-xs">{result.urgency_label}</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input type="text" placeholder="Worker Name (ASHA/ANM)"
            className="bg-gray-800/80 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
            value={workerName} onChange={e => setWorkerName(e.target.value)} />
          <input type="text" placeholder="Village / Area Name"
            className="bg-gray-800/80 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
            value={village} onChange={e => setVillage(e.target.value)} />
          <div className="flex gap-1">
            {LANGS.map(l => (
              <button key={l.code} onClick={() => setLang(l.code)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${lang === l.code ? "bg-orange-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
                {l.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <label className="text-xs text-gray-500 mb-2 block">Quick Symptom Selection</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {QUICK_SYMPTOMS.map(s => (
                <button key={s} onClick={() => addSymptom(s)}
                  className="px-2.5 py-1.5 bg-gray-800 hover:bg-orange-600/20 border border-gray-700 hover:border-orange-500/40 text-xs text-gray-400 hover:text-white rounded-lg transition-all flex items-center gap-1">
                  <Plus size={10} /> {s}
                </button>
              ))}
            </div>
            <label className="text-xs text-gray-500 mb-1 block">Or describe symptoms (any language)</label>
            <textarea rows={4} value={symptoms} onChange={e => setSymptoms(e.target.value)}
              placeholder="Describe patient symptoms in Hindi, English or regional language... e.g. तेज बुखार, खांसी, सांस लेने में तकलीफ"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 resize-none" />
            <button onClick={handleTriage} disabled={loading || !symptoms.trim()}
              className="w-full mt-3 py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all">
              {loading ? <><Loader size={16} className="animate-spin" /> Checking...</> : "🔍 CHECK NOW"}
            </button>
          </div>

          {}
          {result?.ai_guidance && (
            <div className={`rounded-2xl p-4 border ${style!.bg} ${style!.border}`}>
              <h3 className={`text-sm font-bold mb-2 ${style!.text}`}>📋 AI Guidance</h3>
              <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">{result.ai_guidance}</p>
              {result.refer_to_hospital && (
                <div className="mt-3 p-3 bg-red-600/20 border border-red-500/30 rounded-xl">
                  <p className="text-red-400 font-bold text-sm">⚠️ REFER TO HOSPITAL: {result.action}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {}
        <div className="space-y-3">
          {}
          <div className="bg-gray-900 border border-red-500/20 rounded-2xl p-4">
            <h3 className="text-red-400 text-sm font-bold mb-3 flex items-center gap-2"><Phone size={14} /> Emergency Numbers</h3>
            {[
              { label: "Ambulance", num: "108", color: "text-red-400" },
              { label: "Women Helpline", num: "1091", color: "text-pink-400" },
              { label: "Child Helpline", num: "1098", color: "text-blue-400" },
              { label: "NIMHANS Crisis", num: "080-46110007", color: "text-purple-400" },
            ].map(({ label, num, color }) => (
              <a key={num} href={`tel:${num}`}
                className="flex items-center justify-between p-2.5 bg-gray-800 hover:bg-gray-750 rounded-xl border border-gray-700 mb-1.5 transition-all">
                <span className="text-xs text-gray-400">{label}</span>
                <span className={`font-bold text-sm ${color}`}>{num}</span>
              </a>
            ))}
          </div>

          {}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <h3 className="text-gray-400 text-xs font-semibold mb-3 flex items-center gap-1"><ClipboardList size={12} /> Today's Triages ({history.length})</h3>
            {history.length === 0
              ? <p className="text-xs text-gray-600 text-center py-2">No triages yet</p>
              : history.slice(0, 5).map((h, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-800/60 rounded-lg mb-1.5">
                    <span className="text-xs text-gray-400 truncate flex-1">{h.village || "—"} · {h.timestamp?.slice(11, 16)}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ml-2 ${URGENCY_STYLES[h.urgency]?.badge} text-white`}>{h.urgency}</span>
                  </div>
                ))
            }
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <h3 className="text-gray-400 text-xs font-semibold mb-2">🚦 Triage Color Guide</h3>
            {[
              { color: "bg-red-600",    label: "RED — EMERGENCY: Call 108 NOW" },
              { color: "bg-orange-600", label: "ORANGE — Refer to PHC/CHC today" },
              { color: "bg-yellow-600", label: "YELLOW — Home care, monitor" },
              { color: "bg-green-600",  label: "GREEN — Mild, basic care" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2 mb-1.5">
                <div className={`w-3 h-3 rounded-full ${color} flex-shrink-0`} />
                <span className="text-xs text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
