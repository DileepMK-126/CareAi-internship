import { useState, useCallback, useEffect } from "react";
import { Upload, FileText, Trash2, Download, AlertCircle, CheckCircle, Loader, FileCheck } from "lucide-react";
import { api } from "../api";
import { PageHeader } from "../components/ui/PageHeader";
import { Badge } from "../components/ui/Badge";
import { AlertBanner } from "../components/ui/AlertBanner";

export default function ReportUpload() {
  const [reports, setReports] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const loadReports = async () => {
    try { setReports(await api.getReports()); } catch {}
  };

  useEffect(() => { loadReports(); }, []);

  const handleUpload = async (file: File) => {
    setUploading(true); setError(""); setAnalysis(null);
    try {
      const res = await api.uploadReport(file);
      setAnalysis(res.analysis);
      await loadReports();
    } catch (e: any) {
      setError(e.message || "Failed to analyze document");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, []);

  const handleDelete = async (id: string) => {
    try { await api.deleteReport(id); await loadReports(); } catch {}
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Medical Report Ingestion & AI Analysis"
        subtitle="Upload pathology, lab, radiology reports, or clinical notes for automated extraction"
        icon={FileText}
      />

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer bg-white ${
          dragging ? "border-blue-600 bg-blue-50/60 shadow-md" : "border-slate-300 hover:border-blue-500 hover:bg-slate-50/80 shadow-xs"
        }`}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          className="hidden"
          accept=".pdf,.docx,.txt"
          onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <Loader size={36} className="text-blue-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-800">Processing Document with Medical LLM...</p>
            <p className="text-xs text-slate-500">Extracting clinical metrics, reference ranges, and critical findings</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-3">
              <Upload size={24} className="text-blue-600" />
            </div>
            <p className="text-sm font-bold text-slate-900 mb-1">Drag & drop your clinical report here</p>
            <p className="text-xs text-slate-500 mb-3">or click to browse files from your computer</p>
            <div className="flex items-center gap-2">
              <Badge variant="neutral" size="sm">PDF</Badge>
              <Badge variant="neutral" size="sm">DOCX</Badge>
              <Badge variant="neutral" size="sm">TXT</Badge>
            </div>
          </div>
        )}
      </div>

      {error && <AlertBanner variant="error" title="Ingestion Error" message={error} dismissible />}

      {/* Analysis Output Section */}
      {analysis && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-600" />
              <h2 className="font-bold text-slate-900 text-sm">Diagnostic Extraction Results</h2>
            </div>
            <Badge variant="success" size="md">Analysis Complete</Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Patient Name", value: analysis.patient_name },
              { label: "Age", value: analysis.age || "N/A" },
              { label: "Gender", value: analysis.gender },
              { label: "Report Date", value: analysis.report_date },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{value || "N/A"}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Executive Summary</p>
            <div className="text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-3.5 leading-relaxed font-medium">
              {analysis.summary}
            </div>
          </div>

          {analysis.alerts?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertCircle size={14} className="text-red-600" /> Critical Lab Alerts
              </p>
              <div className="space-y-2">
                {analysis.alerts.map((a: string, i: number) => (
                  <div key={i} className="text-xs text-red-900 bg-red-50 border border-red-200 rounded-lg p-3 font-medium">
                    {a}
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.test_metrics?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Extracted Test Metrics</p>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Test Name</th>
                      <th className="py-2.5 px-3">Measured Value</th>
                      <th className="py-2.5 px-3">Reference Range</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analysis.test_metrics.map((m: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-slate-900">{m.test_name}</td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">{m.value} {m.unit}</td>
                        <td className="py-2.5 px-3 text-slate-500">{m.reference_range}</td>
                        <td className="py-2.5 px-3">
                          <Badge variant={m.is_abnormal ? "danger" : "success"} size="sm">
                            {m.is_abnormal ? "Abnormal" : "Normal"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {analysis.recommendations?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Clinical Recommendations</p>
              <div className="space-y-2">
                {analysis.recommendations.map((r: string, i: number) => (
                  <div key={i} className="text-xs text-slate-800 bg-blue-50/60 border border-blue-200 rounded-lg p-3 flex items-start gap-2 font-medium">
                    <CheckCircle size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reports History */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h2 className="font-bold text-slate-900 text-sm mb-4">Ingested Document Repository ({reports.length})</h2>
        {reports.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8 border border-slate-100 border-dashed rounded-lg">
            No medical reports uploaded yet.
          </p>
        ) : (
          <div className="space-y-2">
            {[...reports].reverse().map((r: any) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-lg hover:border-slate-300 transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 flex-shrink-0">
                    <FileCheck size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{r.filename}</p>
                    <p className="text-[11px] text-slate-500">{r.file_type || "PDF"} · Ingested {r.upload_date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={api.downloadPdf(r.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold text-blue-700 bg-white border border-blue-200 px-2.5 py-1 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    <Download size={12} /> PDF Report
                  </a>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="flex items-center gap-1 text-xs font-semibold text-red-700 bg-white border border-red-200 px-2.5 py-1 rounded-md hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
