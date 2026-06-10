"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast, Toaster } from "react-hot-toast";
import { z } from "zod";
import {
  FaBuilding,
  FaChevronDown,
  FaEdit,
  FaEnvelope,
  FaEye,
  FaKey,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaPlus,
  FaSearch,
  FaStore,
  FaTheaterMasks,
  FaTimes,
  FaTrash,
  FaUserShield,
  FaUsers,
} from "react-icons/fa";
import {
  createBuyerAdmin,
  createSuperAdminByAdmin,
  createTheaterOwner,
  createVendor,
  deleteUser,
  getAllUsers,
  getUserById,
  getDashboardStats,
  updateUser,
  updateUserStatus,
} from "../../services/adminCommunication";
import useAuth from "@/app/hooks/useAuth";
import useTheme from "@/app/hooks/useTheme";

// Animated Counter Component
const AnimatedCounter = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    if (start === end) return;
    
    const duration = 1000;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="text-[34px] font-black tracking-tighter leading-none transition-all duration-300" style={{ color: "var(--foreground)" }}>
      {count.toLocaleString()}
    </div>
  );
};

const roles = ["SUPER_ADMIN", "THEATER_OWNER", "VENDOR", "BUYER"];
const statuses = ["ACTIVE", "INACTIVE", "BLOCKED"];
const createRoles = ["BUYER", "SUPER_ADMIN", "THEATER_OWNER", "VENDOR"];

const roleEnum = z.enum(["SUPER_ADMIN", "THEATER_OWNER", "VENDOR", "BUYER"]);
const statusEnum = z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]);

const optionalText = z.string().trim().optional();
const requiredText = (label, min = 2) => z.string().trim().min(min, `${label} is required`);

const userFormBaseSchema = z.object({
  role: roleEnum,
  name: requiredText("Name"),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().regex(/^[0-9]{10}$/, "Enter a valid 10 digit phone number").or(z.literal("")),
  address: optionalText,
  status: statusEnum,
  theaterName: optionalText,
  theaterLocation: optionalText,
  city: optionalText,
  state: optionalText,
  pincode: z.string().trim().regex(/^[0-9]{6}$/, "Enter a valid 6 digit pincode").or(z.literal("")).optional(),
  totalScreens: z.coerce.number().min(1, "At least 1 screen is required").optional(),
  contactNumber: z.string().trim().regex(/^[0-9]{10}$/, "Enter a valid 10 digit contact number").or(z.literal("")).optional(),
  vendorType: z.enum(["FOOD", "MERCHANDISE", "OTHER"]),
  assignedTheater: optionalText,
  storeName: optionalText,
  storeLocation: optionalText,
  gstNumber: optionalText,
  foodLicenseNumber: optionalText,
  deliveryTime: z.coerce.number().min(1, "Delivery time must be at least 1 minute"),
  isOpen: z.boolean(),
});

const refineUserForm = (data, ctx) => {
  if (data.role === "THEATER_OWNER") {
    if (!data.theaterName?.trim()) {
      ctx.addIssue({ code: "custom", path: ["theaterName"], message: "Theater name is required" });
    }
    if (!data.city?.trim()) {
      ctx.addIssue({ code: "custom", path: ["city"], message: "City is required" });
    }
  }

  if (data.role === "VENDOR") {
    if (!data.storeName?.trim()) {
      ctx.addIssue({ code: "custom", path: ["storeName"], message: "Store name is required" });
    }
    if (!data.storeLocation?.trim()) {
      ctx.addIssue({ code: "custom", path: ["storeLocation"], message: "Store location is required" });
    }
  }
};

const addUserSchema = userFormBaseSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).superRefine((data, ctx) => {
  refineUserForm(data, ctx);
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: "custom",
      path: ["confirmPassword"],
      message: "Passwords do not match",
    });
  }
});

const editUserSchema = userFormBaseSchema.extend({
  phone: z.string().trim().regex(/^[0-9]{10}$/, "Enter a valid 10 digit phone number").or(z.literal("")).nullable().optional(),
}).superRefine(refineUserForm);

const roleLabels = {
  SUPER_ADMIN: "Super Admin",
  THEATER_OWNER: "Theater Owner",
  VENDOR: "Vendor",
  BUYER: "Buyer",
};

const roleStyles = {
  SUPER_ADMIN: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  THEATER_OWNER: "bg-sky-50 text-sky-700 ring-sky-200",
  VENDOR: "bg-amber-50 text-amber-700 ring-amber-200",
  BUYER: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const statusStyles = {
  ACTIVE: "bg-green-50 text-green-700 ring-green-200",
  INACTIVE: "bg-slate-100 text-slate-600 ring-slate-200",
  BLOCKED: "bg-red-50 text-red-700 ring-red-200",
};

const formatRole = (role) => roleLabels[role] || role || "Unknown";

const formatDate = (date) => {
  if (!date) return "Not available";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const getApiAssetUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;

  const apiUrl = process.env.NEXT_PUBLIC_BE_URL || "";
  const backendRoot = apiUrl.replace(/\/api\/?$/, "");
  return `${backendRoot}/${path.replace(/^\/+/, "")}`;
};

function Badge({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${className}`}>
      {children}
    </span>
  );
}

function IconButton({ title, onClick, children, tone = "slate" }) {
  const tones = {
    slate: { border: "var(--card-border)", color: "var(--foreground)", opacity: 0.6, hoverBg: "var(--card-border)" },
    red: { border: "rgba(239,68,68,0.3)", color: "#ef4444", hoverBg: "rgba(239,68,68,0.1)" },
    blue: { border: "rgba(59,130,246,0.3)", color: "#3b82f6", hoverBg: "rgba(59,130,246,0.1)" },
  };
  const t = tones[tone];

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition`}
      style={{ 
        borderColor: "var(--card-border)", 
        color: "var(--foreground)",
        opacity: 0.6
      }}
    >
      {children}
    </button>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colorMap = {
    blue: { light: "#3b82f6", dark: "#2563eb" },
    green: { light: "#22c55e", dark: "#16a34a" },
    purple: { light: "#a855f7", dark: "#9333ea" },
    yellow: { light: "#eab308", dark: "#ca8a04" },
    red: { light: "#ef4444", dark: "#dc2626" },
    indigo: { light: "#6366f1", dark: "#4f46e5" },
    cyan: { light: "#06b6d4", dark: "#0891b2" },
    emerald: { light: "#10b981", dark: "#059669" },
    orange: { light: "#f97316", dark: "#ea580c" },
    pink: { light: "#ec4899", dark: "#db2777" }
  };
  const themeColor = colorMap[color] || colorMap.blue;

  return (
    <div className="group rounded-xl p-4 flex items-center justify-between transition-all duration-300 cursor-pointer overflow-hidden relative hover:shadow-xl hover:scale-105"
      style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--foreground)", opacity: 0.5 }}>{label}</div>
        <AnimatedCounter value={value} />
      </div>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
        style={{ background: `${themeColor.light}15`, border: `1px solid ${themeColor.light}30` }}>
        <Icon className="text-xl transition-transform group-hover:scale-110" style={{ color: themeColor.light }} />
      </div>
    </div>
  );
}

