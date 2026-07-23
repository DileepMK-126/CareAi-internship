import { useState, useEffect, useCallback } from "react";
import { ScanLine, Upload, Loader, AlertCircle, ChevronDown } from "lucide-react";
import { api } from "../api";

const MODALITIES = [
  { key: "xray", label: "Chest X-Ray", desc: "Pneumonia, Pleural Effusion" },
  { key: "mri", label: "Brain MRI", desc: "Glioma, Meningioma" },
  { key: "lesions", label: "Skin Lesion", desc: "Melanoma, BCC" },
];

function HeatmapGrid({ grid }: { grid: number[][] }) {
  if (!grid?.length) return null;
  return (
    <div className="inline-block">
      {grid.map((row, r) => (
        <div key={r} className="flex">
          {row.map((val, c) => (
            <div
              key={c}
              className="w-7 h-7 border border-gray-900/50"
              style={{ backgroundColor: `rgba(239,68,68,${val.toFixed(2)})` }}
              title={`${(val * 100).toFixed(0)}%`}
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
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [modality]);

  const confColor = result ? (result.confidence_score > 0.88 ? "text-green-400" : result.confidence_score > 0.80 ? "text-amber-400" : "text-red-400") : "";

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Medical Imaging AI</h1>
        <p className="text-gray-500 text-sm mt-0.5">Upload X-Ray, MRI, or Skin images for AI-powered diagnostic classification</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {}
        <div className="space-y-4">
          {}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 font-medium mb-3">Select Imaging Modality</p>
            <div className="grid grid-cols-3 gap-2">
              {MODALITIES.map(m => (
                <button
                  key={m.key}
                  onClick={() => setModality(m.key)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    modality === m.key ? "border-blue-500 bg-blue-600/10" : "border-gray-700 hover:border-gray-600"
                  }`}
                >
                  <p className={`text-xs font-semibold ${modality === m.key ? "text-blue-400" : "text-gray-300"}`}>{m.label}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
              dragging ? "border-blue-500 bg-blue-500/5" : "border-gray-700 hover:border-gray-600 bg-gray-900"
            }`}
            onClick={() => document.getElementById("img-input")?.click()}
          >
            <input id="img-input" type="file" className="hidden" accept="image/*"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader size={32} className="text-blue-400 animate-spin" />
                <p className="text-gray-300 text-sm">Analyzing medical image...</p>
              </div>
            ) : (
              <>
                <ScanLine size={36} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-300 text-sm font-medium mb-1">Upload {MODALITIES.find(m => m.key === modality)?.label}</p>
                <p className="text-xs text-gray-600">JPG, PNG — Drag & drop or click to browse</p>
              </>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertCircle size={13} /> {error}
            </div>
          )}
        </div>

        {}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="font-semibold text-white text-sm mb-4">Diagnostic Result</h2>
          {result ? (
            <div className="space-y-4">
              <div className={`text-xl font-bold ${confColor}`}>{result.prediction}</div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${result.confidence_score > 0.88 ? "bg-green-500" : result.confidence_score > 0.80 ? "bg-amber-500" : "bg-red-500"}`}
                    style={{ width: `${result.confidence_score * 100}%` }}
                  />
                </div>
                <span className={`text-sm font-bold ${confColor}`}>{(result.confidence_score * 100).toFixed(1)}%</span>
              </div>
              <div className="text-xs text-gray-500">Confidence Score</div>

              <div>
                <p className="text-xs text-gray-500 font-medium mb-2">Explainable AI Heatmap (XAI)</p>
                <div className="bg-gray-800 rounded-lg p-3 inline-block">
                  <HeatmapGrid grid={result.xai_heatmap_grid} />
                </div>
                <p className="text-xs text-gray-600 mt-1">Red regions indicate higher AI attention zones</p>
              </div>

              <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-400 mb-1">Clinical Guidance</p>
                <p className="text-xs text-gray-300 leading-relaxed">{result.clinical_guidelines}</p>
              </div>

              <div className="bg-amber-900/10 border border-amber-500/20 rounded-lg p-3">
                <p className="text-xs text-amber-400">⚠️ This AI analysis is for informational purposes only and does not replace clinical diagnosis by a licensed radiologist or physician.</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <ScanLine size={36} className="text-gray-700 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Upload an image to see AI diagnostic results</p>
            </div>
          )}
        </div>
      </div>

      {}
      {history.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="font-semibold text-white text-sm mb-4">Imaging History ({history.length})</h2>
          <div className="space-y-2">
            {[...history].reverse().map((img: any) => (
              <div key={img.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                <ScanLine size={16} className="text-purple-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{img.filename}</p>
                  <p className="text-xs text-gray-500">{img.modality?.toUpperCase()} · {img.date}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-white truncate max-w-40">{img.prediction}</p>
                  <p className="text-xs text-gray-500">{(img.confidence_score * 100).toFixed(1)}% confidence</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
