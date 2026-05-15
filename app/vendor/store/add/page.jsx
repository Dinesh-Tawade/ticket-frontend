"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import {
  FaBox,
  FaUpload,
  FaTag,
  FaRupeeSign,
  FaPercent,
  FaLayerGroup,
  FaClock,
  FaLeaf,
  FaUtensils,
  FaArrowLeft,
  FaCheckCircle,
  FaTimes,
  FaInfoCircle
} from "react-icons/fa";
import { addProduct } from "../../../services/adminCommunication";

function AddProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "POPCORN",
    price: "",
    discountPrice: "",
    stock: "",
    unit: "PACKET",
    isVegetarian: true,
    preparationTime: "5",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Product Categories
  const categories = [
    "POPCORN",
    "BEVERAGES",
    "COMBO",
    "SNACKS",
    "BURGERS",
    "PIZZA",
    "ICE_CREAM",
    "CANDY",
    "HOT_DOGS",
    "NACHOS",
    "SANDWICH",
    "FRIES"
  ];

  // Units
  const units = ["PACKET", "PIECE", "BOTTLE", "CUP", "BUCKET", "PLATE", "BOX"];

  // Add Product Mutation
  const addProductMutation = useMutation({
    mutationFn: (data) => addProduct(data),
    onSuccess: (response) => {
      toast.success("Product added successfully!");
      queryClient.invalidateQueries(["vendor-products"]);
      setTimeout(() => {
        router.push("/vendor/products");
      }, 1500);
    },
    onError: (error) => {
      toast.error("Failed to add product: " + error.message);
    },
  });

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle Image Change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("Valid price is required");
      return;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      toast.error("Valid stock quantity is required");
      return;
    }
    if (!selectedImage) {
      toast.error("Product image is required");
      return;
    }

    // Create FormData for API
    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("description", formData.description);
    submitData.append("category", formData.category);
    submitData.append("price", formData.price);
    submitData.append("discountPrice", formData.discountPrice || "");
    submitData.append("stock", formData.stock);
    submitData.append("unit", formData.unit);
    submitData.append("isVegetarian", formData.isVegetarian);
    submitData.append("preparationTime", formData.preparationTime);
    submitData.append("image", selectedImage);

    addProductMutation.mutate(submitData);
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
            Back to Products
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl">
              <FaBox className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Add New Product</h1>
              <p className="text-gray-400 mt-1">Add items to your store menu</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
          {/* Image Upload Section */}
          <div className="p-6 border-b border-gray-700">
            <label className="block text-white font-medium mb-2">
              Product Image <span className="text-red-400">*</span>
            </label>
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div
                className={`w-32 h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                  imagePreview
                    ? "border-green-500 bg-green-500/10"
                    : "border-gray-600 hover:border-green-500"
                }`}
                onClick={() => document.getElementById("imageInput").click()}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <>
                    <FaUpload className="text-gray-400 text-3xl mb-2" />
                    <span className="text-xs text-gray-500">Upload Image</span>
                  </>
                )}
              </div>
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="flex-1">
                <p className="text-sm text-gray-400">
                  Recommended: Square image, at least 500x500px
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: JPG, PNG, WEBP (Max 5MB)
                </p>
                {selectedImage && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                    className="text-red-400 text-sm mt-2 hover:text-red-300 flex items-center gap-1"
                  >
                    <FaTimes className="w-3 h-3" />
                    Remove Image
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="p-6 space-y-5">
            {/* Product Name */}
            <div>
              <label className="block text-white font-medium mb-2">
                Product Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <FaTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Caramel Popcorn, Cold Drink, Nachos Combo"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
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
                placeholder="Describe your product - ingredients, taste, special features..."
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors resize-none"
              />
            </div>

            {/* Category & Unit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Category <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FaLayerGroup className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors appearance-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Unit <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FaBox className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors"
                  >
                    {units.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Price & Discount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Price (₹) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FaRupeeSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="120"
                    step="0.01"
                    min="0"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Discount Price (₹)
                </label>
                <div className="relative">
                  <FaPercent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="number"
                    name="discountPrice"
                    value={formData.discountPrice}
                    onChange={handleChange}
                    placeholder="100"
                    step="0.01"
                    min="0"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                  />
                </div>
                {formData.discountPrice && parseFloat(formData.discountPrice) < parseFloat(formData.price) && (
                  <p className="text-xs text-green-400 mt-1">
                    Save ₹{parseFloat(formData.price) - parseFloat(formData.discountPrice)}!
                  </p>
                )}
              </div>
            </div>

            {/* Stock & Preparation Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Stock Quantity <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="150"
                  min="0"
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Preparation Time (minutes)
                </label>
                <div className="relative">
                  <FaClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="number"
                    name="preparationTime"
                    value={formData.preparationTime}
                    onChange={handleChange}
                    placeholder="5"
                    min="0"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Vegetarian Option */}
            <div className="flex items-center gap-3 p-4 bg-gray-900/50 rounded-lg">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isVegetarian: !prev.isVegetarian }))}
                className={`w-12 h-6 rounded-full transition-all ${
                  formData.isVegetarian ? "bg-green-500" : "bg-gray-600"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                    formData.isVegetarian ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <div className="flex items-center gap-2">
                {formData.isVegetarian ? (
                  <FaLeaf className="text-green-400 text-lg" />
                ) : (
                  <FaUtensils className="text-orange-400 text-lg" />
                )}
                <span className="text-white">
                  {formData.isVegetarian ? "Vegetarian" : "Non-Vegetarian"}
                </span>
              </div>
              <FaInfoCircle className="text-gray-500 text-sm ml-auto cursor-help" title="Toggle between veg and non-veg" />
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
                disabled={addProductMutation.isLoading}
                className="flex-1 px-6 py-2.5 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {addProductMutation.isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Adding Product...
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="w-4 h-4" />
                    Add Product to Menu
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Tips Section */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="text-blue-400 font-medium mb-1">📸 High Quality Images</h4>
            <p className="text-xs text-gray-400">Upload clear, appetizing product images to attract customers</p>
          </div>
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <h4 className="text-green-400 font-medium mb-1">💰 Competitive Pricing</h4>
            <p className="text-xs text-gray-400">Set competitive prices and offer discounts for better sales</p>
          </div>
          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <h4 className="text-purple-400 font-medium mb-1">📦 Stock Management</h4>
            <p className="text-xs text-gray-400">Keep track of inventory and update stock regularly</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddProductPage;