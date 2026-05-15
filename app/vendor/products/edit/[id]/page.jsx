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
  FaTrash
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
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <FaSpinner className="w-10 h-10 text-green-500 animate-spin" />
        <p className="text-gray-400 mt-3">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Toaster position="top-right" />
      
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => router.back()} 
            className="p-2 bg-gray-800 rounded-lg text-white hover:bg-gray-700 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Product</h1>
            <p className="text-gray-400 text-sm">Update product information</p>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
          {/* Image Section */}
          <div className="p-5 border-b border-gray-700">
            <label className="block text-white font-medium mb-2">Product Image</label>
            <div className="flex flex-wrap items-start gap-5">
              <div
                onClick={() => document.getElementById("imageInput").click()}
                className={`w-28 h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                  imagePreview ? "border-green-500 bg-green-500/10" : "border-gray-600 hover:border-green-500"
                }`}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <>
                    <FaUpload className="text-gray-400 text-2xl mb-1" />
                    <span className="text-xs text-gray-500">Upload</span>
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
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                >
                  <FaTrash className="w-3 h-3" />
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">Recommended: Square image, JPG/PNG, Max 5MB</p>
          </div>

          {/* Form Fields */}
          <div className="p-5 space-y-4">
            {/* Product Name */}
            <div>
              <label className="block text-white text-sm font-medium mb-1">
                Product Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-white text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your product..."
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors resize-none"
              />
            </div>

            {/* Category & Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat.replace("_", " ")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-1">Unit</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
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
                <label className="block text-white text-sm font-medium mb-1">
                  Price (₹) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-1">Discount Price (₹)</label>
                <input
                  type="number"
                  name="discountPrice"
                  value={formData.discountPrice}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                  min="0"
                  step="0.01"
                />
                {formData.discountPrice && parseFloat(formData.discountPrice) < parseFloat(formData.price) && (
                  <p className="text-xs text-green-400 mt-1">
                    Save ₹{parseFloat(formData.price) - parseFloat(formData.discountPrice)} per item!
                  </p>
                )}
              </div>
            </div>

            {/* Stock & Preparation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-1">
                  Stock Quantity <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-1">Preparation Time (minutes)</label>
                <input
                  type="number"
                  name="preparationTime"
                  value={formData.preparationTime}
                  onChange={handleChange}
                  placeholder="5"
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                  min="0"
                />
              </div>
            </div>

            {/* Vegetarian Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isVegetarian: !prev.isVegetarian }))}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                    formData.isVegetarian ? "bg-green-500" : "bg-gray-600"
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
                    <FaLeaf className="text-green-400 text-lg" />
                  ) : (
                    <FaUtensils className="text-orange-400 text-lg" />
                  )}
                  <span className="text-white font-medium">
                    {formData.isVegetarian ? "Vegetarian" : "Non-Vegetarian"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-5 border-t border-gray-700 bg-gray-900/30 flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-2.5 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isLoading}
              className="flex-1 px-4 py-2.5 bg-green-600 rounded-lg text-white hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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