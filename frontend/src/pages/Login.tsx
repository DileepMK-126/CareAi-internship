import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Brain, Mail, Lock, AlertCircle } from "lucide-react";
import { authService } from "../firebase";
import { useAuth } from "../App";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await authService.login(email, password);
      setUser(user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    console.log(`[Auth Audit] 1. Login button clicked timestamp=${performance.now().toFixed(2)}ms`);
    try {
      const user = await authService.loginWithGoogle();
      setUser(user);
      console.log(`[Auth Audit] 8. Navigation started timestamp=${performance.now().toFixed(2)}ms target=/dashboard`);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Google Sign-In failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <Brain size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">CareAI</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-6">Sign in to your CareAI account</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-900/30 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-4 text-sm">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full mb-5 py-3 px-4 bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-lg font-semibold text-sm text-white flex items-center justify-center gap-3 transition-all hover:scale-[1.01]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-xs text-gray-500 font-medium uppercase">Or with Email</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block flex items-center gap-1.5">
                <Mail size={12} className="text-blue-400" /> Email Address
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-3.5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-3.5 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg font-semibold text-sm text-white transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              <Mail size={16} />
              {loading ? "Signing in..." : "Sign in with Email"}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-500 hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
