import { useState, useEffect } from "react";
import { Pill, Upload, Loader, AlertCircle, Clock } from "lucide-react";
import { api } from "../api";

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
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Prescription Analyzer</h1>
        <p className="text-gray-500 text-sm mt-0.5">Upload prescription images or PDFs to extract medication details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {}
        <div
          className="border-2 border-dashed border-gray-700 hover:border-gray-600 bg-gray-900 rounded-xl p-10 text-center cursor-pointer transition-all"
          onClick={() => document.getElementById("presc-input")?.click()}
        >
          <input id="presc-input" type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
            onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader size={32} className="text-blue-400 animate-spin" />
              <p className="text-sm text-gray-300">Extracting prescription data...</p>
            </div>
          ) : (
            <>
              <Pill size={40} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-300 font-medium mb-1">Upload Prescription</p>
              <p className="text-sm text-gray-600">PDF, JPG, PNG accepted</p>
            </>
          )}
        </div>

        {}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="font-semibold text-white text-sm mb-4">Extracted Medications</h2>
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm mb-3"><AlertCircle size={13}/> {error}</div>
          )}
          {result ? (
            <div className="space-y-3">
              <div className="text-xs text-gray-500 mb-2">File: <span className="text-white">{result.filename}</span></div>
              {result.medications?.map((med: any, i: number) => (
                <div key={i} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Pill size={14} className="text-green-400" />
                    <span className="font-semibold text-white">{med.name}</span>
                    <span className="text-xs bg-blue-900/40 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">{med.dosage}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-gray-500">Frequency:</span> <span className="text-gray-300">{med.frequency}</span></div>
                    <div><span className="text-gray-500">Duration:</span> <span className="text-gray-300">{med.duration}</span></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Pill size={32} className="text-gray-700 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Upload a prescription to extract medication details</p>
            </div>
          )}
        </div>
      </div>

      {}
      {prescriptions.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="font-semibold text-white text-sm mb-4">Prescription History ({prescriptions.length})</h2>
          <div className="space-y-3">
            {[...prescriptions].reverse().map((p: any) => (
              <div key={p.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Pill size={14} className="text-green-400" />
                    <span className="text-sm font-medium text-white">{p.filename}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={11} /> {p.date}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {p.medications?.map((med: any, i: number) => (
                    <div key={i} className="text-xs bg-gray-900 rounded p-2 border border-gray-700">
                      <span className="font-medium text-white">{med.name}</span>
                      <span className="text-gray-500 ml-1">({med.dosage})</span>
                      <div className="text-gray-600 mt-0.5">{med.frequency}</div>
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
