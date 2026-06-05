"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "react-hot-toast";
import { z } from "zod";
import {
  FaUser,
  FaPlus,
  FaEnvelope,
  FaPhoneAlt,
  FaTrash,
  FaSpinner,
  FaUserShield,
  FaTimes,
  FaLock,
  FaMapMarkerAlt,
} from "react-icons/fa";
import {
  createScanningUser,
  getAllUsers,
  deleteUser,
} from "../../services/adminCommunication";
import useAuth from "@/app/hooks/useAuth";
import useTheme from "@/app/hooks/useTheme";

const addScannerSchema = z.object({
  name: z.string().trim().min(2, "Name is required (min 2 chars)"),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Enter a valid 10 digit phone number")
    .or(z.literal("")),
  address: z.string().trim().optional(),
});

export default function ScannerUsers() {
  useAuth();
  useTheme();

  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(addScannerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      address: "",
    }
  });

  const { data, isLoading } = useQuery({
    queryKey: ["adminScanningUsers"],
    queryFn: () => getAllUsers({ role: "SCANNING_USER" }),
  });

  const scanningUsers = data?.data || [];

  const createMutation = useMutation({
    mutationFn: (payload) => createScanningUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminScanningUsers"] });
      reset();
      toast.success("Scanning user created successfully!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create scanning user");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminScanningUsers"] });
      setDeleteTarget(null);
      toast.success("Scanning user deleted successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete scanning user");
    },
  });

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen transition-colors duration-300 p-6" style={{ background: "var(--background)" }}>
      <Toaster
        position="top-right"
        toastOptions={{
          className: "!rounded-xl !text-sm !font-semibold !shadow-xl !bg-card !text-foreground !border",
          style: { borderColor: "var(--card-border)" },
          duration: 3000,
        }}
      />

      {/* Header Section */}
      <div
        className="relative border-b shadow-lg transition-all duration-300 rounded-xl mb-8"
        style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
      >
        <div className="px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse blur-lg opacity-50" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
                  <FaUserShield className="text-white text-xl" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
                  Scanner Credentials
                </h1>
                <p className="text-xs font-medium" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                  Create and manage scanning users. These credentials can only login and perform ticket scanning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Create Scanner Form */}
        <div
          className="rounded-2xl p-6 shadow-xl border transition-all duration-300 h-fit"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
            <FaPlus className="text-blue-500 text-sm" /> Create Scanner Account
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--foreground)", opacity: 0.7 }}>
                Full Name
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--foreground)", opacity: 0.4 }} />
                <input
                  type="text"
                  placeholder="John Doe"
                  {...register("name")}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all border"
                  style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                />
              </div>
              {errors.name && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--foreground)", opacity: 0.7 }}>
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--foreground)", opacity: 0.4 }} />
                <input
                  type="email"
                  placeholder="scanner@example.com"
                  {...register("email")}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all border"
                  style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--foreground)", opacity: 0.7 }}>
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--foreground)", opacity: 0.4 }} />
                <input
                  type="password"
                  placeholder="******"
                  {...register("password")}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all border"
                  style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                />
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.password.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--foreground)", opacity: 0.7 }}>
                Phone Number
              </label>
              <div className="relative">
                <FaPhoneAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--foreground)", opacity: 0.4 }} />
                <input
                  type="tel"
                  placeholder="9876543210"
                  {...register("phone")}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all border"
                  style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.phone.message}</p>}
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--foreground)", opacity: 0.7 }}>
                Address (Optional)
              </label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-3 text-sm" style={{ color: "var(--foreground)", opacity: 0.4 }} />
                <textarea
                  placeholder="Office/Entrance Gate Address"
                  rows={2}
                  {...register("address")}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all border resize-none"
                  style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}
            >
              {createMutation.isPending ? (
                <FaSpinner className="animate-spin text-sm" />
              ) : (
                <FaPlus className="text-xs" />
              )}
              Create Scanner User
            </button>
          </form>
        </div>

        {/* Right Side: Scanner Accounts Table */}
        <div
          className="lg:col-span-2 rounded-2xl overflow-hidden shadow-xl border transition-all duration-300"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--card-border)" }}>
            <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
              Active Scanner Accounts
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-200">
              {scanningUsers.length} Scanner{scanningUsers.length !== 1 ? "s" : ""}
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <FaSpinner className="animate-spin text-3xl text-blue-500" />
            </div>
          ) : scanningUsers.length === 0 ? (
            <div className="text-center py-20 px-6">
              <FaUserShield className="text-5xl mx-auto mb-4" style={{ color: "var(--foreground)", opacity: 0.15 }} />
              <h3 className="text-lg font-extrabold mb-1" style={{ color: "var(--foreground)" }}>No Scanners Found</h3>
              <p className="text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                Create a scanning user on the left to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full divide-y" style={{ divideColor: "var(--card-border)" }}>
                <thead style={{ background: "var(--background)" }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--foreground)", opacity: 0.6 }}>Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--foreground)", opacity: 0.6 }}>Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--foreground)", opacity: 0.6 }}>Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--foreground)", opacity: 0.6 }}>Created</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--foreground)", opacity: 0.6 }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ divideColor: "var(--card-border)" }}>
                  {scanningUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="transition duration-150 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>{user.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm flex items-center gap-1.5" style={{ color: "var(--foreground)" }}>
                          <FaEnvelope className="text-xs" style={{ opacity: 0.5 }} />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm flex items-center gap-1.5" style={{ color: "var(--foreground)", opacity: 0.8 }}>
                          <FaPhoneAlt className="text-xs" style={{ opacity: 0.5 }} />
                          {user.phone || "No Phone"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(user)}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
             style={{ background: "rgba(0, 0, 0, 0.7)" }}>
          <div className="rounded-xl max-w-sm w-full p-6 transition-all duration-300 shadow-xl"
               style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center bg-red-500/10 border border-red-500/20">
                <FaTrash className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
                Delete Scanner User?
              </h2>
              <p className="text-sm mb-6" style={{ color: "var(--foreground)", opacity: 0.7 }}>
                Are you sure you want to delete account for <strong>{deleteTarget.name}</strong>? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2 rounded-lg border font-semibold text-sm transition"
                  style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteTarget._id)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-2 rounded-lg font-semibold text-sm bg-red-600 text-white hover:bg-red-700 transition flex items-center justify-center gap-1.5"
                >
                  {deleteMutation.isPending && <FaSpinner className="animate-spin text-sm" />}
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
