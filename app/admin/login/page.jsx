"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SuperAdminLogin } from "@/app/services/adminCommunication";

export default function AdminLogin() {
const router = useRouter();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const handleLogin = async (e) => {
e.preventDefault();
setLoading(true);
setError("");
try {
  const res = await SuperAdminLogin(email, password);

  if (res?.token) {
    router.push("/admin/dashboard");
  } else {
    setError("Invalid credentials");
  }
} catch (err) {
  setError("Login failed");
} finally {
  setLoading(false);
}

};

return ( <div className="h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800">

  {/* Card */}
  <div className="w-[320px] p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl animate-fadeIn">

    <h2 className="text-2xl font-bold text-white text-center mb-6">
      Super Admin Login
    </h2>

    <form onSubmit={handleLogin} className="space-y-4">

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-white transition"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-white transition"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full p-3 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition transform hover:scale-105 active:scale-95 disabled:opacity-50"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      {error && (
        <p className="text-red-400 text-sm text-center animate-pulse">
          {error}
        </p>
      )}

    </form>
  </div>
</div>

);
}
