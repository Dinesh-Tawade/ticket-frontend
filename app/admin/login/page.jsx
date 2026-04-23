"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // dummy login
    if (email && password) {
      localStorage.setItem("token", "123");
      router.push("/admin/dashboard");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="p-6 border rounded w-80">
        <h2 className="mb-4">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="border w-full mb-2 p-2"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border w-full mb-2 p-2"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="bg-blue-500 text-white w-full p-2"
        >
          Login
        </button>
      </div>
    </div>
  );
}