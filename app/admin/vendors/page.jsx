"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast, Toaster } from "react-hot-toast";
import {
  getAllUsers,
  createVendor,
  updateUser,
  deleteUser,
  getAllTheatersAdmin,
} from "../../services/adminCommunication";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaSpinner,
  FaStore,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaIdCard,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

function VendorsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    vendorType: "FOOD",
    assignedTheater: "",
    storeName: "",
    storeLocation: "",
    gstNumber: "",
    foodLicenseNumber: "",
    deliveryTime: 30,
  });

  // Fetch vendors list
  const { data: vendorsData, isLoading, refetch } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => getAllUsers({ role: "VENDOR" }),
  });

  // Fetch theaters for dropdown
  const { data: theatersData } = useQuery({
    queryKey: ["theaters"],
    queryFn: getAllTheatersAdmin,
  });

  const vendors = vendorsData?.data || [];
  const theaters = theatersData?.data || [];

  // Create vendor mutation
  const createMutation = useMutation({
    mutationFn: createVendor,
    onSuccess: () => {
      toast.success("Vendor created successfully!");
      queryClient.invalidateQueries(["vendors"]);
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create vendor");
    },
  });

  // Update vendor mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: () => {
      toast.success("Vendor updated successfully!");
      queryClient.invalidateQueries(["vendors"]);
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update vendor");
    },
  });

  // Delete vendor mutation
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success("Vendor deleted successfully!");
      queryClient.invalidateQueries(["vendors"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete vendor");
    },
  });

  const openCreateModal = () => {
    setEditingVendor(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      address: "",
      vendorType: "FOOD",
      assignedTheater: "",
      storeName: "",
      storeLocation: "",
      gstNumber: "",
      foodLicenseNumber: "",
      deliveryTime: 30,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (vendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name || "",
      email: vendor.email || "",
      password: "",
      confirmPassword: "",
      phone: vendor.phone || "",
      address: vendor.address || "",
      vendorType: vendor.vendorType || "FOOD",
      assignedTheater: vendor.assignedTheater || "",
      storeName: vendor.storeName || "",
      storeLocation: vendor.storeLocation || "",
      gstNumber: vendor.gstNumber || "",
      foodLicenseNumber: vendor.foodLicenseNumber || "",
      deliveryTime: vendor.deliveryTime || 30,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVendor(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!editingVendor && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const submitData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      address: formData.address,
      vendorType: formData.vendorType,
      assignedTheater: formData.assignedTheater,
      storeName: formData.storeName,
      storeLocation: formData.storeLocation,
      gstNumber: formData.gstNumber,
      foodLicenseNumber: formData.foodLicenseNumber,
      deliveryTime: formData.deliveryTime,
    };

    if (editingVendor) {
      updateMutation.mutate({ id: editingVendor._id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = (vendor) => {
    if (confirm(`Are you sure you want to delete vendor "${vendor.name}"?`)) {
      deleteMutation.mutate(vendor._id);
    }
  };

  // Get theater name by ID
  const getTheaterName = (theaterId) => {
    const theater = theaters.find((t) => t._id === theaterId);
    return theater?.name || "N/A";
  };

  return (
    <div className="min-h-screen p-6" style={{ background: "var(--background)" }}>
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            Vendor Management
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--foreground)", opacity: 0.6 }}>
            Manage all food vendors and their assigned theaters
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-semibold hover:opacity-90 transition"
        >
          <FaPlus size={14} /> Add Vendor
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <FaStore className="text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{vendors.length}</p>
              <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>Total Vendors</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <FaCheckCircle className="text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
                {vendors.filter(v => v.status === "ACTIVE").length}
              </p>
              <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>Active Vendors</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <FaBuilding className="text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{theaters.length}</p>
              <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>Available Theaters</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vendors Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <FaSpinner className="animate-spin text-3xl text-yellow-500" />
        </div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-12 rounded-xl" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <FaStore className="text-5xl mx-auto mb-3 opacity-30" />
          <p className="text-gray-400">No vendors found. Click "Add Vendor" to create one.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          <table className="w-full">
            <thead className="border-b" style={{ borderColor: "var(--card-border)" }}>
              <tr className="text-left text-sm">
                <th className="px-4 py-3" style={{ color: "var(--foreground)", opacity: 0.6 }}>Vendor</th>
                <th className="px-4 py-3" style={{ color: "var(--foreground)", opacity: 0.6 }}>Contact</th>
                <th className="px-4 py-3" style={{ color: "var(--foreground)", opacity: 0.6 }}>Store</th>
                <th className="px-4 py-3" style={{ color: "var(--foreground)", opacity: 0.6 }}>Assigned Theater</th>
                <th className="px-4 py-3" style={{ color: "var(--foreground)", opacity: 0.6 }}>Status</th>
                <th className="px-4 py-3" style={{ color: "var(--foreground)", opacity: 0.6 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor._id} className="border-b" style={{ borderColor: "var(--card-border)" }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <FaUser className="text-purple-500 text-sm" />
                      </div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: "var(--foreground)" }}>{vendor.name}</p>
                        <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>{vendor.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm" style={{ color: "var(--foreground)" }}>{vendor.phone || "N/A"}</p>
                    <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>{vendor.address || "N/A"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{vendor.storeName || "N/A"}</p>
                    <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>{vendor.vendorType || "N/A"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm" style={{ color: "var(--foreground)" }}>
                      {getTheaterName(vendor.assignedTheater)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                      vendor.status === "ACTIVE" 
                        ? "bg-green-500/20 text-green-500" 
                        : "bg-red-500/20 text-red-500"
                    }`}>
                      {vendor.status === "ACTIVE" ? <FaCheckCircle size={10} /> : <FaTimesCircle size={10} />}
                      {vendor.status || "ACTIVE"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(vendor)}
                        className="p-1.5 rounded-lg hover:bg-blue-500/20 text-blue-500 transition"
                        title="Edit"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(vendor)}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-500 transition"
                        title="Delete"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: "var(--card)" }} onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 p-4 border-b flex justify-between items-center" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
              <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
                {editingVendor ? "Edit Vendor" : "Create New Vendor"}
              </h2>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Info */}
                <div className="space-y-1">
                  <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                    required
                  />
                </div>

                {!editingVendor && (
                  <>
                    <div className="space-y-1">
                      <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Password *</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                        required={!editingVendor}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Confirm Password *</label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                        required={!editingVendor}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                  />
                </div>

                {/* Store Details */}
                <div className="space-y-1">
                  <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Store Name *</label>
                  <input
                    type="text"
                    value={formData.storeName}
                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Store Location *</label>
                  <input
                    type="text"
                    value={formData.storeLocation}
                    onChange={(e) => setFormData({ ...formData, storeLocation: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Vendor Type</label>
                  <select
                    value={formData.vendorType}
                    onChange={(e) => setFormData({ ...formData, vendorType: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                  >
                    <option value="FOOD">Food</option>
                    <option value="BEVERAGES">Beverages</option>
                    <option value="MERCHANDISE">Merchandise</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Assigned Theater *</label>
                  <select
                    value={formData.assignedTheater}
                    onChange={(e) => setFormData({ ...formData, assignedTheater: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                    required
                  >
                    <option value="">Select Theater</option>
                    {theaters.map((theater) => (
                      <option key={theater._id} value={theater._id}>
                        {theater.name} - {theater.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>GST Number</label>
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>FSSAI License</label>
                  <input
                    type="text"
                    value={formData.foodLicenseNumber}
                    onChange={(e) => setFormData({ ...formData, foodLicenseNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Delivery Time (minutes)</label>
                  <input
                    type="number"
                    value={formData.deliveryTime}
                    onChange={(e) => setFormData({ ...formData, deliveryTime: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-yellow-500 to-amber-500 text-black hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <><FaSpinner className="animate-spin" /> Processing...</>
                  ) : (
                    <><FaSave /> {editingVendor ? "Update Vendor" : "Create Vendor"}</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 rounded-xl font-semibold border"
                  style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default VendorsPage;