"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast, Toaster } from "react-hot-toast";
import {
  FaArrowLeft,
  FaBuilding,
  FaChevronDown,
  FaPlus,
  FaStore,
  FaUser,
  FaUserShield,
  FaImage,
} from "react-icons/fa";
import {
  createBuyerAdmin,
  createSuperAdminByAdmin,
  createTheaterOwner,
  createVendor,
} from "@/app/services/adminCommunication";
import useAuth from "@/app/hooks/useAuth";

const roles = [
  { value: "BUYER", label: "Buyer", icon: FaUser, helper: "Customer account for ticket bookings" },
  { value: "SUPER_ADMIN", label: "Super Admin", icon: FaUserShield, helper: "Admin account with management access" },
  { value: "THEATER_OWNER", label: "Theater Owner", icon: FaBuilding, helper: "Owner account with theater details" },
  { value: "VENDOR", label: "Vendor", icon: FaStore, helper: "Food or merchandise vendor account" },
];

const initialForm = {
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
  profileImage: null,
};

function MotionStyles() {
  return (
    <style>{`
      @keyframes addUserIn {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes addUserPanelIn {
        from { opacity: 0; transform: translateY(18px) scale(.99); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      .add-user-in {
        animation: addUserIn 220ms ease-out both;
      }

      .add-user-panel {
        animation: addUserPanelIn 260ms cubic-bezier(.2,.8,.2,1) both;
      }
    `}</style>
  );
}

