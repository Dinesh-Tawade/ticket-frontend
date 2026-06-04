"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  FaStore,
  FaToggleOn,
  FaToggleOff,
  FaSpinner,
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaMapMarkerAlt,
  FaPhone,
} from "react-icons/fa";
import { IoRefreshOutline } from "react-icons/io5";
import { getMyStore, toggleStoreStatus } from "../../services/adminCommunication";

function StoreSettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch store details
  const { data: storeData, isLoading, refetch } = useQuery({
    queryKey: ["my-store"],
    queryFn: getMyStore,
  });

  const store = storeData?.data;

  // Toggle store status mutation
  const toggleMutation = useMutation({
    mutationFn: toggleStoreStatus,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries(["my-store"]);
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update store status");
    },
  });

  const handleToggle = () => {
    toggleMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl py-20" style={{ background: "var(--background)" }}>
        <IoRefreshOutline className="mb-4 animate-spin text-4xl text-blue-500" />
        <p style={{ color: "var(--foreground)", opacity: 0.65 }}>Loading store settings...</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl py-20" style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10">
            <FaStore className="text-5xl text-blue-500" />
          </div>
          <h2 className="mb-2 text-xl font-semibold" style={{ color: "var(--foreground)" }}>No Store Found</h2>
          <p className="mb-6" style={{ color: "var(--foreground)", opacity: 0.6 }}>Please create your store first.</p>
          <button
            onClick={() => router.push("/vendor/store/add")}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Create Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300 py-8 px-4" style={{ background: "var(--background)" }}>
      <Toaster 
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: "var(--card)",
            color: "var(--foreground)",
            border: "1px solid var(--card-border)",
          },
        }}
      />

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="relative border-b shadow-lg transition-all duration-300 rounded-xl mb-8" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
          <div className="px-8 py-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 hover:text-white transition-colors mb-4" style={{ color: "var(--foreground)", opacity: 0.7 }}
            >
              <FaArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 animate-pulse blur-lg opacity-50" />
                  <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
                    <FaStore className="text-white text-xl" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
                    Store Settings
                  </h1>
                  <p className="text-xs font-medium" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                    Manage your store status and settings
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Status Card */}
        <div className="rounded-xl" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
          {/* Store Info */}
          <div className="p-6" style={{ borderBottom: "1px solid var(--card-border)" }}>
            <div className="flex items-start gap-4">
              {store.storeLogo ? (
                <img
                  src={store.storeLogo}
                  alt={store.storeName}
                  className="w-20 h-20 rounded-xl object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                  <FaStore className="text-3xl text-blue-500" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>{store.storeName}</h2>
                <div className="flex items-center gap-3 mt-1 text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                  <span className="flex items-center gap-1">
                    <FaMapMarkerAlt size={12} />
                    {store.address?.substring(0, 50)}...
                  </span>
                  <span className="flex items-center gap-1">
                    <FaPhone size={12} />
                    {store.contactNumber}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>
                  <span className="flex items-center gap-1">
                    <FaClock size={10} />
                    {store.openingTime} - {store.closingTime}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Toggle Section */}
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>Store Status</h3>
                <p className="text-sm mt-1" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                  {store.isOpen
                    ? "Your store is currently OPEN and accepting orders"
                    : "Your store is currently CLOSED and not accepting orders"}
                </p>
              </div>
              <button
                onClick={handleToggle}
                disabled={toggleMutation.isPending}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  store.isOpen
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                } disabled:opacity-50`}
              >
                {toggleMutation.isPending ? (
                  <FaSpinner className="animate-spin" />
                ) : store.isOpen ? (
                  <>
                    <FaToggleOn size={24} />
                    Close Store
                  </>
                ) : (
                  <>
                    <FaToggleOff size={24} />
                    Open Store
                  </>
                )}
              </button>
            </div>

            {/* Status Indicator */}
            <div className="mt-4 flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  store.isOpen ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              />
              <span className={`text-sm ${store.isOpen ? "text-green-400" : "text-red-400"}`}>
                {store.isOpen ? "Store is OPEN" : "Store is CLOSED"}
              </span>
            </div>
          </div>

          {/* Info Note */}
          <div className="p-4" style={{ background: "var(--background)", borderTop: "1px solid var(--card-border)" }}>
            <p className="text-xs text-center" style={{ color: "var(--foreground)", opacity: 0.5 }}>
              When your store is closed, customers will not be able to place orders.
              You can open it anytime from here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoreSettingsPage;