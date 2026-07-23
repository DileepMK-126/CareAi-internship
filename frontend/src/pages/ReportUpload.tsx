import { useState, useCallback, useEffect } from "react";
import { Upload, FileText, Trash2, Download, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { api } from "../api";

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
      setError(e.message);
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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Medical Report Upload</h1>
        <p className="text-gray-500 text-sm mt-0.5">Upload PDF, DOCX, or TXT files for AI-powered analysis</p>
      </div>

      {}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
          dragging ? "border-blue-500 bg-blue-500/5" : "border-gray-700 hover:border-gray-600 bg-gray-900"
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
          <div className="flex flex-col items-center gap-3">
            <Loader size={36} className="text-blue-400 animate-spin" />
            <p className="text-gray-300 font-medium">Uploading and analyzing...</p>
          </div>
        ) : (
          <>
            <Upload size={40} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-300 font-medium mb-1">Drag & drop your medical report</p>
            <p className="text-sm text-gray-600">or click to browse — PDF, DOCX, TXT supported</p>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-900/30 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {}
      {analysis && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle size={16} />
            <span className="font-semibold">Analysis Complete</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Patient", value: analysis.patient_name },
              { label: "Age", value: analysis.age || "N/A" },
              { label: "Gender", value: analysis.gender },
              { label: "Date", value: analysis.report_date },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-sm font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-400 mb-2">AI Summary</p>
            <p className="text-sm text-gray-300 bg-gray-800 rounded-lg p-3 leading-relaxed">{analysis.summary}</p>
          </div>

          {analysis.alerts?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-red-400 mb-2 flex items-center gap-1"><AlertCircle size={13} /> Critical Alerts</p>
              <div className="space-y-1.5">
                {analysis.alerts.map((a: string, i: number) => (
                  <div key={i} className="text-sm text-red-300 bg-red-900/20 border border-red-500/20 rounded-lg px-3 py-2">{a}</div>
                ))}
              </div>
            </div>
          )}

          {analysis.test_metrics?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-400 mb-2">Diagnostic Metrics</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium">Test</th>
                      <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium">Value</th>
                      <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium">Reference</th>
                      <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.test_metrics.map((m: any, i: number) => (
                      <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                        <td className="py-2.5 px-3 text-white">{m.test_name}</td>
                        <td className="py-2.5 px-3 font-mono text-white">{m.value} {m.unit}</td>
                        <td className="py-2.5 px-3 text-gray-500">{m.reference_range}</td>
                        <td className="py-2.5 px-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${m.is_abnormal ? "bg-red-900/40 text-red-400" : "bg-green-900/40 text-green-400"}`}>
                            {m.is_abnormal ? "Abnormal" : "Normal"}
                          </span>
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
              <p className="text-sm font-medium text-blue-400 mb-2">Recommendations</p>
              <div className="space-y-1.5">
                {analysis.recommendations.map((r: string, i: number) => (
                  <div key={i} className="text-sm text-gray-300 bg-blue-900/10 border border-blue-500/20 rounded-lg px-3 py-2 flex items-start gap-2">
                    <CheckCircle size={13} className="text-blue-400 mt-0.5 flex-shrink-0" /> {r}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="font-semibold text-white text-sm mb-4">Upload History ({reports.length})</h2>
        {reports.length === 0 ? (
          <p className="text-sm text-gray-600 text-center py-6">No reports uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {[...reports].reverse().map((r: any) => (
              <div key={r.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                <FileText size={16} className="text-blue-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{r.filename}</p>
                  <p className="text-xs text-gray-500">{r.file_type} · {r.upload_date}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <a
                    href={api.downloadPdf(r.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-400 border border-blue-400/30 px-2 py-1 rounded hover:bg-blue-400/10 transition-all"
                  >
                    <Download size={11} /> PDF
                  </a>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="flex items-center gap-1 text-xs text-red-400 border border-red-400/30 px-2 py-1 rounded hover:bg-red-400/10 transition-all"
                  >
                    <Trash2 size={11} /> Delete
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
