"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import {
  FaStore,
  FaUpload,
  FaClock,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaIdCard,
  FaCheckCircle,
  FaArrowLeft,
  FaInfoCircle,
  FaSpinner,
} from "react-icons/fa";
import { createOrUpdateStore, getMyStore } from "../../services/adminCommunication";
import { getCurrentUser } from "../../services/adminCommunication";

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
  const [assignedTheaterName, setAssignedTheaterName] = useState("");
  const [isLoadingTheater, setIsLoadingTheater] = useState(true);
  const [storeExists, setStoreExists] = useState(false);

  // Get current vendor data from localStorage
  const currentUser = getCurrentUser();
  const assignedTheaterId = currentUser?.assignedTheater;


  console.log("Current User:", currentUser);
  // Check if store already exists
  const { data: existingStore, isLoading: storeLoading, refetch } = useQuery({
    queryKey: ["vendor-my-store"],
    queryFn: getMyStore,
    retry: false,
  });

  // If store exists, redirect
  useEffect(() => {
    if (existingStore?.data) {
      setStoreExists(true);
      // Redirect to store page after 2 seconds
      setTimeout(() => {
        router.push("/vendor/store");
      }, 2000);
    }
  }, [existingStore, router]);

  // Set assigned theater ID when vendor data loads
  useEffect(() => {
    if (assignedTheaterId) {
      console.log("Assigned Theater ID from vendor:", assignedTheaterId);
      setFormData(prev => ({
        ...prev,
        assignedTheater: assignedTheaterId
      }));
      fetchTheaterName(assignedTheaterId);
    } else {
      setIsLoadingTheater(false);
      console.log("No assigned theater found for this vendor");
    }
  }, [assignedTheaterId]);

  // Fetch theater name by ID
  const fetchTheaterName = async (theaterId) => {
    setIsLoadingTheater(true);
    try {
      console.log("Fetching theater name for ID:", theaterId);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BE_URL}/public/theaters`);
      const data = await response.json();
      
      const theater = data.data?.find(t => t._id === theaterId);
      if (theater) {
        setAssignedTheaterName(`${theater.name} - ${theater.city}, ${theater.state}`);
      } else {
        setAssignedTheaterName(`Theater ID: ${theaterId}`);
      }
    } catch (error) {
      console.error("Failed to fetch theater name:", error);
      setAssignedTheaterName(`Theater ID: ${theaterId}`);
    } finally {
      setIsLoadingTheater(false);
    }
  };

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
      console.error("Create store error:", error);
      toast.error("Failed to create store: " + (error.response?.data?.message || error.message));
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();

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

    console.log("Submitting store with assignedTheater:", formData.assignedTheater);
    createStoreMutation.mutate(submitData);
  };

  // Loading state
  if (storeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <FaSpinner className="animate-spin text-3xl text-purple-500" />
      </div>
    );
  }

  // If store already exists, show message
  if (storeExists || existingStore?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-xl p-6 text-center">
          <FaStore className="text-6xl text-purple-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Store Already Exists!</h2>
          <p className="text-gray-400 mb-6">
            You have already created a store. Redirecting to your store page...
          </p>
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

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
          {/* Logo Upload */}
          <div className="p-6 border-b border-gray-700">
            <label className="block text-white font-medium mb-2">Store Logo</label>
            <div className="flex items-center gap-6 flex-wrap">
              <div
                className={`w-28 h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                  logoPreview ? "border-green-500 bg-green-500/10" : "border-gray-600 hover:border-purple-500"
                }`}
                onClick={() => document.getElementById("logoInput").click()}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <>
                    <FaUpload className="text-gray-400 text-2xl mb-1" />
                    <span className="text-xs text-gray-500">Upload Logo</span>
                  </>
                )}
              </div>
              <input id="logoInput" type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              <div className="flex-1">
                <p className="text-sm text-gray-400">Recommended: Square image, at least 200x200px</p>
                {selectedLogo && (
                  <button type="button" onClick={() => { setSelectedLogo(null); setLogoPreview(null); }} className="text-red-400 text-sm mt-2 hover:text-red-300">
                    Remove Logo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-white font-medium mb-2">Store Name <span className="text-red-400">*</span></label>
              <div className="relative">
                <FaStore className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" name="storeName" value={formData.storeName} onChange={handleChange} placeholder="e.g., Food Corner PVR" className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500" />
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Describe your store, specialties, etc." className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">Contact Number <span className="text-red-400">*</span></label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} placeholder="9876543210" className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500" />
                </div>
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Address <span className="text-red-400">*</span></label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-500" />
                  <textarea name="address" value={formData.address} onChange={handleChange} rows="1" placeholder="Full address of the store" className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none" />
                </div>
              </div>
            </div>

            {/* Assigned Theater */}
            <div>
              <label className="block text-white font-medium mb-2">Assigned Theater <span className="text-red-400">*</span></label>
              <div className="relative">
                <FaBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                {isLoadingTheater ? (
                  <div className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-gray-400">
                    <FaSpinner className="animate-spin inline mr-2" size={14} />
                    Loading theater...
                  </div>
                ) : (
                  <input type="text" value={assignedTheaterName} disabled className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 cursor-not-allowed" />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                <FaInfoCircle className="inline mr-1 text-xs" />
                This theater is assigned to your vendor account and cannot be changed
              </p>
              <input type="hidden" name="assignedTheater" value={formData.assignedTheater} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">GST Number</label>
                <div className="relative">
                  <FaIdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange} placeholder="27AAAAA1234B1Z" className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500" />
                </div>
              </div>
              <div>
                <label className="block text-white font-medium mb-2">FSSAI License</label>
                <input type="text" name="fssaiLicense" value={formData.fssaiLicense} onChange={handleChange} placeholder="FSSAI-1234567890" className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">Opening Time <span className="text-red-400">*</span></label>
                <div className="relative">
                  <FaClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="time" name="openingTime" value={formData.openingTime} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500" />
                </div>
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Closing Time <span className="text-red-400">*</span></label>
                <div className="relative">
                  <FaClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="time" name="closingTime" value={formData.closingTime} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="p-6 border-t border-gray-700 bg-gray-900/30">
            <div className="flex flex-col sm:flex-row gap-3">
              <button type="button" onClick={() => router.back()} className="px-6 py-2.5 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={createStoreMutation.isPending} className="flex-1 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {createStoreMutation.isPending ? (
                  <><FaSpinner className="animate-spin" /> Creating Store...</>
                ) : (
                  <><FaCheckCircle className="w-4 h-4" /> Create Store</>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddStorePage;