import { useNavigate } from "react-router-dom";
import { Brain, Shield, Activity, Zap, ArrowRight, CheckCircle, Sparkles, FileText, HeartPulse, Stethoscope, ChevronRight } from "lucide-react";
import { Badge } from "../components/ui/Badge";

const features = [
  { icon: FileText, title: "AI Report Extraction", desc: "Instantly extract lab metrics, abnormal findings, and clinical summaries from PDF, DOCX, or scan files." },
  { icon: HeartPulse, title: "Predictive Risk Modeling", desc: "Evaluate 12-month risk trajectories for Type 2 diabetes, cardiovascular disease, hypertension, and kidney health." },
  { icon: Zap, title: "RAG Clinical AI Assistant", desc: "Engage in natural Q&A with your complete medical history using HIPAA-compliant RAG architecture." },
  { icon: Shield, title: "Medical Imaging Diagnostics", desc: "Classify Chest X-Rays, Brain MRIs, and Dermatological Lesions with Explainable AI (XAI) heatmaps." },
];

const highlights = [
  "HIPAA-Compliant Security Standard",
  "Local Persistent File Storage",
  "Firebase Cloud Auth & Firestore",
  "Fully Functional Offline & Demo Mode",
];

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 px-8 py-3.5 flex justify-between items-center sticky top-0 z-20 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-xs">
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-base text-slate-900 leading-tight block">CareAI</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Enterprise Platform</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-xs flex items-center gap-1"
          >
            Get Started <ChevronRight size={13} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 text-xs font-bold text-blue-700 mb-6 shadow-2xs">
          <Sparkles size={13} className="text-blue-600" />
          <span>AI-Powered Healthcare Intelligence Platform</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight mb-6 max-w-4xl">
          Your Personal <span className="text-blue-600">Medical AI</span> Assistant
        </h1>

        <p className="text-slate-600 text-base md:text-lg max-w-2xl mb-8 leading-relaxed font-medium">
          Upload medical reports, analyze diagnostic findings, predict health risks, evaluate drug interactions, and converse with your health data in real time.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10 w-full sm:w-auto">
          <button
            onClick={() => navigate("/register")}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-xs text-white transition-all shadow-xs"
          >
            Start Free Account <ArrowRight size={15} />
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 rounded-xl font-bold text-xs text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 transition-all shadow-2xs"
          >
            Sign In to Continue
          </button>
        </div>

        {/* Highlight Badges */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2.5 pt-4 border-t border-slate-200/80 w-full max-w-3xl">
          {highlights.map(h => (
            <div key={h} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <CheckCircle size={14} className="text-emerald-600" />
              <span>{h}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Cards Grid Section */}
      <section className="px-8 py-16 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Comprehensive Clinical Suite</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">Everything You Need for Smarter Healthcare</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-slate-50 border border-slate-200/80 rounded-xl p-6 hover:border-blue-300 hover:bg-white hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center mb-4 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Icon size={20} />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-2">{title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 px-8 py-6 text-center text-xs font-medium text-slate-500">
        © 2026 CareAI Enterprise Healthcare Platform · Designed for clinical decision support. Not a substitute for professional medical advice.
      </footer>
    </div>
  );
}
