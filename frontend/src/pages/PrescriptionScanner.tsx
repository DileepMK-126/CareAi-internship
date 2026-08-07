import { useState, useEffect } from "react";
import { Pill, Upload, Loader, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { api } from "../api";
import { PageHeader } from "../components/ui/PageHeader";
import { Badge } from "../components/ui/Badge";
import { AlertBanner } from "../components/ui/AlertBanner";

export default function PrescriptionScanner() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { api.getPrescriptions().then(setPrescriptions).catch(() => {}); }, []);

  const handleUpload = async (file: File) => {
    setUploading(true); setError(""); setResult(null);
    try {
      const res = await api.uploadPrescription(file);
      setResult(res);
      const presc = await api.getPrescriptions();
      setPrescriptions(presc);
    } catch (e: any) {
      setError(e.message || "Failed to process prescription image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Prescription OCR & Medication Scanner"
        subtitle="Extract medication names, dosages, frequencies, and administration schedules from prescription scans"
        icon={Pill}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Drop Zone */}
        <div
          className="bg-white border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-10 text-center cursor-pointer transition-all hover:bg-slate-50/80 shadow-xs flex flex-col items-center justify-center min-h-[260px]"
          onClick={() => document.getElementById("presc-input")?.click()}
        >
          <input
            id="presc-input"
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader size={36} className="text-blue-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-800">Processing OCR Extraction...</p>
              <p className="text-xs text-slate-500">Scanning prescription handwriting and pharmacological terms</p>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3">
                <Pill size={24} className="text-emerald-600" />
              </div>
              <p className="text-sm font-bold text-slate-900 mb-1">Upload Prescription Image or PDF</p>
              <p className="text-xs text-slate-500 mb-3">Supports JPG, PNG, and PDF prescription documents</p>
              <Badge variant="neutral" size="sm">OCR Enabled</Badge>
            </>
          )}
        </div>

        {/* Extracted Medications Display */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h2 className="font-bold text-slate-900 text-sm">Extracted Medication Table</h2>
            {result && <Badge variant="success" size="sm">Extracted</Badge>}
          </div>

          {error && <AlertBanner variant="error" message={error} dismissible />}

          {result ? (
            <div className="space-y-3 flex-1 overflow-y-auto">
              <div className="text-xs text-slate-500 font-medium">Source Document: <span className="font-bold text-slate-800">{result.filename}</span></div>
              {result.medications?.map((med: any, i: number) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Pill size={15} className="text-emerald-600" />
                      <span className="font-bold text-slate-900 text-xs">{med.name}</span>
                    </div>
                    <Badge variant="info" size="sm">{med.dosage}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/60">
                    <div><span className="text-slate-500">Frequency:</span> <span className="font-medium text-slate-800">{med.frequency}</span></div>
                    <div><span className="text-slate-500">Duration:</span> <span className="font-medium text-slate-800">{med.duration}</span></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
              <Pill size={32} className="text-slate-300 mb-2" />
              <p className="text-xs font-medium text-slate-500">Upload a prescription to parse medication schedules</p>
            </div>
          )}
        </div>
      </div>

      {/* Prescription History */}
      {prescriptions.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h2 className="font-bold text-slate-900 text-sm mb-4">Prescription Vault ({prescriptions.length})</h2>
          <div className="space-y-3">
            {[...prescriptions].reverse().map((p: any) => (
              <div key={p.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Pill size={15} className="text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900">{p.filename}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                    <Clock size={12} /> {p.date}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {p.medications?.map((med: any, i: number) => (
                    <div key={i} className="text-xs bg-white border border-slate-200 rounded-md p-2.5 shadow-2xs">
                      <div className="font-bold text-slate-900">{med.name}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">{med.dosage} · {med.frequency}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
