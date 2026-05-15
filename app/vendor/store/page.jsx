"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import {
  FaStore,
  FaTimes,
  FaUpload,
  FaClock,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaIdCard,
  FaCheckCircle,
  FaArrowLeft,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";
import { createOrUpdateStore } from "../../services/adminCommunication";

function AddStorePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    storeName: "",
    description: "",
    contactNumber: "",
    address: "",
    assignedTheater: "",
    gstNumber: "",
    fssaiLicense: "",
    openingTime: "10:00",
    closingTime: "22:00",
  });

  const [selectedLogo, setSelectedLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // Create Store Mutation
  const createStoreMutation = useMutation({
    mutationFn: (data) => createOrUpdateStore(data),
    onSuccess: (response) => {
      toast.success("Store created successfully!");
      queryClient.invalidateQueries(["vendor-my-store"]);
      setTimeout(() => {
        router.push("/vendor/store");
      }, 1500);
    },
    onError: (error) => {
      toast.error("Failed to create store: " + error.message);
    },
  });

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle Logo File Change
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.storeName.trim()) {
      toast.error("Store name is required");
      return;
    }
    if (!formData.contactNumber.trim()) {
      toast.error("Contact number is required");
      return;
    }
    if (!formData.address.trim()) {
      toast.error("Address is required");
      return;
    }
    if (!formData.assignedTheater.trim()) {
      toast.error("Assigned theater is required");
      return;
    }

    // Create FormData for API
    const submitData = new FormData();
    submitData.append("storeName", formData.storeName);
    submitData.append("description", formData.description);
    submitData.append("contactNumber", formData.contactNumber);
    submitData.append("address", formData.address);
    submitData.append("assignedTheater", formData.assignedTheater);
    submitData.append("gstNumber", formData.gstNumber);
    submitData.append("fssaiLicense", formData.fssaiLicense);
    submitData.append("openingTime", formData.openingTime);
    submitData.append("closingTime", formData.closingTime);

    if (selectedLogo) {
      submitData.append("storeLogo", selectedLogo);
    }

    createStoreMutation.mutate(submitData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 px-4">
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <FaStore className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Create Your Store</h1>
              <p className="text-gray-400 mt-1">Fill in the details to register your food store</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
          {/* Logo Upload Section */}
          <div className="p-6 border-b border-gray-700">
            <label className="block text-white font-medium mb-2">Store Logo</label>
            <div className="flex items-center gap-6">
              <div
                className={`w-28 h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                  logoPreview
                    ? "border-green-500 bg-green-500/10"
                    : "border-gray-600 hover:border-purple-500"
                }`}
                onClick={() => document.getElementById("logoInput").click()}
              >
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <>
                    <FaUpload className="text-gray-400 text-2xl mb-1" />
                    <span className="text-xs text-gray-500">Upload Logo</span>
                  </>
                )}
              </div>
              <input
                id="logoInput"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
              <div className="flex-1">
                <p className="text-sm text-gray-400">
                  Recommended: Square image, at least 200x200px
                </p>
                {selectedLogo && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLogo(null);
                      setLogoPreview(null);
                    }}
                    className="text-red-400 text-sm mt-2 hover:text-red-300"
                  >
                    Remove Logo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="p-6 space-y-5">
            {/* Store Name */}
            <div>
              <label className="block text-white font-medium mb-2">
                Store Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <FaStore className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleChange}
                  placeholder="e.g., Food Corner PVR"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-white font-medium mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Describe your store, specialties, etc."
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              />
            </div>

            {/* Contact Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Contact Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              {/* Assigned Theater */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Assigned Theater ID <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FaBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    name="assignedTheater"
                    value={formData.assignedTheater}
                    onChange={handleChange}
                    placeholder="Theater ID (e.g., 69e9c32ed6d20d1b792b023e)"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Enter the theater ID where this store will operate</p>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-white font-medium mb-2">
                Address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-500" />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Full address of the store"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                />
              </div>
            </div>

            {/* GST & FSSAI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">GST Number</label>
                <div className="relative">
                  <FaIdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    placeholder="27AAAAA1234B1Z"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">FSSAI License</label>
                <input
                  type="text"
                  name="fssaiLicense"
                  value={formData.fssaiLicense}
                  onChange={handleChange}
                  placeholder="FSSAI-1234567890"
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            {/* Opening & Closing Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Opening Time <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FaClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="time"
                    name="openingTime"
                    value={formData.openingTime}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Closing Time <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FaClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="time"
                    name="closingTime"
                    value={formData.closingTime}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="p-6 border-t border-gray-700 bg-gray-900/30">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createStoreMutation.isLoading}
                className="flex-1 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {createStoreMutation.isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating Store...
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="w-4 h-4" />
                    Create Store
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Info Note */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-400">
            <strong>Note:</strong> After creating your store, you can:
            <br />
            • Add products to your menu
            <br />
            • Manage orders from customers
            <br />
            • Track sales and revenue
            <br />
            • Update store settings anytime
          </p>
        </div>
      </div>
    </div>
  );
}

export default AddStorePage;