import { useState, useEffect, createContext, useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { authService } from "./firebase";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ReportUpload from "./pages/ReportUpload";
import ChatAssistant from "./pages/ChatAssistant";
import PrescriptionScanner from "./pages/PrescriptionScanner";
import MedicalImaging from "./pages/MedicalImaging";
import SymptomChecker from "./pages/SymptomChecker";
import DrugInteractions from "./pages/DrugInteractions";
import Sidebar from "./components/Sidebar";
import EmergencyTriage from "./pages/EmergencyTriage";
import CommandCenter from "./pages/CommandCenter";
import PreventionEngine from "./pages/PreventionEngine";
import VoiceAssistant from "./pages/VoiceAssistant";
import RuralWorker from "./pages/RuralWorker";
import AffordabilityEngine from "./pages/AffordabilityEngine";
import PopulationAnalytics from "./pages/PopulationAnalytics";
import MedicalEducator from "./pages/MedicalEducator";
import HealthcareFinder from "./pages/HealthcareFinder";

interface User { id: string; email: string; name: string; role: string; }
interface AuthCtx { user: User | null; setUser: (u: User | null) => void; logout: () => void; }
const AuthContext = createContext<AuthCtx>({ user: null, setUser: () => {}, logout: () => {} });
export const useAuth = () => useContext(AuthContext);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

import { TopBar } from "./components/TopBar";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-slate-50">{children}</main>
      </div>
    </div>
  );
}

const P = ({ page }: { page: React.ReactNode }) => (
  <ProtectedRoute><AppLayout>{page}</AppLayout></ProtectedRoute>
);

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    console.log("[App] registering auth listener", performance.now());
    const unsubscribe = authService.onAuthStateChanged((u) => {
      console.log("[App] auth state changed", { user: u?.id ?? null, timestamp: performance.now() });
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard"          element={<P page={<Dashboard />} />} />
        <Route path="/reports"            element={<P page={<ReportUpload />} />} />
        <Route path="/chat"               element={<P page={<ChatAssistant />} />} />
        <Route path="/prescriptions"      element={<P page={<PrescriptionScanner />} />} />
        <Route path="/imaging"            element={<P page={<MedicalImaging />} />} />
        <Route path="/symptoms"           element={<P page={<SymptomChecker />} />} />
        <Route path="/drug-interactions"  element={<P page={<DrugInteractions />} />} />
        <Route path="/emergency-triage"   element={<P page={<EmergencyTriage />} />} />
        <Route path="/command-center"     element={<P page={<CommandCenter />} />} />
        <Route path="/prevention-engine"   element={<P page={<PreventionEngine />} />} />
        <Route path="/voice-assistant"     element={<P page={<VoiceAssistant />} />} />
        <Route path="/rural-worker"        element={<P page={<RuralWorker />} />} />
        <Route path="/affordability"       element={<P page={<AffordabilityEngine />} />} />
        <Route path="/population-analytics" element={<P page={<PopulationAnalytics />} />} />
        <Route path="/medical-educator"   element={<P page={<MedicalEducator />} />} />
        <Route path="/healthcare-finder"  element={<P page={<HealthcareFinder />} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthContext.Provider>
  );
}