export default function AddUser() {
  useAuth();

  const router = useRouter();
  const [form, setForm] = useState(initialForm);

  const selectedRole = useMemo(
    () => roles.find((role) => role.value === form.role) || roles[0],
    [form.role]
  );

  const createMutation = useMutation({
    mutationFn: (payload) => {
      if (form.role === "SUPER_ADMIN") return createSuperAdminByAdmin(payload);
      if (form.role === "THEATER_OWNER") return createTheaterOwner(payload);
      if (form.role === "VENDOR") return createVendor(payload);
      return createBuyerAdmin(payload);
    },
    onSuccess: () => {
      toast.success("User created successfully");
      setTimeout(() => router.push("/admin/users"), 500);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Unable to create user");
    },
  });

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const buildPayload = () => {
    const base = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      phone: form.phone.trim(),
      address: form.address.trim(),
      status: form.status,
      role: form.role,
    };

    if (form.role === "THEATER_OWNER") {
      return {
        ...base,
        theaters: [
          {
            theaterName: form.theaterName.trim(),
            theaterLocation: form.theaterLocation.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            pincode: form.pincode.trim(),
            totalScreens: Number(form.totalScreens) || 1,
            contactNumber: form.contactNumber.trim() || form.phone.trim(),
            status: form.status,
          },
        ],
      };
    }

    if (form.role === "VENDOR") {
      return {
        ...base,
        vendorType: form.vendorType,
        assignedTheater: form.assignedTheater.trim() || null,
        storeName: form.storeName.trim(),
        storeLocation: form.storeLocation.trim(),
        gstNumber: form.gstNumber.trim() || null,
        foodLicenseNumber: form.foodLicenseNumber.trim() || null,
        deliveryTime: Number(form.deliveryTime) || 15,
        isOpen: Boolean(form.isOpen),
      };
    }

    return base;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      toast.error("Name, email, and password are required");
      return;
    }

    if (form.role === "THEATER_OWNER" && (!form.theaterName.trim() || !form.city.trim())) {
      toast.error("Theater name and city are required for theater owners");
      return;
    }

    if (form.role === "VENDOR" && (!form.storeName.trim() || !form.storeLocation.trim())) {
      toast.error("Store name and store location are required for vendors");
      return;
    }

    createMutation.mutate(buildPayload());
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setField("profileImage", file);
    }
  };

  const RoleIcon = selectedRole.icon;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <MotionStyles />

      <div className="mx-auto max-w-5xl add-user-in">
        <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin/users"
              className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
            >
              <FaArrowLeft className="text-xs" />
              Back to users
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">Add user</h1>
            <p className="mt-1 text-sm text-slate-500">
              Create a buyer, admin, theater owner, or vendor account.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white">
              <RoleIcon />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-950">{selectedRole.label}</p>
              <p className="text-xs text-slate-500">{selectedRole.helper}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="add-user-panel overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-base font-bold text-slate-950">Account type</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              {roles.map((role) => {
                const Icon = role.icon;
                const isActive = form.role === role.value;
                return (
                  <button
                    type="button"
                    key={role.value}
                    onClick={() => setField("role", role.value)}
                    className={`rounded-xl border p-4 text-left transition ${
                      isActive
                        ? "border-slate-950 bg-slate-950 text-white shadow-md"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className={isActive ? "text-white" : "text-slate-500"} />
                    <p className="mt-3 text-sm font-bold">{role.label}</p>
                    <p className={`mt-1 text-xs ${isActive ? "text-slate-300" : "text-slate-500"}`}>{role.helper}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-6 p-5">
            <section>
              <h2 className="text-base font-bold text-slate-950">Basic information</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <TextInput label="Full name" value={form.name} onChange={(value) => setField("name", value)} required />
                <TextInput label="Email" type="email" value={form.email} onChange={(value) => setField("email", value)} required />
                <TextInput label="Password" type="password" value={form.password} onChange={(value) => setField("password", value)} required />
                <TextInput label="Phone" value={form.phone} onChange={(value) => setField("phone", value)} />
                <TextInput label="Address" value={form.address} onChange={(value) => setField("address", value)} />
                <FormSelect label="Status" value={form.status} onChange={(value) => setField("status", value)}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="BLOCKED">Blocked</option>
                </FormSelect>
                <div className="form-group">
                  <label htmlFor="profileImage" className="form-label">
                    <FaImage className="mr-2" /> Profile Image
                  </label>
                  <input
                    type="file"
                    id="profileImage"
                    className="form-control"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </section>

            {form.role === "THEATER_OWNER" && (
              <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h2 className="flex items-center gap-2 text-base font-bold text-slate-950">
                  <FaBuilding className="text-slate-500" />
                  Theater details
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <TextInput label="Theater name" value={form.theaterName} onChange={(value) => setField("theaterName", value)} required />
                  <TextInput label="Theater location" value={form.theaterLocation} onChange={(value) => setField("theaterLocation", value)} />
                  <TextInput label="City" value={form.city} onChange={(value) => setField("city", value)} required />
                  <TextInput label="State" value={form.state} onChange={(value) => setField("state", value)} />
                  <TextInput label="Pincode" value={form.pincode} onChange={(value) => setField("pincode", value)} />
                  <TextInput label="Total screens" type="number" value={form.totalScreens} onChange={(value) => setField("totalScreens", value)} />
                  <TextInput label="Theater contact" value={form.contactNumber} onChange={(value) => setField("contactNumber", value)} />
                </div>
              </section>
            )}

            {form.role === "VENDOR" && (
              <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h2 className="flex items-center gap-2 text-base font-bold text-slate-950">
                  <FaStore className="text-slate-500" />
                  Vendor details
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <FormSelect label="Vendor type" value={form.vendorType} onChange={(value) => setField("vendorType", value)}>
                    <option value="FOOD">Food</option>
                    <option value="MERCHANDISE">Merchandise</option>
                    <option value="OTHER">Other</option>
                  </FormSelect>
                  <TextInput label="Assigned theater ID" value={form.assignedTheater} onChange={(value) => setField("assignedTheater", value)} />
                  <TextInput label="Store name" value={form.storeName} onChange={(value) => setField("storeName", value)} required />
                  <TextInput label="Store location" value={form.storeLocation} onChange={(value) => setField("storeLocation", value)} required />
                  <TextInput label="GST number" value={form.gstNumber} onChange={(value) => setField("gstNumber", value)} />
                  <TextInput label="Food license number" value={form.foodLicenseNumber} onChange={(value) => setField("foodLicenseNumber", value)} />
                  <TextInput label="Delivery time" type="number" value={form.deliveryTime} onChange={(value) => setField("deliveryTime", value)} />
                </div>
                <label className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isOpen}
                    onChange={(event) => setField("isOpen", event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Store is open
                </label>
              </section>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 p-5 sm:flex-row sm:justify-end">
            <Link
              href="/admin/users"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
            >
              <FaPlus className="text-xs" />
              {createMutation.isPending ? "Creating..." : "Create user"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TextInput({ label, value, onChange, type = "text", required = false }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
      />
    </label>
  );
}

function FormSelect({ label, value, onChange, children }) {
  return (
    <label className="relative block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
      >
        {children}
      </select>
      <FaChevronDown className="pointer-events-none absolute bottom-4 right-3 text-xs text-slate-400" />
    </label>
  );
}