function UserAvatar({ user, size = "md" }) {
  const imageUrl = getApiAssetUrl(user?.profileImage);
  const initials = user?.name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "U";
  const dimension = size === "lg" ? 56 : 40;
  const classes = size === "lg" ? "h-14 w-14 text-lg" : "h-10 w-10 text-sm";

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={user?.name || "User"}
        className={`rounded-full object-cover ${classes}`}
        style={{ width: dimension, height: dimension }}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full ${classes}`}
      style={{ width: dimension, height: dimension, background: "var(--card-border)", color: "var(--foreground)", opacity: 0.6 }}
    >
      {initials}
    </div>
  );
}

function SelectField({ value, onChange, children, label }) {
  return (
    <label className="relative block min-w-40">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-lg border px-3 pr-9 text-sm font-medium outline-none transition focus:ring-4"
        style={{ 
          background: "var(--card)",
          borderColor: "var(--card-border)",
          color: "var(--foreground)"
        }}
      >
        {children}
      </select>
      <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--foreground)", opacity: 0.4 }} />
    </label>
  );
}

function MotionStyles() {
  return (
    <style>{`
      @keyframes userFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes userModalIn {
        from { opacity: 0; transform: translateY(14px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      @keyframes userDrawerIn {
        from { opacity: 0; transform: translateX(32px); }
        to { opacity: 1; transform: translateX(0); }
      }

      .user-fade-in {
        animation: userFadeIn 180ms ease-out both;
      }

      .user-modal-in {
        animation: userModalIn 220ms cubic-bezier(.2,.8,.2,1) both;
      }

      .user-drawer-in {
        animation: userDrawerIn 260ms cubic-bezier(.2,.8,.2,1) both;
      }
    `}</style>
  );
}

export default function Users() {
  useAuth();
  useTheme();

  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [resetPasswordTarget, setResetPasswordTarget] = useState(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => getAllUsers(),
  });

  const { data: statsData } = useQuery({
    queryKey: ["adminUserStats"],
    queryFn: getDashboardStats,
  });

  const users = useMemo(() => data?.data || [], [data?.data]);

  const detailQuery = useQuery({
    queryKey: ["adminUser", selectedUser?._id],
    queryFn: () => getUserById(selectedUser._id),
    enabled: !!selectedUser?._id,
  });

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const searchable = [
        user.name,
        user.email,
        user.phone,
        user.address,
        user.storeName,
        user.storeLocation,
        user.vendorType,
        user.theaters?.[0]?.theaterName,
        user.theaters?.[0]?.city,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!query || searchable.includes(query)) &&
        (roleFilter === "ALL" || user.role === roleFilter) &&
        (statusFilter === "ALL" || user.status === statusFilter)
      );
    });
  }, [roleFilter, search, statusFilter, users]);

  const stats = useMemo(() => {
    const apiStats = statsData?.data || {};
    const countByRole = (role) => users.filter((user) => user.role === role).length;

    return {
      total: apiStats.totalUsers ?? users.length,
      active: apiStats.activeUsers ?? users.filter((user) => user.status === "ACTIVE").length,
      admins: apiStats.superAdmins ?? countByRole("SUPER_ADMIN"),
      owners: apiStats.theaterOwners ?? countByRole("THEATER_OWNER"),
      vendors: apiStats.vendors ?? countByRole("VENDOR"),
      buyers: apiStats.buyers ?? countByRole("BUYER"),
    };
  }, [statsData?.data, users]);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateUserStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminUserStats"] });
      queryClient.invalidateQueries({ queryKey: ["adminUser"] });
      toast.success("User status updated");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Unable to update user status");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload, profileImage }) => {
      // Use FormData only when image is provided, otherwise send JSON
      if (profileImage) {
        const formData = new FormData();

        Object.keys(payload).forEach((key) => {
          if (payload[key] !== null && payload[key] !== undefined) {
            if (key === "theaters" && Array.isArray(payload[key])) {
              formData.append(key, JSON.stringify(payload[key]));
            } else {
              formData.append(key, payload[key]);
            }
          }
        });

        formData.append("profileImage", profileImage);
        return updateUser(id, formData);
      }

      // No image - send JSON directly
      return updateUser(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminUserStats"] });
      queryClient.invalidateQueries({ queryKey: ["adminUser"] });
      setEditingUser(null);
      toast.success("User updated");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Unable to update user");
    },
  });

  const createMutation = useMutation({
    mutationFn: ({ role, payload, profileImage }) => {
      // Use FormData only when image is provided, otherwise send JSON
      const userData = profileImage ? (() => {
        const formData = new FormData();

        Object.keys(payload).forEach((key) => {
          if (payload[key] !== null && payload[key] !== undefined) {
            if (key === "theaters" && Array.isArray(payload[key])) {
              formData.append(key, JSON.stringify(payload[key]));
            } else {
              formData.append(key, payload[key]);
            }
          }
        });

        formData.append("profileImage", profileImage);
        return formData;
      })() : payload;

      if (role === "SUPER_ADMIN") return createSuperAdminByAdmin(userData);
      if (role === "THEATER_OWNER") return createTheaterOwner(userData);
      if (role === "VENDOR") return createVendor(userData);
      return createBuyerAdmin(userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminUserStats"] });
      setIsAddOpen(false);
      toast.success("User created");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Unable to create user");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminUserStats"] });
      setDeleteTarget(null);
      setSelectedUser(null);
      toast.success("User deleted");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Unable to delete user");
    },
  });
  
  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, password }) => updateUser(id, { password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      setResetPasswordTarget(null);
      toast.success("Password reset successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Unable to reset password");
    },
  });

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
  };

  const hasFilters = search || roleFilter !== "ALL" || statusFilter !== "ALL";


  return (
    <div className="min-h-screen transition-colors duration-300 p-6" style={{ background: "var(--background)" }}>
      <Toaster position="top-right" toastOptions={{
        className: "!rounded-xl !text-sm !font-semibold !shadow-xl !bg-card !text-foreground !border",
        style: { borderColor: "var(--card-border)" },
        duration: 3000
      }} />
      <MotionStyles />

      {/* Header Section */}
      <div className="relative border-b shadow-lg transition-all duration-300 rounded-xl mb-8" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
        <div className="px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse blur-lg opacity-50" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
                  <FaUsers className="text-white text-xl" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
                  People & Access
                </h1>
                <p className="text-xs font-medium" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                  Manage user accounts, roles & access levels
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mx-auto">

        {/* Stats Cards with Animated Counter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <StatCard label="Total Users" value={stats.total} icon={FaUsers} color="blue" />
          <StatCard label="Active" value={stats.active} icon={FaUserShield} color="green" />
          <StatCard label="Admins" value={stats.admins} icon={FaUserShield} color="purple" />
          <StatCard label="Owners" value={stats.owners} icon={FaTheaterMasks} color="indigo" />
          <StatCard label="Vendors" value={stats.vendors} icon={FaStore} color="orange" />
          <StatCard label="Buyers" value={stats.buyers} icon={FaUsers} color="red" />
        </div>
        
        {/* Search and Filter */}
        <div className="rounded-xl p-5 mb-8 flex flex-wrap gap-3 items-center shadow-lg transition-all duration-300 border" 
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
          <div className="flex-1 min-w-[220px] relative">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: "var(--foreground)", opacity: 0.4 }} />
            <input 
              type="text" 
              placeholder="Search by name, email, phone..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 transition-all border"
              style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
            />
          </div>
          <select 
            value={roleFilter} 
            onChange={e => setRoleFilter(e.target.value)} 
            className="appearance-none rounded-lg py-2.5 pl-3.5 pr-9 text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 border transition-all"
            style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}>
            <option value="ALL">All Roles</option>
            {roles.map((role) => (
              <option key={role} value={role}>{formatRole(role)}</option>
            ))}
          </select>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)} 
            className="appearance-none rounded-lg py-2.5 pl-3.5 pr-9 text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 border transition-all"
            style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}>
            <option value="ALL">All Status</option>
            {statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          {hasFilters && (
            <button 
              onClick={clearFilters} 
              className="px-3.5 py-2.5 rounded-lg border transition-all hover:scale-105"
              style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <FaTimes className="text-[10px]" /> Clear
            </button>
          )}
          <div className="ml-auto text-xs font-semibold" style={{ color: "var(--foreground)", opacity: 0.4 }}>
            {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <div className="rounded-2xl text-center py-16 px-8 shadow-xl transition-all duration-300 border"
            style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--background)" }}>
              <FaUsers className="text-3xl" style={{ color: "var(--foreground)", opacity: 0.2 }} />
            </div>
            <h3 className="text-lg font-extrabold mb-2" style={{ color: "var(--foreground)" }}>No users found</h3>
            <p className="text-sm mb-6" style={{ color: "var(--foreground)", opacity: 0.6 }}>
              {hasFilters ? "Try adjusting your filters" : "Create your first user to get started"}
            </p>
            {!hasFilters && (
              <button 
                onClick={() => setIsAddOpen(true)} 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-bold text-sm shadow-lg transition-all hover:-translate-y-0.5 border"
                style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", borderColor: "var(--card-border)" }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 0 20px rgba(59, 130, 246, 0.4)"}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = ""}
              >
                <FaPlus className="text-[11px]" /> Add User
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl shadow-xl transition-all duration-300 border"
            style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full divide-y" style={{ divideColor: "var(--card-border)" }}>
                <thead style={{ background: "var(--background)" }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--foreground)", opacity: 0.6 }}>User</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--foreground)", opacity: 0.6 }}>Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--foreground)", opacity: 0.6 }}>Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--foreground)", opacity: 0.6 }}>Assignment</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--foreground)", opacity: 0.6 }}>Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--foreground)", opacity: 0.6 }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ divideColor: "var(--card-border)" }}>
                  {filteredUsers.map((user, idx) => (
                    <tr 
                      key={user._id} 
                      className="transition animate-in fade-in slide-in-from-bottom-4 duration-500 hover:shadow-md"
                      style={{ borderColor: "var(--card-border)", animationDelay: `${idx * 50}ms`, background: "var(--card)" }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.05)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--card)"}
                    >
                      <td className="px-6 py-4">
                        <button type="button" onClick={() => setSelectedUser(user)} className="flex items-center gap-3 text-left">
                          <UserAvatar user={user} />
                          <div>
                            <p className="font-semibold" style={{ color: "var(--foreground)" }}>{user.name || "Unnamed User"}</p>
                            <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>Joined {formatDate(user.createdAt)}</p>
                          </div>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={roleStyles[user.role] || "bg-slate-100 text-slate-700 ring-slate-200"}>
                          {formatRole(user.role)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm">
                          <p className="flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                            <FaEnvelope className="text-xs" style={{ opacity: 0.6 }} />
                            {user.email || "No email"}
                          </p>
                          <p className="flex items-center gap-2" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                            <FaPhoneAlt className="text-xs" />
                            {user.phone || "No phone"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Assignment user={user} />
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.status || "ACTIVE"}
                          onChange={(event) => statusMutation.mutate({ id: user._id, status: event.target.value })}
                          disabled={statusMutation.isPending}
                          className="rounded-full border-0 px-3 py-1.5 text-xs font-semibold ring-1 outline-none"
                          style={{ background: "var(--card)", color: "var(--foreground)", borderColor: "var(--card-border)" }}
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <IconButton title="View details" onClick={() => setSelectedUser(user)}>
                            <FaEye className="text-sm" />
                          </IconButton>
                          <IconButton title="Edit user" onClick={() => setEditingUser(user)}>
                            <FaEdit className="text-sm" />
                          </IconButton>
                          <IconButton title="Reset password" onClick={() => setResetPasswordTarget(user)} tone="blue">
                            <FaKey className="text-sm" />
                          </IconButton>
                          <IconButton title="Delete user" onClick={() => setDeleteTarget(user)}>
                            <FaTrash className="text-sm" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y lg:hidden" style={{ divideColor: "var(--card-border)" }}>
              {filteredUsers.map((user) => (
                <div key={user._id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <button type="button" onClick={() => setSelectedUser(user)} className="flex min-w-0 items-center gap-3 text-left">
                      <UserAvatar user={user} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold" style={{ color: "var(--foreground)" }}>{user.name || "Unnamed User"}</p>
                        <p className="truncate text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>{user.email || "No email"}</p>
                      </div>
                    </button>
                    <Badge className={statusStyles[user.status] || statusStyles.INACTIVE}>{user.status || "INACTIVE"}</Badge>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge className={roleStyles[user.role] || "bg-slate-100 text-slate-700 ring-slate-200"}>
                      {formatRole(user.role)}
                    </Badge>
                    <span className="text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>{user.phone || "No phone"}</span>
                  </div>

                  <div className="mt-3">
                    <Assignment user={user} />
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedUser(user)}
                      className="flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-all hover:scale-105"
                      style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#3b82f6";
                        e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--card-border)";
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingUser(user)}
                      className="flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-all hover:scale-105"
                      style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#8b5cf6";
                        e.currentTarget.style.backgroundColor = "rgba(139, 92, 246, 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--card-border)";
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setResetPasswordTarget(user)}
                      className="flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-all hover:scale-105"
                      style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#3b82f6";
                        e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--card-border)";
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(user)}
                      className="flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-all hover:scale-105"
                      style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#ef4444";
                        e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--card-border)";
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Cards */}
        {filteredUsers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="rounded-xl p-6 text-center transition-all duration-300 hover:scale-105" 
                 style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
              <div className="text-3xl font-black" style={{ color: "var(--foreground)" }}>
                {stats.active}
              </div>
              <div className="text-xs mt-2" style={{ color: "var(--foreground)", opacity: 0.6 }}>Active Users</div>
            </div>
            <div className="rounded-xl p-6 text-center transition-all duration-300 hover:scale-105" 
                 style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
              <div className="text-3xl font-black" style={{ color: "var(--foreground)" }}>
                {stats.owners + stats.vendors}
              </div>
              <div className="text-xs mt-2" style={{ color: "var(--foreground)", opacity: 0.6 }}>Business Partners</div>
            </div>
            <div className="rounded-xl p-6 text-center transition-all duration-300 hover:scale-105" 
                 style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
              <div className="text-3xl font-black" style={{ color: "var(--foreground)" }}>
                {stats.buyers}
              </div>
              <div className="text-xs mt-2" style={{ color: "var(--foreground)", opacity: 0.6 }}>Total Customers</div>
            </div>
          </div>
        )}

      </div>

      <UserDetailsDrawer
        user={detailQuery.data?.data || selectedUser}
        isLoading={detailQuery.isLoading}
        onClose={() => setSelectedUser(null)}
        onEdit={(user) => setEditingUser(user)}
      />

      {editingUser && (
        <EditUserModal
          key={editingUser._id}
          user={editingUser}
          isSaving={updateMutation.isPending}
          onClose={() => setEditingUser(null)}
          onSave={(payload, profileImage) => updateMutation.mutate({ id: editingUser._id, payload, profileImage })}
        />
      )}

      {isAddOpen && (
        <AddUserModal
          isSaving={createMutation.isPending}
          onClose={() => setIsAddOpen(false)}
          onSave={(role, payload, profileImage) => createMutation.mutate({ role, payload, profileImage })}
        />
      )}

      {resetPasswordTarget && (
        <ResetPasswordModal
          user={resetPasswordTarget}
          isSaving={resetPasswordMutation.isPending}
          onClose={() => setResetPasswordTarget(null)}
          onSave={(password) => resetPasswordMutation.mutate({ id: resetPasswordTarget._id, password })}
        />
      )}

      {deleteTarget && (
        <div className="user-fade-in fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-md" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="user-modal-in w-full max-w-md rounded-2xl p-8 shadow-2xl border" style={{ background: "var(--card)", borderColor: "var(--card-border)", opacity: 1, transform: "scale(1)", transition: "opacity 200ms ease-out, transform 200ms ease-out" }}>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-red-500 mb-4" style={{ background: "var(--background)" }}>
              <FaTrash className="text-xl" />
            </div>
            <h2 className="text-xl font-extrabold mb-2" style={{ color: "var(--foreground)" }}>Delete user</h2>
            <p className="text-sm leading-6 mb-6" style={{ color: "var(--foreground)", opacity: 0.6 }}>
              Delete <span className="font-semibold" style={{ color: "var(--foreground)" }}>{deleteTarget.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => deleteMutation.mutate(deleteTarget._id)}
                disabled={deleteMutation.isPending}
                className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 0 20px rgba(239, 68, 68, 0.4)"}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all hover:scale-105"
                style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--background)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Assignment({ user }) {
  if (user.role === "THEATER_OWNER") {
    const theater = user.theaters?.[0];
    return (
      <div className="text-sm">
        <p className="flex items-center gap-2 font-medium" style={{ color: "var(--foreground)" }}>
          <FaBuilding className="text-xs" style={{ opacity: 0.6 }} />
          {theater?.theaterName || "No theater assigned"}
        </p>
        <p className="mt-1 text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>
          {[theater?.city, theater?.state].filter(Boolean).join(", ") || user.address || "Location unavailable"}
        </p>
      </div>
    );
  }

  if (user.role === "VENDOR") {
    return (
      <div className="text-sm">
        <p className="flex items-center gap-2 font-medium" style={{ color: "var(--foreground)" }}>
          <FaStore className="text-xs" style={{ opacity: 0.6 }} />
          {user.storeName || "Vendor store"}
        </p>
        <p className="mt-1 text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>
          {[user.vendorType, user.storeLocation].filter(Boolean).join(" - ") || "Store details unavailable"}
        </p>
      </div>
    );
  }

  return (
    <div className="text-sm">
      <p className="font-medium" style={{ color: "var(--foreground)" }}>{user.address || "No address"}</p>
      <p className="mt-1 text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>User ID: {user.id || user._id}</p>
    </div>
  );
}

function UserDetailsDrawer({ user, isLoading, onClose, onEdit }) {
  if (!user) return null;

  return (
    <div className="user-fade-in fixed inset-0 z-40 backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <aside
        className="user-drawer-in ml-auto flex h-full w-full max-w-xl flex-col shadow-2xl"
        style={{ background: "var(--card)" }}
        onClick={(event) => event.stopPropagation()}
        style={{ background: "var(--card)" }}
      >
        <div className="flex items-center justify-between border-b p-5" style={{ borderColor: "var(--card-border)" }}>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--foreground)", opacity: 0.6 }}>User Details</p>
            <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Account profile</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 transition" style={{ color: "var(--foreground)", opacity: 0.6 }}>
            <FaTimes />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="py-10 text-center text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>Loading profile...</div>
          ) : (
            <>
              <div className="rounded-xl border p-4" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
                <div className="flex items-center gap-4">
                  <UserAvatar user={user} size="lg" />
                  <div className="min-w-0">
                    <h3 className="truncate text-xl font-bold" style={{ color: "var(--foreground)" }}>{user.name || "Unnamed User"}</h3>
                    <p className="truncate text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>{user.email || "No email"}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge className={roleStyles[user.role] || "bg-slate-100 text-slate-700 ring-slate-200"}>
                        {formatRole(user.role)}
                      </Badge>
                      <Badge className={statusStyles[user.status] || statusStyles.INACTIVE}>
                        {user.status || "INACTIVE"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <DetailItem icon={FaPhoneAlt} label="Phone" value={user.phone || "Not added"} />
                <DetailItem icon={FaMapMarkerAlt} label="Address" value={user.address || "Not added"} />
                <DetailItem icon={FaUsers} label="Created" value={formatDate(user.createdAt)} />
                <DetailItem icon={FaUserShield} label="User ID" value={user.id || user._id} />
              </div>

              <div className="mt-5 rounded-xl border p-4" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
                <h4 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Role details</h4>
                <div className="mt-3">
                  <Assignment user={user} />
                </div>
                {user.role === "VENDOR" && (
                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <FieldLine label="GST" value={user.gstNumber} />
                    <FieldLine label="Food license" value={user.foodLicenseNumber} />
                    <FieldLine label="Delivery time" value={user.deliveryTime ? `${user.deliveryTime} min` : null} />
                    <FieldLine label="Open" value={user.isOpen ? "Yes" : "No"} />
                  </div>
                )}
                {user.role === "THEATER_OWNER" && user.theaters?.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {user.theaters.map((theater) => (
                      <div key={theater._id || theater.id} className="rounded-lg border p-3 text-sm" style={{ borderColor: "var(--card-border)" }}>
                        <p className="font-semibold" style={{ color: "var(--foreground)" }}>{theater.theaterName}</p>
                        <p className="mt-1" style={{ color: "var(--foreground)", opacity: 0.6 }}>{theater.theaterLocation}</p>
                        <p className="mt-1 text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                          {[theater.city, theater.state, theater.pincode].filter(Boolean).join(", ")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 border-t p-5" style={{ borderColor: "var(--card-border)" }}>
          <button
            type="button"
            onClick={() => onEdit(user)}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: "var(--gradient-primary)" }}
          >
            Edit user
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold transition"
            style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
          >
            Close
          </button>
        </div>
      </aside>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border p-4" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--foreground)", opacity: 0.6 }}>
        <Icon />
        {label}
      </div>
      <p className="mt-2 break-words text-sm font-medium" style={{ color: "var(--foreground)" }}>{value}</p>
    </div>
  );
}

function FieldLine({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--foreground)", opacity: 0.4 }}>{label}</p>
      <p className="mt-1" style={{ color: "var(--foreground)" }}>{value || "Not added"}</p>
    </div>
  );
}

function ResetPasswordModal({ user, isSaving, onClose, onSave }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    onSave(password);
  };

  return (
    <div className="user-fade-in fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.5)" }}>
      <form onSubmit={handleSubmit} className="user-modal-in w-full max-w-md overflow-hidden rounded-xl shadow-2xl" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
        <div className="flex items-center justify-between border-b p-5" style={{ borderColor: "var(--card-border)" }}>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--foreground)", opacity: 0.6 }}>Security & Access</p>
            <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Reset Password</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 transition" style={{ color: "var(--foreground)", opacity: 0.6 }}>
            <FaTimes />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm" style={{ color: "var(--foreground)", opacity: 0.8 }}>
            Reset password for user <span className="font-semibold">{user.name}</span> ({user.email}).
          </p>
          
          <label className="block">
            <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>New Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 h-11 w-full rounded-lg border bg-white px-3 text-sm outline-none transition focus:ring-4"
              style={{
                borderColor: "var(--card-border)",
                background: "var(--card)",
                color: "var(--foreground)"
              }}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Confirm New Password</span>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 h-11 w-full rounded-lg border bg-white px-3 text-sm outline-none transition focus:ring-4"
              style={{
                borderColor: "var(--card-border)",
                background: "var(--card)",
                color: "var(--foreground)"
              }}
            />
          </label>
        </div>

        <div className="flex gap-3 border-t p-5" style={{ borderColor: "var(--card-border)" }}>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            style={{ background: "var(--gradient-primary)" }}
          >
            {isSaving ? "Resetting..." : "Reset Password"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold transition"
            style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function AddUserModal({ isSaving, onClose, onSave }) {
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addUserSchema),
    mode: "onBlur",
    defaultValues: {
      role: "BUYER",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      address: "",
      status: "ACTIVE",
      theaterName: "",
      theaterLocation: "",
      city: "",
      state: "",
      pincode: "",
      totalScreens: 1,
      contactNumber: "",
      vendorType: "FOOD",
      assignedTheater: "",
      storeName: "",
      storeLocation: "",
      gstNumber: "",
      foodLicenseNumber: "",
      deliveryTime: 15,
      isOpen: true,
    },
  });

  const role = useWatch({ control, name: "role" });
  const isOpen = useWatch({ control, name: "isOpen" });

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
  };

  const buildPayload = (values) => {
    const base = {
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
      phone: values.phone.trim(),
      address: values.address.trim(),
      status: values.status,
      role: values.role,
    };

    if (values.role === "THEATER_OWNER") {
      return {
        ...base,
        theaters: [
          {
            theaterName: values.theaterName.trim(),
            theaterLocation: values.theaterLocation.trim(),
            city: values.city.trim(),
            state: values.state.trim(),
            pincode: values.pincode?.trim() || "",
            totalScreens: Number(values.totalScreens) || 1,
            contactNumber: values.contactNumber?.trim() || values.phone.trim(),
            status: values.status,
          },
        ],
      };
    }

    if (values.role === "VENDOR") {
      return {
        ...base,
        vendorType: values.vendorType,
        assignedTheater: values.assignedTheater.trim() || null,
        storeName: values.storeName.trim(),
        storeLocation: values.storeLocation.trim(),
        gstNumber: values.gstNumber.trim() || null,
        foodLicenseNumber: values.foodLicenseNumber.trim() || null,
        deliveryTime: Number(values.deliveryTime) || 15,
        isOpen: Boolean(values.isOpen),
      };
    }

    return base;
  };

  const submitForm = (values) => {
    onSave(values.role, buildPayload(values), profileImage);
  };

  const [isClosing, setIsClosing] = useState(false);
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    setShowModal(true);
    const timer = setTimeout(() => setIsClosing(false), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 200);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  if (!showModal) return null;

  return (
    <div className="user-fade-in fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.5)" }}>
      <form onSubmit={handleSubmit(submitForm)} className="user-modal-in max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-xl shadow-2xl" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
        <div className="flex items-center justify-between border-b p-5" style={{ borderColor: "var(--card-border)" }}>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--foreground)", opacity: 0.6 }}>Create account</p>
            <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Add user</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 transition" style={{ color: "var(--foreground)", opacity: 0.6 }}>
            <FaTimes />
          </button>
        </div>

        <div className="max-h-[68vh] overflow-y-auto p-5">
          <div>
            <h3 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Account type</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {createRoles.map((createRole) => (
                <button
                  type="button"
                  key={createRole}
                  onClick={() => setValue("role", createRole, { shouldDirty: true, shouldValidate: true })}
                  className={`rounded-xl border p-3 text-left transition`}
                  style={{
                    borderColor: role === createRole ? "var(--gradient-primary)" : "var(--card-border)",
                    background: role === createRole ? "var(--gradient-primary)" : "var(--card)",
                    color: role === createRole ? "white" : "var(--foreground)",
                    boxShadow: role === createRole ? "var(--card-shadow)" : "none"
                  }}
                >
                  <p className="text-sm font-bold">{formatRole(createRole)}</p>
                  <p className={`mt-1 text-xs`} style={{ opacity: role === createRole ? 0.8 : 0.6 }}>
                    {createRole === "BUYER" ? "Ticket customer" : createRole === "VENDOR" ? "Store account" : createRole === "THEATER_OWNER" ? "Theater access" : "Admin access"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <h3 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Profile Image</h3>
            <div className="mt-3 flex items-center gap-4">
              <div className="shrink-0">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="h-16 w-16 rounded-full object-cover"
                      style={{ ring: "2px", ringColor: "var(--card-border)" }}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-white transition hover:opacity-90"
                      style={{ background: "#ef4444" }}
                      title="Remove image"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full"
                    style={{ background: "var(--card-border)", ring: "2px", ringColor: "var(--card-border)" }}>
                    <FaUsers className="text-xl" style={{ color: "var(--foreground)", opacity: 0.4 }} />
                  </div>
                )}
              </div>
              <label className="flex-1 cursor-pointer">
                <div className="rounded-lg border-2 border-dashed px-4 py-3 text-center transition"
                  style={{ borderColor: "var(--card-border)", background: "var(--background)" }}>
                  <span className="text-sm font-medium" style={{ color: "var(--foreground)", opacity: 0.7 }}>Click to upload profile image</span>
                  <span className="mt-1 block text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>PNG, JPG, GIF up to 5MB</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <TextInput label="Full name" registration={register("name")} error={errors.name?.message} required />
            <TextInput label="Email" type="email" registration={register("email")} error={errors.email?.message} required />
            <TextInput label="Password" type="password" registration={register("password")} error={errors.password?.message} required />
            <TextInput label="Confirm Password" type="password" registration={register("confirmPassword")} error={errors.confirmPassword?.message} required />
            <TextInput label="Phone" registration={register("phone")} error={errors.phone?.message} />
            <TextInput label="Address" registration={register("address")} error={errors.address?.message} />
            <FormSelect label="Status" registration={register("status")} error={errors.status?.message}>
              {statuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </FormSelect>
          </div>

          {role === "THEATER_OWNER" && (
            <div className="mt-5 rounded-xl border p-4" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
              <h3 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Theater details</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <TextInput label="Theater name" registration={register("theaterName")} error={errors.theaterName?.message} required />
                <TextInput label="Theater location" registration={register("theaterLocation")} error={errors.theaterLocation?.message} />
                <TextInput label="City" registration={register("city")} error={errors.city?.message} required />
                <TextInput label="State" registration={register("state")} error={errors.state?.message} />
                <TextInput label="Pincode" registration={register("pincode")} error={errors.pincode?.message} />
                <TextInput label="Total screens" type="number" registration={register("totalScreens")} error={errors.totalScreens?.message} />
                <TextInput label="Theater contact" registration={register("contactNumber")} error={errors.contactNumber?.message} />
              </div>
            </div>
          )}

          {role === "VENDOR" && (
            <div className="mt-5 rounded-xl border p-4" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
              <h3 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Vendor details</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FormSelect label="Vendor type" registration={register("vendorType")} error={errors.vendorType?.message}>
                  <option value="">Select type</option>
                  <option value="FOOD">Food</option>
                  <option value="MERCHANDISE">Merchandise</option>
                  <option value="OTHER">Other</option>
                </FormSelect>
                <TextInput label="Assigned theater ID" registration={register("assignedTheater")} error={errors.assignedTheater?.message} />
                <TextInput label="Store name" registration={register("storeName")} error={errors.storeName?.message} />
                <TextInput label="Store location" registration={register("storeLocation")} error={errors.storeLocation?.message} />
                <TextInput label="GST number" registration={register("gstNumber")} error={errors.gstNumber?.message} />
                <TextInput label="Food license" registration={register("foodLicenseNumber")} error={errors.foodLicenseNumber?.message} />
                <TextInput label="Delivery time" type="number" registration={register("deliveryTime")} error={errors.deliveryTime?.message} />
              </div>
              <label className="mt-4 flex items-center gap-2 text-sm font-medium" style={{ color: "var(--foreground)" }}>
                <input
                  type="checkbox"
                  checked={isOpen}
                  onChange={(event) => setValue("isOpen", event.target.checked, { shouldDirty: true })}
                  className="h-4 w-4 rounded"
                  style={{ borderColor: "var(--card-border)" }}
                />
                Store is open
              </label>
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t p-5" style={{ borderColor: "var(--card-border)" }}>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            style={{ background: "var(--gradient-primary)" }}
          >
            {isSaving ? "Creating..." : "Create user"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold transition"
            style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function EditUserModal({ user, isSaving, onClose, onSave }) {
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editUserSchema),
    mode: "onBlur",
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      role: user.role || "BUYER",
      status: user.status || "ACTIVE",
      theaterName: user.theaters?.[0]?.theaterName || "",
      theaterLocation: user.theaters?.[0]?.theaterLocation || "",
      city: user.theaters?.[0]?.city || "",
      state: user.theaters?.[0]?.state || "",
      pincode: user.theaters?.[0]?.pincode || "",
      totalScreens: user.theaters?.[0]?.totalScreens || 1,
      contactNumber: user.theaters?.[0]?.contactNumber || "",
      vendorType: user.vendorType || "FOOD",
      assignedTheater: user.assignedTheater || "",
      storeName: user.storeName || "",
      storeLocation: user.storeLocation || "",
      gstNumber: user.gstNumber || "",
      foodLicenseNumber: user.foodLicenseNumber || "",
      deliveryTime: user.deliveryTime || 15,
      isOpen: user.isOpen ?? true,
    },
  });

  const role = useWatch({ control, name: "role" });
  const isOpen = useWatch({ control, name: "isOpen" });

  const currentImageUrl = getApiAssetUrl(user?.profileImage);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
  };

  const submitForm = (form) => {
    onSave(
      {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        address: form.address.trim(),
        role: form.role,
        status: form.status,
        theaters: form.role === "THEATER_OWNER"
          ? [
              {
                theaterName: form.theaterName.trim(),
                theaterLocation: form.theaterLocation.trim(),
                city: form.city.trim(),
                state: form.state.trim(),
                pincode: form.pincode?.trim() || "",
                totalScreens: Number(form.totalScreens) || 1,
                contactNumber: form.contactNumber?.trim() || form.phone.trim(),
                status: form.status,
              },
            ]
          : undefined,
        vendorType: form.role === "VENDOR" ? form.vendorType || null : null,
        storeName: form.role === "VENDOR" ? form.storeName.trim() || null : null,
        storeLocation: form.role === "VENDOR" ? form.storeLocation.trim() || null : null,
        gstNumber: form.role === "VENDOR" ? form.gstNumber.trim() || null : null,
        foodLicenseNumber: form.role === "VENDOR" ? form.foodLicenseNumber.trim() || null : null,
        deliveryTime: Number(form.deliveryTime) || 15,
        isOpen: Boolean(form.isOpen),
      },
      profileImage
    );
  };

  const [isClosing, setIsClosing] = useState(false);
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    setShowModal(true);
    const timer = setTimeout(() => setIsClosing(false), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 200);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  if (!showModal) return null;

  return (
    <div className="user-fade-in fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.5)" }}>
      <form onSubmit={handleSubmit(submitForm)} className="user-modal-in max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-xl shadow-2xl" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
        <div className="flex items-center justify-between border-b p-5" style={{ borderColor: "var(--card-border)" }}>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--foreground)", opacity: 0.6 }}>Edit account</p>
            <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>{user.name || "User"}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 transition" style={{ color: "var(--foreground)", opacity: 0.6 }}>
            <FaTimes />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-5">
          <div className="mb-5">
            <h3 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Profile Image</h3>
            <div className="mt-3 flex items-center gap-4">
              <div className="shrink-0">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="h-16 w-16 rounded-full object-cover"
                      style={{ boxShadow: "0 0 0 2px var(--card-border)" }}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-white transition hover:opacity-90"
                      style={{ background: "#ef4444" }}
                      title="Remove image"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </div>
                ) : currentImageUrl ? (
                  <div className="relative">
                    <img
                      src={currentImageUrl}
                      alt="Current profile"
                      className="h-16 w-16 rounded-full object-cover"
                      style={{ boxShadow: "0 0 0 2px var(--card-border)" }}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-white transition hover:opacity-90"
                      style={{ background: "#ef4444" }}
                      title="Remove image"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full"
                    style={{ background: "var(--card-border)", boxShadow: "0 0 0 2px var(--card-border)" }}>
                    <FaUsers className="text-xl" style={{ color: "var(--foreground)", opacity: 0.4 }} />
                  </div>
                )}
              </div>
              <label className="flex-1 cursor-pointer">
                <div className="rounded-lg border-2 border-dashed px-4 py-3 text-center transition"
                  style={{ borderColor: "var(--card-border)", background: "var(--background)" }}>
                  <span className="text-sm font-medium" style={{ color: "var(--foreground)", opacity: 0.7 }}>Click to upload new profile image</span>
                  <span className="mt-1 block text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>PNG, JPG, GIF up to 5MB</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Name" registration={register("name")} error={errors.name?.message} required />
            <TextInput label="Email" type="email" registration={register("email")} error={errors.email?.message} required />
            <TextInput label="Phone" registration={register("phone")} error={errors.phone?.message} />
            <TextInput label="Address" registration={register("address")} error={errors.address?.message} />

            <FormSelect label="Role" registration={register("role")} error={errors.role?.message}>
              {roles.map((role) => (
                <option key={role} value={role}>{formatRole(role)}</option>
              ))}
            </FormSelect>

            <FormSelect label="Status" registration={register("status")} error={errors.status?.message}>
              {statuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </FormSelect>
          </div>

          {role === "THEATER_OWNER" && (
            <div className="mt-5 rounded-xl border p-4" style={{ background: "var(--background)", borderColor: "var(--card-border)" }}>
              <h3 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Theater details</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <TextInput label="Theater name" registration={register("theaterName")} error={errors.theaterName?.message} required />
                <TextInput label="Theater location" registration={register("theaterLocation")} error={errors.theaterLocation?.message} />
                <TextInput label="City" registration={register("city")} error={errors.city?.message} required />
                <TextInput label="State" registration={register("state")} error={errors.state?.message} />
                <TextInput label="Pincode" registration={register("pincode")} error={errors.pincode?.message} />
                <TextInput label="Total screens" type="number" registration={register("totalScreens")} error={errors.totalScreens?.message} />
                <TextInput label="Theater contact" registration={register("contactNumber")} error={errors.contactNumber?.message} />
              </div>
            </div>
          )}

          {role === "VENDOR" && (
            <div className="mt-5 rounded-xl border p-4" style={{ background: "var(--background)", borderColor: "var(--card-border)" }}>
              <h3 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Vendor details</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FormSelect label="Vendor type" registration={register("vendorType")} error={errors.vendorType?.message}>
                  <option value="">Select type</option>
                  <option value="FOOD">Food</option>
                  <option value="MERCHANDISE">Merchandise</option>
                  <option value="OTHER">Other</option>
                </FormSelect>
                <TextInput label="Assigned theater ID" registration={register("assignedTheater")} error={errors.assignedTheater?.message} />
                <TextInput label="Store name" registration={register("storeName")} error={errors.storeName?.message} />
                <TextInput label="Store location" registration={register("storeLocation")} error={errors.storeLocation?.message} />
                <TextInput label="GST number" registration={register("gstNumber")} error={errors.gstNumber?.message} />
                <TextInput label="Food license" registration={register("foodLicenseNumber")} error={errors.foodLicenseNumber?.message} />
                <TextInput label="Delivery time" type="number" registration={register("deliveryTime")} error={errors.deliveryTime?.message} />
              </div>
              <label className="mt-4 flex items-center gap-2 text-sm font-medium" style={{ color: "var(--foreground)", opacity: 0.8 }}>
                <input
                  type="checkbox"
                  checked={isOpen}
                  onChange={(event) => setValue("isOpen", event.target.checked, { shouldDirty: true })}
                  className="h-4 w-4 rounded"
                  style={{ borderColor: "var(--card-border)" }}
                />
                Store is open
              </label>
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t p-5" style={{ borderColor: "var(--card-border)" }}>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            style={{ background: "var(--gradient-primary)" }}
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold transition"
            style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function TextInput({ label, value, onChange, registration, error, type = "text", required = false }) {
  const inputProps = registration || {
    value,
    onChange: (event) => onChange(event.target.value),
  };

  return (
    <label className="block">
      <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{label}</span>
      <input
        type={type}
        required={required}
        {...inputProps}
        className={`mt-1 h-11 w-full rounded-lg border bg-white px-3 text-sm outline-none transition focus:ring-4`}
        style={{
          borderColor: error ? "#fca5a5" : "var(--card-border)",
          background: "var(--card)",
          color: "var(--foreground)",
          focusBorderColor: error ? "#ef4444" : "var(--card-border)"
        }}
      />
      {error ? <p className="mt-1 text-xs font-medium" style={{ color: "#dc2626" }}>{error}</p> : null}
    </label>
  );
}

function FormSelect({ label, value, onChange, registration, error, children }) {
  const selectProps = registration || {
    value,
    onChange: (event) => onChange(event.target.value),
  };

  return (
    <label className="block">
      <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{label}</span>
      <select
        {...selectProps}
        className={`mt-1 h-11 w-full rounded-lg border bg-white px-3 text-sm outline-none transition focus:ring-4`}
        style={{
          borderColor: error ? "#fca5a5" : "var(--card-border)",
          background: "var(--card)",
          color: "var(--foreground)"
        }}
      >
        {children}
      </select>
      {error ? <p className="mt-1 text-xs font-medium" style={{ color: "#dc2626" }}>{error}</p> : null}
    </label>
  );
}

const columns = [
  {
    Header: "Profile Image",
    accessor: "profileImage",
    Cell: ({ value }) => (
      value ? <img src={getApiAssetUrl(value)} alt="Profile" className="w-10 h-10 rounded-full" /> : "N/A"
    ),
  },
  { Header: "Name", accessor: "name" },
  { Header: "Email", accessor: "email" },
  { Header: "Role", accessor: "role", Cell: ({ value }) => formatRole(value) },
  { Header: "Status", accessor: "status", Cell: ({ value }) => <Badge className={statusStyles[value]}>{value}</Badge> },
  { Header: "Phone", accessor: "phone" },
  { Header: "Address", accessor: "address" },
  { Header: "Vendor Type", accessor: "vendorType" },
  { Header: "Assigned Theater", accessor: "assignedTheater" },
  { Header: "Store Name", accessor: "storeName" },
  { Header: "Store Location", accessor: "storeLocation" },
  { Header: "GST Number", accessor: "gstNumber" },
  { Header: "Food License Number", accessor: "foodLicenseNumber" },
  { Header: "Delivery Time", accessor: "deliveryTime" },
  { Header: "Is Open", accessor: "isOpen", Cell: ({ value }) => (value ? "Yes" : "No") },
  { Header: "Theaters", accessor: "theaters", Cell: ({ value }) => value.map((t) => t.theaterName).join(", ") || "N/A" },
];
