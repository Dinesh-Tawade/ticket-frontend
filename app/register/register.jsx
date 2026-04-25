"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { userRegister } from "@/app/services/publicCommunication";

export default function Register() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "BUYER",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);



  const registerMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();

      formData.append("name", (form.name.trim()));
      formData.append("email", (form.email.trim()));
      formData.append("password", (form.password.trim()));
      formData.append("address", (form.address.trim()));
      formData.append("role", (form.role));

      if (file) {
        formData.append("profileImage", file);
      }

      return userRegister(formData);
    },

    onSuccess: () => {
      toast.success("Registered successfully!");

      // ✅ reset form
      setForm({
        name: "",
        email: "",
        password: "",
        address: "",
        role: "BUYER",
      });
      setFile(null);
      setPreview(null);

      router.push("/login");
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Registration failed"
      );
    },
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
    }
  };

  // cleanup preview memory
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill all required fields");
      return;
    }

    if (registerMutation.isPending) return;

    registerMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-6 rounded-2xl shadow-md"
      >
        <h2 className="text-2xl font-semibold text-center mb-6">
          Register
        </h2>

        {/* Name */}
        <div className="mb-3">
          <label className="block text-sm mb-1">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Email */}
        <div className="mb-3">
          <label className="block text-sm mb-1">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="block text-sm mb-1">Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Address */}
        <div className="mb-3">
          <label className="block text-sm mb-1">Address</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Role */}
        <div className="mb-3">
          <label className="block text-sm mb-1">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="BUYER">BUYER</option>
            <option value="SELLER">SELLER</option>
          </select>
        </div>

        {/* Image */}
        <div className="mb-4">
          <label className="block text-sm mb-1">Profile Image</label>
          <input type="file" onChange={handleFileChange} />

          {preview && (
            <img
              src={preview}
              alt="preview"
              className="mt-2 w-20 h-20 rounded-lg object-cover"
            />
          )}
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={registerMutation.isPending}
          className={`w-full py-2 rounded-lg text-white font-medium
            ${
              registerMutation.isPending
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {registerMutation.isPending
            ? "Registering..."
            : "Register"}
        </button>
      </form>
    </div>
  );
}