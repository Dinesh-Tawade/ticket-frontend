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
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <FaSpinner className="animate-spin text-3xl text-purple-500" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="text-center">
          <FaStore className="text-6xl text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Store Found</h2>
          <p className="text-gray-400 mb-6">Please create your store first.</p>
          <button
            onClick={() => router.push("/vendor/store/add")}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
          >
            Create Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 px-4">
      <Toaster position="top-right" />

      <div className="max-w-2xl mx-auto">
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
              <h1 className="text-2xl md:text-3xl font-bold text-white">Store Settings</h1>
              <p className="text-gray-400 mt-1">Manage your store status and settings</p>
            </div>
          </div>
        </div>

        {/* Store Status Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
          {/* Store Info */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-start gap-4">
              {store.storeLogo ? (
                <img
                  src={store.storeLogo}
                  alt={store.storeName}
                  className="w-20 h-20 rounded-xl object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <FaStore className="text-3xl text-purple-400" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">{store.storeName}</h2>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <FaMapMarkerAlt size={12} />
                    {store.address?.substring(0, 50)}...
                  </span>
                  <span className="flex items-center gap-1">
                    <FaPhone size={12} />
                    {store.contactNumber}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
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
                <h3 className="text-lg font-semibold text-white">Store Status</h3>
                <p className="text-sm text-gray-400 mt-1">
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
          <div className="p-4 bg-gray-900/50 border-t border-gray-700">
            <p className="text-xs text-gray-500 text-center">
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