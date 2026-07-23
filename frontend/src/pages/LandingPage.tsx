import { useNavigate } from "react-router-dom";
import { Brain, Shield, Activity, Zap, ArrowRight, CheckCircle } from "lucide-react";

const features = [
  { icon: Brain, title: "AI Report Analysis", desc: "Instantly extract key insights, abnormal findings, and recommendations from your medical reports." },
  { icon: Activity, title: "Health Risk Prediction", desc: "Predict diabetes, heart disease, and hypertension risk from biometric indicators." },
  { icon: Zap, title: "Clinical Chat Assistant", desc: "Chat with your medical data using a RAG-powered clinical AI assistant." },
  { icon: Shield, title: "Medical Imaging AI", desc: "Classify chest X-rays, brain MRIs, and skin lesions with explainable AI heat maps." },
];

const highlights = [
  "HIPAA-compliant data handling",
  "Local file storage, no cloud dependency",
  "Firebase Authentication + Firestore",
  "Fully offline mock mode for demo",
];

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {}
      <header className="border-b border-gray-800 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
            <Brain size={18} />
          </div>
          <span className="font-bold text-lg">CareAI</span>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate("/login")} className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">Sign In</button>
          <button onClick={() => navigate("/register")} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-all">Get Started</button>
        </div>
      </header>

      {}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-sm text-blue-400 mb-6">
          <Zap size={12} /> AI-Powered Healthcare Intelligence Platform
        </div>
        <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6 max-w-4xl">
          Your Personal<br />
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Medical AI</span> Assistant
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mb-10">
          Upload medical reports, analyze findings, chat with your health data, predict risks, and visualize your complete health journey — all in one intelligent platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <button
            onClick={() => navigate("/register")}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold text-white transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40"
          >
            Start Free <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 rounded-xl font-semibold text-gray-300 border border-gray-700 hover:border-gray-500 transition-all"
          >
            Sign In to Continue
          </button>
        </div>

        {}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
          {highlights.map(h => (
            <div key={h} className="flex items-center gap-2 text-sm text-gray-500">
              <CheckCircle size={13} className="text-green-500" />
              {h}
            </div>
          ))}
        </div>
      </section>

      {}
      <section className="px-8 py-16 bg-gray-900/50 border-t border-gray-800">
        <h2 className="text-2xl font-bold text-center mb-10">Everything You Need for Smarter Healthcare</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-blue-500/40 transition-all">
              <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center mb-4">
                <Icon size={18} className="text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {}
      <footer className="border-t border-gray-800 px-8 py-6 text-center text-xs text-gray-600">
        © 2026 CareAI · Not a substitute for professional medical advice
      </footer>
    </div>
  );
}
