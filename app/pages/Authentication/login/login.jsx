"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { userLogin } from "@/app/services/publicCommunication";
import { useMutation } from "@tanstack/react-query";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({

    // mutationFn: ({ email, password }) => userLogin(email, password),
        mutationFn: ({ email, password }) => userLogin(email, password),


    onSuccess: (data) => {
      // ✅ store token
      localStorage.setItem("token", data.token);

      // ✅ store user
      localStorage.setItem("user", JSON.stringify(data));

      // ✅ optional role
      localStorage.setItem("role", data.role);

      toast.success("Logged in successfully!");
      router.push("/dashboard");
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Login failed"
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }



    loginMutation.mutate({ email: email, password: password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-md"
      >
        <h2 className="text-2xl font-semibold text-center mb-6">
          Login
        </h2>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Password */}
        <div className="mb-5">
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className={`w-full py-2 rounded-lg text-white font-medium transition 
            ${
              loginMutation.isPending
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {loginMutation.isPending ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}