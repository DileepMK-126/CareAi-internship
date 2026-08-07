import { useState, useEffect, useCallback } from "react";
import { ScanLine, Upload, Loader, AlertCircle, Eye, Activity } from "lucide-react";
import { api } from "../api";
import { PageHeader } from "../components/ui/PageHeader";
import { Badge } from "../components/ui/Badge";
import { AlertBanner } from "../components/ui/AlertBanner";

const MODALITIES = [
  { key: "xray", label: "Chest X-Ray", desc: "Pneumonia, Effusion, Infiltrates" },
  { key: "mri", label: "Brain MRI", desc: "Glioma, Meningioma, Stroke" },
  { key: "lesions", label: "Skin Lesion", desc: "Melanoma, Basal Cell" },
];

function HeatmapGrid({ grid }: { grid: number[][] }) {
  if (!grid?.length) return null;
  return (
    <div className="inline-block border border-slate-300 rounded-md overflow-hidden shadow-2xs">
      {grid.map((row, r) => (
        <div key={r} className="flex">
          {row.map((val, c) => (
            <div
              key={c}
              className="w-7 h-7 border border-slate-200/40"
              style={{ backgroundColor: `rgba(220,38,38,${val.toFixed(2)})` }}
              title={`${(val * 100).toFixed(0)}% AI Attention`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function MedicalImaging() {
  const [modality, setModality] = useState("xray");
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { api.getImages().then(setHistory).catch(() => {}); }, []);

  const handleFile = async (file: File) => {
    setUploading(true); setError(""); setResult(null);
    try {
      const res = await api.classifyImage(file, modality);
      setResult(res);
      const imgs = await api.getImages();
      setHistory(imgs);
    } catch (e: any) {
      setError(e.message || "Failed to analyze image file");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [modality]);

  const confBadge = result ? (result.confidence_score > 0.88 ? "success" : result.confidence_score > 0.80 ? "warning" : "danger") : "neutral";

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Medical Imaging AI Diagnostics"
        subtitle="Automated deep learning classification for Radiographic X-Rays, Brain MRIs, and Dermatological Lesions"
        icon={ScanLine}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Options & Upload */}
        <div className="space-y-4">
          {/* Modality Selector */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">Select Modality Protocol</p>
            <div className="grid grid-cols-3 gap-2.5">
              {MODALITIES.map(m => (
                <button
                  key={m.key}
                  onClick={() => setModality(m.key)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    modality === m.key
                      ? "border-blue-600 bg-blue-50/60 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <p className={`text-xs font-bold ${modality === m.key ? "text-blue-700" : "text-slate-800"}`}>{m.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Upload Box */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all bg-white min-h-[220px] flex flex-col items-center justify-center ${
              dragging ? "border-blue-600 bg-blue-50/60 shadow-md" : "border-slate-300 hover:border-blue-500 hover:bg-slate-50/80 shadow-xs"
            }`}
            onClick={() => document.getElementById("img-input")?.click()}
          >
            <input
              id="img-input"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader size={36} className="text-blue-600 animate-spin" />
                <p className="text-sm font-semibold text-slate-800">Processing Neural Feature Mapping...</p>
                <p className="text-xs text-slate-500">Evaluating visual heatmaps and diagnostic patterns</p>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-3">
                  <ScanLine size={22} className="text-purple-600" />
                </div>
                <p className="text-sm font-bold text-slate-900 mb-1">
                  Upload {MODALITIES.find(m => m.key === modality)?.label}
                </p>
                <p className="text-xs text-slate-500">JPG, PNG DICOM exports — Drag & drop or click to browse</p>
              </>
            )}
          </div>

          {error && <AlertBanner variant="error" message={error} dismissible />}
        </div>

        {/* Diagnostic Findings Output */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="font-bold text-slate-900 text-sm">Diagnostic Classification Output</h2>
              {result && <Badge variant={confBadge} size="sm">Analysis Ready</Badge>}
            </div>

            {result ? (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Primary Classification</span>
                  <div className="text-xl font-bold text-slate-900 mt-0.5">{result.prediction}</div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-600">Model Confidence</span>
                    <span className="font-bold text-slate-900">{(result.confidence_score * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${result.confidence_score > 0.88 ? "bg-emerald-500" : result.confidence_score > 0.80 ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${result.confidence_score * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Eye size={14} className="text-slate-500" /> Explainable AI Attention Grid (XAI)
                  </p>
                  <HeatmapGrid grid={result.xai_heatmap_grid} />
                  <p className="text-[11px] text-slate-500 mt-1.5">Darker red zones represent higher neural activation focus</p>
                </div>

                <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs font-bold text-blue-900 mb-1">Clinical Protocol</p>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">{result.clinical_guidelines}</p>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center">
                <ScanLine size={36} className="text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">Select a modality and upload a scan to generate AI diagnostics</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <p className="text-[11px] text-slate-500 leading-normal">
              ⚠️ Diagnostic AI outputs are designed as clinical decision support and require verification by a certified radiologist or physician.
            </p>
          </div>
        </div>
      </div>

      {/* Imaging History */}
      {history.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h2 className="font-bold text-slate-900 text-sm mb-4">Diagnostic Scan Archive ({history.length})</h2>
          <div className="space-y-2">
            {[...history].reverse().map((img: any) => (
              <div key={img.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                    <ScanLine size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{img.filename}</p>
                    <p className="text-[11px] text-slate-500">{img.modality?.toUpperCase()} · {img.date}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-bold text-slate-900 block">{img.prediction}</span>
                  <span className="text-[11px] text-slate-500">{(img.confidence_score * 100).toFixed(1)}% confidence</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
