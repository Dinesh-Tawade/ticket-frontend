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
  FaChevronDown,
} from "react-icons/fa";
import { createOrUpdateStore, getMyStore, getAllTheatersAdmin } from "../../services/adminCommunication";
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
  const [storeExists, setStoreExists] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Get current vendor data
  const currentUser = getCurrentUser();
  const vendorTheaterId = currentUser?.assignedTheater;

  // Fetch all theaters for dropdown
  const { 
    data: theatersData, 
    isLoading: theatersLoading,
    error: theatersError 
  } = useQuery({
    queryKey: ["all-theaters"],
    queryFn: getAllTheatersAdmin,
    enabled: true, // Always fetch theaters
    retry: false,
  });

  // Filter theaters - only show the vendor's assigned theater if they have one
  const availableTheaters = React.useMemo(() => {
    if (!theatersData?.data) return [];
    
    if (vendorTheaterId) {
      // Vendor has an assigned theater, only show that one
      return theatersData.data.filter(theater => theater._id === vendorTheaterId);
    }
    
    // Super admin or vendor without assigned theater - show all theaters
    return theatersData.data;
  }, [theatersData, vendorTheaterId]);

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
      setTimeout(() => {
        router.push("/vendor/dashboard");
      }, 2000);
    }
  }, [existingStore, router]);

  // Set default assigned theater if vendor has one
  useEffect(() => {
    if (vendorTheaterId && availableTheaters.length > 0) {
      const vendorTheater = availableTheaters.find(t => t._id === vendorTheaterId);
      if (vendorTheater) {
        setFormData(prev => ({
          ...prev,
          assignedTheater: vendorTheaterId
        }));
      }
    }
  }, [vendorTheaterId, availableTheaters]);

  // Create Store Mutation
  const createStoreMutation = useMutation({
    mutationFn: (data) => createOrUpdateStore(data),
    onSuccess: (response) => {
      toast.success("Store created successfully!");
      queryClient.invalidateQueries(["vendor-my-store"]);
      setTimeout(() => {
        router.push("/vendor/dashboard");
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

  const handleTheaterSelect = (theaterId, theaterName) => {
    setFormData(prev => ({
      ...prev,
      assignedTheater: theaterId
    }));
    setIsDropdownOpen(false);
    toast.success(`Selected: ${theaterName}`);
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
    if (!formData.assignedTheater) {
      toast.error("Please select an assigned theater");
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

  const getSelectedTheaterName = () => {
    if (!formData.assignedTheater) return "Select a theater";
    const theater = availableTheaters.find(t => t._id === formData.assignedTheater);
    if (theater) {
      return `${theater.name} - ${theater.city}, ${theater.state}`;
    }
    return "Select a theater";
  };

  // Loading state
  if (storeLoading || theatersLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center transition-colors duration-300" style={{ background: "var(--background)" }}>
        <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
        <p style={{ color: "var(--foreground)", opacity: 0.7 }}>Loading store data...</p>
      </div>
    );
  }

  // Error state
  if (theatersError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 transition-colors duration-300" style={{ background: "var(--background)" }}>
        <div className="max-w-md w-full rounded-xl p-6 text-center border shadow-xl" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
          <FaInfoCircle className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--foreground)" }}>Error Loading Theaters</h2>
          <p className="mb-6" style={{ color: "var(--foreground)", opacity: 0.7 }}>
            There was a problem connecting to the server. Please check your connection or contact support.
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // If store already exists, show message
  if (storeExists || existingStore?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 transition-colors duration-300" style={{ background: "var(--background)" }}>
        <div className="max-w-md w-full rounded-xl p-6 text-center border shadow-xl" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
          <FaStore className="text-6xl text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--foreground)" }}>Store Already Exists!</h2>
          <p className="mb-6" style={{ color: "var(--foreground)", opacity: 0.7 }}>
            You have already created a store. Redirecting to your dashboard...
          </p>
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // If no theaters available
  if (availableTheaters.length === 0 && !vendorTheaterId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 transition-colors duration-300" style={{ background: "var(--background)" }}>
        <div className="max-w-md w-full rounded-xl p-6 text-center border shadow-xl" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
          <FaBuilding className="text-6xl text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--foreground)" }}>No Theaters Available</h2>
          <p className="mb-6" style={{ color: "var(--foreground)", opacity: 0.7 }}>
            No theaters are available to assign to your store. Please contact the administrator.
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300 pb-8" style={{ background: "var(--background)" }}>
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 hover:opacity-100 transition-opacity mb-2 text-sm font-semibold" style={{ color: "var(--foreground)", opacity: 0.7 }}
            >
              <FaArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
              Create Your Store
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--foreground)", opacity: 0.6 }}>
              Fill in the details to register your food store
            </p>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="rounded-xl overflow-hidden shadow-lg" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          {/* Logo Upload */}
          <div className="p-6 border-b" style={{ borderColor: "var(--card-border)" }}>
            <label className="block font-medium mb-2" style={{ color: "var(--foreground)" }}>Store Logo</label>
            <div className="flex items-center gap-6 flex-wrap">
              <div
                className={`w-28 h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                  logoPreview ? "border-green-500 bg-green-500/10" : "hover:border-blue-500"
                }`}
                style={!logoPreview ? { borderColor: "var(--card-border)" } : {}}
                onClick={() => document.getElementById("logoInput").click()}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <>
                    <FaUpload className="text-2xl mb-1" style={{ color: "var(--foreground)", opacity: 0.4 }} />
                    <span className="text-xs font-medium" style={{ color: "var(--foreground)", opacity: 0.6 }}>Upload Logo</span>
                  </>
                )}
              </div>
              <input id="logoInput" type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: "var(--foreground)", opacity: 0.5 }}>Recommended: Square image, at least 200x200px</p>
                {selectedLogo && (
                  <button type="button" onClick={() => { setSelectedLogo(null); setLogoPreview(null); }} className="text-red-400 text-sm mt-2 font-medium hover:text-red-300 transition-colors">
                    Remove Logo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="p-6 space-y-5">
            <div>
              <label className="block font-medium mb-2" style={{ color: "var(--foreground)" }}>Store Name <span className="text-red-400">*</span></label>
              <div className="relative">
                <FaStore className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" style={{ color: "var(--foreground)" }} />
                <input 
                  type="text" 
                  name="storeName" 
                  value={formData.storeName} 
                  onChange={handleChange} 
                  placeholder="e.g., Food Corner PVR" 
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" 
                  style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                />
              </div>
            </div>

            <div>
              <label className="block font-medium mb-2" style={{ color: "var(--foreground)" }}>Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                rows="3" 
                placeholder="Describe your store, specialties, etc." 
                className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none" 
                style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-2" style={{ color: "var(--foreground)" }}>Contact Number <span className="text-red-400">*</span></label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" style={{ color: "var(--foreground)" }} />
                  <input 
                    type="tel" 
                    name="contactNumber" 
                    value={formData.contactNumber} 
                    onChange={handleChange} 
                    placeholder="9876543210" 
                    className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" 
                    style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium mb-2" style={{ color: "var(--foreground)" }}>Address <span className="text-red-400">*</span></label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-3 opacity-50" style={{ color: "var(--foreground)" }} />
                  <textarea 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    rows="1" 
                    placeholder="Full address of the store" 
                    className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none" 
                    style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                  />
                </div>
              </div>
            </div>

            {/* Assigned Theater - Dropdown */}
            <div>
              <label className="block font-medium mb-2" style={{ color: "var(--foreground)" }}>Assigned Theater <span className="text-red-400">*</span></label>
              <div className="relative">
                <FaBuilding className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 z-10" style={{ color: "var(--foreground)" }} />
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full pl-10 pr-10 py-2.5 border rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-blue-500/50 flex items-center justify-between transition-all"
                  style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                  disabled={vendorTheaterId && availableTheaters.length === 1}
                >
                  <span style={{ opacity: !formData.assignedTheater ? 0.5 : 1 }}>
                    {getSelectedTheaterName()}
                  </span>
                  <FaChevronDown className={`transition-transform opacity-50 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute z-20 w-full mt-1 border rounded-lg shadow-xl max-h-60 overflow-y-auto" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
                    {availableTheaters.map((theater) => (
                      <button
                        key={theater._id}
                        type="button"
                        onClick={() => handleTheaterSelect(theater._id, theater.name)}
                        className="w-full px-4 py-2.5 text-left transition-colors flex flex-col hover:bg-black/10 dark:hover:bg-white/5"
                        style={{ color: "var(--foreground)" }}
                      >
                        <span className="font-medium">{theater.name}</span>
                        <span className="text-xs" style={{ opacity: 0.6 }}>
                          {theater.city}, {theater.state} - {theater.pincode}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs mt-1.5 font-medium" style={{ color: "var(--foreground)", opacity: 0.5 }}>
                <FaInfoCircle className="inline mr-1 text-xs" />
                {vendorTheaterId 
                  ? "This theater is assigned to your vendor account. You can only create a store for this theater."
                  : "Select the theater where your store will operate"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-2" style={{ color: "var(--foreground)" }}>GST Number</label>
                <div className="relative">
                  <FaIdCard className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" style={{ color: "var(--foreground)" }} />
                  <input 
                    type="text" 
                    name="gstNumber" 
                    value={formData.gstNumber} 
                    onChange={handleChange} 
                    placeholder="27AAAAA1234B1Z" 
                    className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" 
                    style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium mb-2" style={{ color: "var(--foreground)" }}>FSSAI License</label>
                <input 
                  type="text" 
                  name="fssaiLicense" 
                  value={formData.fssaiLicense} 
                  onChange={handleChange} 
                  placeholder="FSSAI-1234567890" 
                  className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" 
                  style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-2" style={{ color: "var(--foreground)" }}>Opening Time <span className="text-red-400">*</span></label>
                <div className="relative">
                  <FaClock className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" style={{ color: "var(--foreground)" }} />
                  <input 
                    type="time" 
                    name="openingTime" 
                    value={formData.openingTime} 
                    onChange={handleChange} 
                    className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all [color-scheme:light] dark:[color-scheme:dark]" 
                    style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium mb-2" style={{ color: "var(--foreground)" }}>Closing Time <span className="text-red-400">*</span></label>
                <div className="relative">
                  <FaClock className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" style={{ color: "var(--foreground)" }} />
                  <input 
                    type="time" 
                    name="closingTime" 
                    value={formData.closingTime} 
                    onChange={handleChange} 
                    className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all [color-scheme:light] dark:[color-scheme:dark]" 
                    style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="p-6 border-t flex flex-col sm:flex-row gap-3" style={{ background: "var(--background)", borderColor: "var(--card-border)" }}>
            <button 
              type="button" 
              onClick={() => router.back()} 
              className="px-6 py-2.5 border rounded-lg hover:opacity-80 transition-opacity font-medium"
              style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={createStoreMutation.isPending || !formData.assignedTheater} 
              className="flex-1 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              {createStoreMutation.isPending ? (
                <><FaSpinner className="animate-spin" /> Creating Store...</>
              ) : (
                <><FaCheckCircle className="w-4 h-4" /> Create Store</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddStorePage;