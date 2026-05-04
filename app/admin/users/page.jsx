"use client";

import { useEffect, useMemo, useState } from "react";
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
  getUserStats,
  updateUser,
  updateUserStatus,
} from "@/app/services/adminCommunication";
import useAuth from "@/app/hooks/useAuth";

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
}).superRefine(refineUserForm);

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
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition hover:opacity-80"
      style={{ borderColor: t.border, color: t.color, opacity: tone === "slate" ? 0.6 : 1 }}
    >
      {children}
    </button>
  );
}

function StatCard({ label, value, icon: Icon, tone, helper }) {
  return (
    <div className="rounded-lg border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--foreground)", opacity: 0.5 }}>{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>{value}</p>
          {helper ? <p className="mt-1 text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>{helper}</p> : null}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="text-lg" />
        </div>
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
        style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)", opacity: 0.8 }}
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

  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => getAllUsers(),
  });

  const { data: statsData } = useQuery({
    queryKey: ["adminUserStats"],
    queryFn: getUserStats,
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

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
  };

  const hasFilters = search || roleFilter !== "ALL" || statusFilter !== "ALL";

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4" style={{ borderColor: "var(--card-border)", borderTopColor: "var(--foreground)" }} />
          <p className="mt-4 text-sm font-medium" style={{ color: "var(--foreground)", opacity: 0.5 }}>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-lg border p-6 text-center shadow-sm"
          style={{ background: "var(--card)", borderColor: "rgba(239,68,68,0.3)" }}>
          <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>Users could not be loaded</h2>
          <p className="mt-2 text-sm" style={{ color: "var(--foreground)", opacity: 0.5 }}>
            {error.response?.data?.message || error.message || "Please check the API and try again."}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: "var(--gradient-primary)" }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8"
      style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <Toaster position="top-right" />
      <MotionStyles />

      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-xl border p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--foreground)", opacity: 0.5 }}>Admin Console</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>People & access</h1>
            <p className="mt-1 max-w-2xl text-sm" style={{ color: "var(--foreground)", opacity: 0.5 }}>
              Manage user accounts, roles, assignments, and account status from one operational view.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            style={{ background: "var(--gradient-primary)" }}
          >
            <FaPlus className="text-xs" />
            Add User
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <StatCard label="Total" value={stats.total} icon={FaUsers} tone="bg-slate-100 text-slate-700" helper="All accounts" />
          <StatCard label="Active" value={stats.active} icon={FaUserShield} tone="bg-green-50 text-green-700" helper="Can sign in" />
          <StatCard label="Admins" value={stats.admins} icon={FaUserShield} tone="bg-indigo-50 text-indigo-700" helper="Full access" />
          <StatCard label="Owners" value={stats.owners} icon={FaTheaterMasks} tone="bg-sky-50 text-sky-700" helper="Theaters" />
          <StatCard label="Vendors" value={stats.vendors} icon={FaStore} tone="bg-amber-50 text-amber-700" helper="Stores" />
          <StatCard label="Buyers" value={stats.buyers} icon={FaUsers} tone="bg-emerald-50 text-emerald-700" helper="Customers" />
        </div>

        <div className="mb-5 rounded-xl border p-4 shadow-sm"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--foreground)", opacity: 0.4 }} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email, phone, city, store, or theater"
                className="h-11 w-full rounded-lg border pl-9 pr-3 text-sm outline-none transition focus:ring-4"
                style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <SelectField label="Role" value={roleFilter} onChange={setRoleFilter}>
                <option value="ALL">All Roles</option>
                {roles.map((role) => (
                  <option key={role} value={role}>{formatRole(role)}</option>
                ))}
              </SelectField>

              <SelectField label="Status" value={statusFilter} onChange={setStatusFilter}>
                <option value="ALL">All Status</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </SelectField>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="h-11 rounded-lg border px-4 text-sm font-semibold transition"
                  style={{ borderColor: "var(--card-border)", color: "var(--foreground)", opacity: 0.7 }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 text-sm" style={{ color: "var(--foreground)", opacity: 0.5 }}>
            Showing <span className="font-semibold" style={{ color: "var(--foreground)" }}>{filteredUsers.length}</span> of{" "}
            <span className="font-semibold" style={{ color: "var(--foreground)" }}>{users.length}</span> users
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border shadow-sm"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full divide-y" style={{ borderColor: "var(--card-border)" }}>
              <thead style={{ background: "var(--background)" }}>
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--foreground)", opacity: 0.5 }}>User</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--foreground)", opacity: 0.5 }}>Role</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--foreground)", opacity: 0.5 }}>Contact</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--foreground)", opacity: 0.5 }}>Assignment</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--foreground)", opacity: 0.5 }}>Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--foreground)", opacity: 0.5 }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="transition" style={{ borderColor: "var(--card-border)" }}>
                    <td className="px-5 py-4">
                      <button type="button" onClick={() => setSelectedUser(user)} className="flex items-center gap-3 text-left">
                        <UserAvatar user={user} />
                        <div>
                          <p className="font-semibold" style={{ color: "var(--foreground)" }}>{user.name || "Unnamed User"}</p>
                          <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>Joined {formatDate(user.createdAt)}</p>
                        </div>
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <Badge className={roleStyles[user.role] || "bg-slate-100 text-slate-700 ring-slate-200"}>
                        {formatRole(user.role)}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <p className="flex items-center gap-2" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                        <FaEnvelope className="text-xs" style={{ color: "var(--foreground)", opacity: 0.4 }} />
                        {user.email || "No email"}
                      </p>
                      <p className="flex items-center gap-2" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                        <FaPhoneAlt className="text-xs" style={{ color: "var(--foreground)", opacity: 0.4 }} />
                        {user.phone || "No phone"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <Assignment user={user} />
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={user.status || "ACTIVE"}
                        onChange={(event) => statusMutation.mutate({ id: user._id, status: event.target.value })}
                        disabled={statusMutation.isPending}
                        className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold ring-1 outline-none ${statusStyles[user.status] || statusStyles.INACTIVE}`}
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <IconButton title="View details" tone="blue" onClick={() => setSelectedUser(user)}>
                          <FaEye className="text-sm" />
                        </IconButton>
                        <IconButton title="Edit user" onClick={() => setEditingUser(user)}>
                          <FaEdit className="text-sm" />
                        </IconButton>
                        <IconButton title="Delete user" tone="red" onClick={() => setDeleteTarget(user)}>
                          <FaTrash className="text-sm" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y lg:hidden" style={{ borderColor: "var(--card-border)" }}>
            {filteredUsers.map((user) => (
              <div key={user._id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <button type="button" onClick={() => setSelectedUser(user)} className="flex min-w-0 items-center gap-3 text-left">
                    <UserAvatar user={user} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold" style={{ color: "var(--foreground)" }}>{user.name || "Unnamed User"}</p>
                      <p className="truncate text-sm" style={{ color: "var(--foreground)", opacity: 0.5 }}>{user.email || "No email"}</p>
                    </div>
                  </button>
                  <Badge className={statusStyles[user.status] || statusStyles.INACTIVE}>{user.status || "INACTIVE"}</Badge>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge className={roleStyles[user.role] || "bg-slate-100 text-slate-700 ring-slate-200"}>
                    {formatRole(user.role)}
                  </Badge>
                  <span className="text-sm" style={{ color: "var(--foreground)", opacity: 0.5 }}>{user.phone || "No phone"}</span>
                </div>

                <div className="mt-3">
                  <Assignment user={user} />
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUser(user)}
                    className="flex-1 rounded-lg border px-3 py-2 text-sm font-semibold"
                    style={{ borderColor: "rgba(59,130,246,0.3)", color: "#3b82f6" }}
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingUser(user)}
                    className="flex-1 rounded-lg border px-3 py-2 text-sm font-semibold"
                    style={{ borderColor: "var(--card-border)", color: "var(--foreground)", opacity: 0.8 }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(user)}
                    className="flex-1 rounded-lg border px-3 py-2 text-sm font-semibold"
                    style={{ borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "var(--card-border)" }}>
                <FaUsers className="text-xl" style={{ color: "var(--foreground)", opacity: 0.4 }} />
              </div>
              <h3 className="mt-4 text-base font-semibold" style={{ color: "var(--foreground)" }}>No users found</h3>
              <p className="mt-1 text-sm" style={{ color: "var(--foreground)", opacity: 0.5 }}>
                {hasFilters ? "Try changing the search or filters." : "Add your first user to get started."}
              </p>
            </div>
          )}
        </div>
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

      {deleteTarget && (
        <DeleteModal
          deleteTarget={deleteTarget}
          isPending={deleteMutation.isPending}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        />
      )}
    </div>
  );
}

function Assignment({ user }) {
  if (user.role === "THEATER_OWNER") {
    const theater = user.theaters?.[0];
    return (
      <div className="text-sm">
        <p className="flex items-center gap-2 font-medium" style={{ color: "var(--foreground)", opacity: 0.9 }}>
          <FaBuilding className="text-xs" style={{ color: "var(--foreground)", opacity: 0.4 }} />
          {theater?.theaterName || "No theater assigned"}
        </p>
        <p className="mt-1 text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>
          {[theater?.city, theater?.state].filter(Boolean).join(", ") || user.address || "Location unavailable"}
        </p>
      </div>
    );
  }

  if (user.role === "VENDOR") {
    return (
      <div className="text-sm">
        <p className="flex items-center gap-2 font-medium" style={{ color: "var(--foreground)", opacity: 0.9 }}>
          <FaStore className="text-xs" style={{ color: "var(--foreground)", opacity: 0.4 }} />
          {user.storeName || "Vendor store"}
        </p>
        <p className="mt-1 text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>
          {[user.vendorType, user.storeLocation].filter(Boolean).join(" - ") || "Store details unavailable"}
        </p>
      </div>
    );
  }

  return (
    <div className="text-sm">
      <p className="font-medium" style={{ color: "var(--foreground)", opacity: 0.9 }}>{user.address || "No address"}</p>
      <p className="mt-1 text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>User ID: {user.id || user._id}</p>
    </div>
  );
}

function DeleteModal({ deleteTarget, isPending, onClose, onConfirm }) {
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

  const handleConfirm = () => {
    onConfirm();
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", opacity: isClosing ? 0 : 1, transition: "opacity 200ms ease-out" }}
      onClick={handleClose}>
      <div className="w-full max-w-md rounded-xl p-6 shadow-2xl"
        style={{ background: "var(--card)", border: "1px solid var(--card-border)", opacity: isClosing ? 0 : 1, transform: isClosing ? "scale(0.95)" : "scale(1)", transition: "opacity 200ms ease-out, transform 200ms ease-out" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
          <FaTrash />
        </div>
        <h2 className="mt-4 text-lg font-bold" style={{ color: "var(--foreground)" }}>Delete user</h2>
        <p className="mt-2 text-sm leading-6" style={{ color: "var(--foreground)", opacity: 0.6 }}>
          Delete <span className="font-semibold" style={{ color: "var(--foreground)" }}>{deleteTarget.name}</span>? This action cannot be undone.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            style={{ background: "#ef4444" }}
          >
            {isPending ? "Deleting..." : "Delete"}
          </button>
          <button
            onClick={handleClose}
            className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold transition"
            style={{ borderColor: "var(--card-border)", color: "var(--foreground)", opacity: 0.8 }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function UserDetailsDrawer({ user, isLoading, onClose, onEdit }) {
  if (!user) return null;

  return (
    <div className="user-fade-in fixed inset-0 z-40 backdrop-blur-sm" onClick={onClose}
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
      <aside
        className="user-drawer-in ml-auto flex h-full w-full max-w-xl flex-col shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        style={{ background: "var(--card)" }}
      >
        <div className="flex items-center justify-between border-b p-5" style={{ borderColor: "var(--card-border)" }}>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--foreground)", opacity: 0.5 }}>User Details</p>
            <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Account profile</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 transition hover:opacity-70"
            style={{ color: "var(--foreground)", opacity: 0.6 }}>
            <FaTimes />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="py-10 text-center text-sm" style={{ color: "var(--foreground)", opacity: 0.5 }}>Loading profile...</div>
          ) : (
            <>
              <div className="rounded-xl border p-4" style={{ background: "var(--background)", borderColor: "var(--card-border)" }}>
                <div className="flex items-center gap-4">
                  <UserAvatar user={user} size="lg" />
                  <div className="min-w-0">
                    <h3 className="truncate text-xl font-bold" style={{ color: "var(--foreground)" }}>{user.name || "Unnamed User"}</h3>
                    <p className="truncate text-sm" style={{ color: "var(--foreground)", opacity: 0.5 }}>{user.email || "No email"}</p>
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
                        <p className="mt-1 text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>
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
            className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold transition hover:opacity-70"
            style={{ borderColor: "var(--card-border)", color: "var(--foreground)", opacity: 0.8 }}
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
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--foreground)", opacity: 0.5 }}>
        <Icon style={{ color: "var(--foreground)", opacity: 0.4 }} />
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
      <p className="mt-1" style={{ color: "var(--foreground)", opacity: 0.9 }}>{value || "Not added"}</p>
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
    <div onClick={handleBackdropClick} className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", opacity: isClosing ? 0 : 1, transition: "opacity 200ms ease-out" }}>
      <form onSubmit={handleSubmit(submitForm)} className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-xl shadow-2xl"
        style={{ background: "var(--card)", opacity: isClosing ? 0 : 1, transform: isClosing ? "translateY(16px) scale(0.98)" : "translateY(0) scale(1)", transition: "opacity 200ms ease-out, transform 200ms ease-out" }}>
        <div className="flex items-center justify-between border-b p-5" style={{ borderColor: "var(--card-border)" }}>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--foreground)", opacity: 0.5 }}>Create account</p>
            <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Add user</h2>
          </div>
          <button type="button" onClick={handleClose} className="rounded-lg p-2 transition hover:opacity-70"
            style={{ color: "var(--foreground)", opacity: 0.6 }}>
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
                  className="rounded-xl border p-3 text-left transition"
                  style={{
                    borderColor: role === createRole ? "var(--foreground)" : "var(--card-border)",
                    background: role === createRole ? "var(--gradient-primary)" : "var(--card)",
                    color: role === createRole ? "white" : "var(--foreground)",
                    opacity: role === createRole ? 1 : 0.8
                  }}
                >
                  <p className="text-sm font-bold">{formatRole(createRole)}</p>
                  <p className="mt-1 text-xs" style={{ opacity: role === createRole ? 0.8 : 0.5 }}>
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
            <TextInput label="Phone" registration={register("phone")} error={errors.phone?.message} />
            <TextInput label="Address" registration={register("address")} error={errors.address?.message} />
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
                <TextInput label="Store name" registration={register("storeName")} error={errors.storeName?.message} required />
                <TextInput label="Store location" registration={register("storeLocation")} error={errors.storeLocation?.message} required />
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
            {isSaving ? "Creating..." : "Create user"}
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold transition hover:opacity-70"
            style={{ borderColor: "var(--card-border)", color: "var(--foreground)", opacity: 0.8 }}
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
    <div onClick={handleBackdropClick} className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", opacity: isClosing ? 0 : 1, transition: "opacity 200ms ease-out" }}>
      <form onSubmit={handleSubmit(submitForm)} className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-xl shadow-2xl"
        style={{ background: "var(--card)", opacity: isClosing ? 0 : 1, transform: isClosing ? "translateY(16px) scale(0.98)" : "translateY(0) scale(1)", transition: "opacity 200ms ease-out, transform 200ms ease-out" }}>
        <div className="flex items-center justify-between border-b p-5" style={{ borderColor: "var(--card-border)" }}>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--foreground)", opacity: 0.5 }}>Edit account</p>
            <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>{user.name || "User"}</h2>
          </div>
          <button type="button" onClick={handleClose} className="rounded-lg p-2 transition hover:opacity-70"
            style={{ color: "var(--foreground)", opacity: 0.6 }}>
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
            onClick={handleClose}
            className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold transition hover:opacity-70"
            style={{ borderColor: "var(--card-border)", color: "var(--foreground)", opacity: 0.8 }}
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
      <span className="text-sm font-semibold" style={{ color: "var(--foreground)", opacity: 0.8 }}>{label}</span>
      <input
        type={type}
        required={required}
        {...inputProps}
        className="mt-1 h-11 w-full rounded-lg border px-3 text-sm outline-none transition focus:ring-4"
        style={{
          background: "var(--card)",
          borderColor: error ? "rgba(239,68,68,0.5)" : "var(--card-border)",
          color: "var(--foreground)"
        }}
      />
      {error ? <p className="mt-1 text-xs font-medium" style={{ color: "#ef4444" }}>{error}</p> : null}
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
      <span className="text-sm font-semibold" style={{ color: "var(--foreground)", opacity: 0.8 }}>{label}</span>
      <select
        {...selectProps}
        className="mt-1 h-11 w-full rounded-lg border px-3 text-sm outline-none transition focus:ring-4"
        style={{
          background: "var(--card)",
          borderColor: error ? "rgba(239,68,68,0.5)" : "var(--card-border)",
          color: "var(--foreground)"
        }}
      >
        {children}
      </select>
      {error ? <p className="mt-1 text-xs font-medium" style={{ color: "#ef4444" }}>{error}</p> : null}
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
