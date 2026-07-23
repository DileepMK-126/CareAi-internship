import { useState } from "react";
import { Pill, AlertTriangle, Search, Apple, Loader2, ChevronDown, ChevronUp } from "lucide-react";

import { api } from "../api";

function ResultCard({ result }: { result: string }) {
  const lines = result.split("\n");
  return (
    <div className="mt-6 bg-gray-800/60 rounded-2xl border border-gray-700 p-5 space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;
        const isBold = line.startsWith("**") && line.endsWith("**");
        const isHeader = /^\d+\./.test(line.trim()) || line.endsWith(":");
        return (
          <p key={i} className={`text-sm leading-relaxed ${isBold ? "font-bold text-blue-300" : isHeader ? "text-cyan-300 font-semibold mt-3" : "text-gray-300"}`}>
            {line.replace(/\*\*/g, "")}
          </p>
        );
      })}
    </div>
  );
}

export default function DrugInteractions() {
  const [tab, setTab] = useState<"drug" | "food">("drug");
  const [meds, setMeds] = useState("");
  const [medForFood, setMedForFood] = useState("");
  const [foods, setFoods] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const checkDrug = async () => {
    if (!meds.trim()) return;
    setLoading(true); setResult(""); setError("");
    try {
      const data = await api.checkDrugInteractions(meds);
      setResult(data.result);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const checkFood = async () => {
    if (!medForFood.trim() || !foods.trim()) return;
    setLoading(true); setResult(""); setError("");
    try {
      const data = await api.checkFoodDrugInteractions(medForFood, foods);
      setResult(data.result);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <Pill size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Drug & Food Interaction Checker</h1>
            <p className="text-gray-400 text-sm">AI-powered drug safety analysis powered by Llama-3</p>
          </div>
        </div>

        <div className="mt-4 bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 flex gap-2">
          <AlertTriangle size={16} className="text-orange-400 flex-shrink-0 mt-0.5" />
          <p className="text-orange-300 text-xs">This tool is for informational purposes only. Always consult a pharmacist or physician before making medication decisions.</p>
        </div>
      </div>

      {}
      <div className="flex bg-gray-800 rounded-xl p-1 mb-6 w-fit gap-1">
        {(["drug", "food"] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); setResult(""); setError(""); }}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-blue-600 text-white shadow" : "text-gray-400 hover:text-white"}`}>
            {t === "drug" ? "💊 Drug-Drug" : "🍎 Food-Drug"}
          </button>
        ))}
      </div>

      {}
      {tab === "drug" && (
        <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Pill size={18} className="text-orange-400" /> Drug-Drug Interaction Analysis</h2>
          <label className="block text-sm text-gray-400 mb-2">Enter medications (comma-separated)</label>
          <textarea
            value={meds} onChange={e => setMeds(e.target.value)}
            placeholder="e.g., Warfarin, Aspirin, Metformin, Lisinopril"
            className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white text-sm resize-none h-24 focus:outline-none focus:border-blue-500 placeholder-gray-500"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {["Warfarin, Aspirin", "Metformin, Alcohol", "Lisinopril, Potassium", "Sertraline, Tramadol"].map(ex => (
              <button key={ex} onClick={() => setMeds(ex)} className="text-xs bg-gray-800 border border-gray-600 text-gray-400 hover:text-white hover:border-blue-500 px-3 py-1 rounded-full transition-all">{ex}</button>
            ))}
          </div>
          <button onClick={checkDrug} disabled={loading || !meds.trim()}
            className="mt-4 w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : <><Search size={16} /> Check Interactions</>}
          </button>
        </div>
      )}

      {}
      {tab === "food" && (
        <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Apple size={18} className="text-green-400" /> Food-Drug Interaction Analysis</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Medication</label>
              <input value={medForFood} onChange={e => setMedForFood(e.target.value)} placeholder="e.g., Warfarin"
                className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Foods / Supplements</label>
              <input value={foods} onChange={e => setFoods(e.target.value)} placeholder="e.g., Grapefruit, Green tea, Vitamin K"
                className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500" />
            </div>
          </div>
          <button onClick={checkFood} disabled={loading || !medForFood.trim() || !foods.trim()}
            className="mt-4 w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : <><Search size={16} /> Check Food Interactions</>}
          </button>
        </div>
      )}

      {error && <div className="mt-4 bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">{error}</div>}
      {result && <ResultCard result={result} />}
    </div>
  );
}
