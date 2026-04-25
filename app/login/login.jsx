"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { userLogin } from "@/app/services/publicCommunication";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";

export default function Login() {
const router = useRouter();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const loginMutation = useMutation({
mutationFn: ({ email, password }) => userLogin(email, password),

onSuccess: (data) => {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data));
  localStorage.setItem("role", data.role);

  toast.success("Logged in successfully!");
  router.push("/dashboard");
},

onError: (error) => {
  toast.error(error?.response?.data?.message || "Login failed");
},

});

const handleSubmit = (e) => {
e.preventDefault();

if (!email || !password) {
  toast.error("Please fill all fields");
  return;
}

loginMutation.mutate({ email, password });

};

return ( <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 px-4">

  <form
    onSubmit={handleSubmit}
    className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-xl space-y-4"
  >
    <h2 className="text-2xl font-bold text-center text-gray-800">
      Login
    </h2>

    {/* Email */}
    <div>
      <label className="text-sm text-gray-600">Email</label>
      <input
        type="email"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>

    {/* Password */}
    <div>
      <label className="text-sm text-gray-600">Password</label>
      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>

    {/* Button */}
    <button
      type="submit"
      disabled={loginMutation.isPending}
      className={`w-full py-2 rounded-lg text-white font-medium transition 
        ${
          loginMutation.isPending
            ? "bg-indigo-300 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700"
        }`}
    >
      {loginMutation.isPending ? "Logging in..." : "Login"}
    </button>
        
    {/* Register Link */}
    <p className="text-sm text-center text-gray-600">
      Don’t have an account?{" "}
      <Link
        href="/register"
        className="text-indigo-600 font-medium hover:underline"
      >
        Register
      </Link>
    </p>

  </form>
</div>

);
}
