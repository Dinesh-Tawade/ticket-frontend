"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import {
  FaSave,
  FaArrowLeft,
  FaUpload,
  FaTimes,
  FaLeaf,
  FaUtensils,
  FaSpinner,
  FaTrash,
  FaEdit
} from "react-icons/fa";
import {
  getProductById,
  updateProduct
} from "../../../../services/adminCommunication";

function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id;
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(true);
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
  const [existingImage, setExistingImage] = useState("");

  // Categories & Units
  const categories = [
    "POPCORN", "BEVERAGES", "COMBO", "SNACKS", "BURGERS", 
    "PIZZA", "ICE_CREAM", "CANDY", "HOT_DOGS", "NACHOS", 
    "SANDWICH", "FRIES"
  ];
  
  const units = ["PACKET", "PIECE", "BOTTLE", "CUP", "BUCKET", "PLATE", "BOX"];

  // Fetch Product Details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await getProductById(productId);
        const product = res.data;
        
        // Set form data with actual values
        setFormData({
          name: product.name || "",
          description: product.description || "",
          category: product.category || "POPCORN",
          price: product.price?.toString() || "",
          discountPrice: product.discountPrice?.toString() || "",
          stock: product.stock?.toString() || "",
          unit: product.unit || "PACKET",
          isVegetarian: product.isVegetarian ?? true,
          preparationTime: product.preparationTime?.toString() || "5",
        });
        
        if (product.image) {
          setExistingImage(product.image);
          setImagePreview(`${process.env.NEXT_PUBLIC_BE_URL}/${product.image}`);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to load product: " + error.message);
        router.push("/vendor/products");
      } finally {
        setLoading(false);
      }
    };
    
    if (productId) {
      fetchProduct();
    }
  }, [productId, router]);

  // Update Product Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => {
      toast.success("Product updated successfully!");
      queryClient.invalidateQueries(["vendor-products"]);
      setTimeout(() => {
        router.push("/vendor/products");
      }, 1500);
    },
    onError: (error) => {
      toast.error("Failed to update: " + error.message);
    },
  });

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle Image Change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Remove Image
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setExistingImage("");
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

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("description", formData.description);
    submitData.append("category", formData.category);
    submitData.append("price", formData.price);
    submitData.append("stock", formData.stock);
    submitData.append("unit", formData.unit);
    submitData.append("isVegetarian", formData.isVegetarian);
    submitData.append("preparationTime", formData.preparationTime);
    
    if (formData.discountPrice) {
      submitData.append("discountPrice", formData.discountPrice);
    }
    
    if (selectedImage) {
      submitData.append("image", selectedImage);
    }

    updateMutation.mutate({ id: productId, data: submitData });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] transition-colors duration-300" style={{ background: "var(--background)" }}>
        <FaSpinner className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="mt-3 font-medium" style={{ color: "var(--foreground)", opacity: 0.6 }}>Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300 p-6" style={{ background: "var(--background)" }}>
      <Toaster position="top-right" />
      
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="relative border-b shadow-lg transition-all duration-300 rounded-xl mb-8" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
          <div className="px-8 py-4">
            <button 
              onClick={() => router.back()} 
              className="flex items-center gap-2 hover:opacity-100 transition-opacity mb-4 font-medium" style={{ color: "var(--foreground)", opacity: 0.7 }}
            >
              <FaArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 animate-pulse blur-lg opacity-50" />
                  <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl">
                    <FaEdit className="text-white text-xl" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
                    Edit Product
                  </h1>
                  <p className="text-xs font-medium" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                    Update product information
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="rounded-xl overflow-hidden shadow-lg border" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
          {/* Image Section */}
          <div className="p-5 border-b" style={{ borderColor: "var(--card-border)" }}>
            <label className="block font-medium mb-2" style={{ color: "var(--foreground)" }}>Product Image</label>
            <div className="flex flex-wrap items-start gap-5">
              <div
                onClick={() => document.getElementById("imageInput").click()}
                className={`w-28 h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                  imagePreview ? "border-amber-500 bg-amber-500/10" : "hover:border-amber-500"
                }`}
                style={!imagePreview ? { borderColor: "var(--card-border)" } : {}}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <>
                    <FaUpload className="text-2xl mb-1 opacity-50" style={{ color: "var(--foreground)" }} />
                    <span className="text-xs font-medium opacity-50" style={{ color: "var(--foreground)" }}>Upload</span>
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
              
              {(imagePreview || existingImage) && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors"
                >
                  <FaTrash className="w-3 h-3" />
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs font-medium mt-2 opacity-50" style={{ color: "var(--foreground)" }}>Recommended: Square image, JPG/PNG, Max 5MB</p>
          </div>

          {/* Form Fields */}
          <div className="p-5 space-y-4">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>
                Product Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-colors"
                style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>Description</label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your product..."
                className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-colors resize-none"
                style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
              />
            </div>

            {/* Category & Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-colors"
                  style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat.replace("_", " ")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>Unit</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-colors"
                  style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price & Discount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>
                  Price (₹) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-colors"
                  style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>Discount Price (₹)</label>
                <input
                  type="number"
                  name="discountPrice"
                  value={formData.discountPrice}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-colors"
                  style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                  min="0"
                  step="0.01"
                />
                {formData.discountPrice && parseFloat(formData.discountPrice) < parseFloat(formData.price) && (
                  <p className="text-xs text-green-500 mt-1 font-medium">
                    Save ₹{parseFloat(formData.price) - parseFloat(formData.discountPrice)} per item!
                  </p>
                )}
              </div>
            </div>

            {/* Stock & Preparation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>
                  Stock Quantity <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-colors"
                  style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>Preparation Time (minutes)</label>
                <input
                  type="number"
                  name="preparationTime"
                  value={formData.preparationTime}
                  onChange={handleChange}
                  placeholder="5"
                  className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-colors"
                  style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                  min="0"
                />
              </div>
            </div>

            {/* Vegetarian Toggle */}
            <div className="flex items-center justify-between p-3 border rounded-lg" style={{ background: "var(--background)", borderColor: "var(--card-border)" }}>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isVegetarian: !prev.isVegetarian }))}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                    formData.isVegetarian ? "bg-green-500" : "bg-gray-400 dark:bg-gray-600"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${
                      formData.isVegetarian ? "right-0.5" : "left-0.5"
                    }`}
                  />
                </button>
                <div className="flex items-center gap-2">
                  {formData.isVegetarian ? (
                    <FaLeaf className="text-green-500 text-lg" />
                  ) : (
                    <FaUtensils className="text-orange-500 text-lg" />
                  )}
                  <span className="font-medium" style={{ color: "var(--foreground)" }}>
                    {formData.isVegetarian ? "Vegetarian" : "Non-Vegetarian"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-5 border-t flex flex-col sm:flex-row gap-3" style={{ background: "var(--background)", borderColor: "var(--card-border)" }}>
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
              disabled={updateMutation.isLoading}
              className="flex-1 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              {updateMutation.isLoading ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProductPage;