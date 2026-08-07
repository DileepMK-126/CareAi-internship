import { useState } from "react";
import { Pill, AlertTriangle, Search, Apple, Loader2 } from "lucide-react";
import { api } from "../api";
import { PageHeader } from "../components/ui/PageHeader";
import { Badge } from "../components/ui/Badge";
import { AlertBanner } from "../components/ui/AlertBanner";

function ResultCard({ result }: { result: string }) {
  const lines = result.split("\n");
  return (
    <div className="mt-6 bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-1.5 shadow-xs">
      <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-200">
        <Pill size={16} className="text-blue-600" />
        <h3 className="font-bold text-slate-900 text-sm">Pharmacological Interaction Analysis Report</h3>
      </div>
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1.5" />;
        const isBold = line.startsWith("**") && line.endsWith("**");
        const isHeader = /^\d+\./.test(line.trim()) || line.endsWith(":");
        return (
          <p
            key={i}
            className={`text-xs leading-relaxed ${
              isBold
                ? "font-bold text-blue-700 text-sm"
                : isHeader
                ? "text-slate-900 font-bold mt-3 text-xs uppercase tracking-wider"
                : "text-slate-800 font-medium"
            }`}
          >
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
    } catch (e: any) { setError(e.message || "Drug interaction check failed"); }
    finally { setLoading(false); }
  };

  const checkFood = async () => {
    if (!medForFood.trim() || !foods.trim()) return;
    setLoading(true); setResult(""); setError("");
    try {
      const data = await api.checkFoodDrugInteractions(medForFood, foods);
      setResult(data.result);
    } catch (e: any) { setError(e.message || "Food-drug interaction check failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Pharmacological Drug & Food Interaction Analyzer"
        subtitle="Evaluate contraindications, synergistic risks, and dietary precautions using clinical databases"
        icon={Pill}
      />

      <AlertBanner
        variant="warning"
        title="Clinical Information Disclaimer"
        message="This tool provides decision-support information based on pharmacological databases. Always verify medication combinations with a licensed pharmacist or prescribing physician."
      />

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit gap-1 border border-slate-200">
        {(["drug", "food"] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setResult(""); setError(""); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              tab === t
                ? "bg-blue-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t === "drug" ? "💊 Drug-Drug Interactions" : "🍎 Food-Drug Interactions"}
          </button>
        ))}
      </div>

      {/* Drug-Drug Tab */}
      {tab === "drug" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Pill size={16} className="text-blue-600" />
              Drug-Drug Interaction Analysis
            </h2>
            <Badge variant="info" size="sm">Pharmacology LLM</Badge>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Enter Active Medications (comma-separated)
            </label>
            <textarea
              value={meds}
              onChange={e => setMeds(e.target.value)}
              placeholder="e.g. Warfarin 5mg, Aspirin 81mg, Metformin 500mg, Lisinopril 10mg..."
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 resize-none h-24 transition-all"
            />
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Sample Clinical Combinations:</span>
            <div className="flex flex-wrap gap-2">
              {["Warfarin, Aspirin", "Metformin, Alcohol", "Lisinopril, Potassium", "Sertraline, Tramadol"].map(ex => (
                <button
                  key={ex}
                  onClick={() => setMeds(ex)}
                  className="text-xs bg-slate-50 border border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 px-3 py-1 rounded-full font-semibold transition-all shadow-2xs"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={checkDrug}
            disabled={loading || !meds.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold text-xs transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-xs"
          >
            {loading ? <><Loader2 size={15} className="animate-spin" /> Evaluating Drug Interactions...</> : <><Search size={15} /> Check Drug Interactions</>}
          </button>
        </div>
      )}

      {/* Food-Drug Tab */}
      {tab === "food" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Apple size={16} className="text-emerald-600" />
              Food & Dietary Supplement Interaction Analysis
            </h2>
            <Badge variant="success" size="sm">Nutrition Safety</Badge>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Medication Name</label>
              <input
                value={medForFood}
                onChange={e => setMedForFood(e.target.value)}
                placeholder="e.g. Warfarin, Simvastatin, Levothyroxine..."
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Foods / Dietary Supplements</label>
              <input
                value={foods}
                onChange={e => setFoods(e.target.value)}
                placeholder="e.g. Grapefruit juice, Spinach (Vitamin K), Green tea, Dairy..."
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>
          </div>

          <button
            onClick={checkFood}
            disabled={loading || !medForFood.trim() || !foods.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold text-xs transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-xs"
          >
            {loading ? <><Loader2 size={15} className="animate-spin" /> Evaluating Food Interactions...</> : <><Search size={15} /> Check Food Interactions</>}
          </button>
        </div>
      )}

      {error && <AlertBanner variant="error" message={error} dismissible />}
      {result && <ResultCard result={result} />}
    </div>
  );
}
