import React, { useState } from "react";
import * as sdk from "matrix-js-sdk";
import type { LoginRequest } from "matrix-js-sdk";
import type { Creds } from "../App";

interface LoginProps {
  onLoginSuccess: (creds: Creds) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [baseUrl, setBaseUrl] = useState("http://localhost:8008");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const tempClient = sdk.createClient({ baseUrl });

    try {
      const loginParams: LoginRequest = {
        type: "m.login.password",
        identifier: {
          type: "m.id.user",
          user: username,
        },
        password: password,
        initial_device_display_name: "React Matrix Client",
      };

      const response = await tempClient.loginRequest(loginParams);

      const creds = {
        userId: response.user_id,
        accessToken: response.access_token,
        baseUrl: baseUrl,
        deviceId: response.device_id,
      };

      // Save to localStorage for future reloads
      localStorage.setItem("matrix_creds", JSON.stringify(creds));

      onLoginSuccess(creds);
    } catch (err: any) {
      setError(
        err.message || "Login failed. Check your Synapse URL and credentials.",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-500 via-purple-500 to-pink-800 px-4">
      {/* Glassmorphic Card */}
      <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Matrix POC</h1>
          <p className="text-purple-200">Connect to your private homeserver</p>
        </div>

        {/* --- ERROR ALERT BLOCK START --- */}
        {error && (
          <div className="mb-6 flex items-center p-4 text-red-200 bg-red-500/20 border border-red-500/50 rounded-xl animate-in fade-in zoom-in duration-300">
            <svg
              className="w-5 h-5 mr-3 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}
        {/* --- ERROR ALERT BLOCK END --- */}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-purple-100 mb-1">
              Homeserver URL
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              placeholder="http://localhost:8008"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-100 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-100 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            disabled={loading}
            className="w-full py-3 px-4 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg transform transition active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-purple-300/60 uppercase tracking-widest">
          Powered by Synapse + Matrix SDK
        </p>
      </div>
    </div>
  );
};
