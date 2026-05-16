"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import {
  IoCubeOutline,
  IoCloudUploadOutline,
  IoPricetagOutline,
  IoCashOutline,
  IoPercentOutline,
  IoLayersOutline,
  IoTimeOutline,
  IoLeafOutline,
  IoRestaurantOutline,
  IoArrowBackOutline,
  IoCheckmarkCircleOutline,
  IoCloseOutline,
  IoInformationCircleOutline,
  IoFlameOutline,
  IoHeartOutline,
  IoMoonOutline
} from "react-icons/io5";
import { addProduct } from "../../../services/adminCommunication";

// India-Specific Categories
const categories = [
  { value: "SAMOSA", label: "🥟 Samosa", group: "Snacks" },
  { value: "PAKORA", label: "🍤 Pakora", group: "Snacks" },
  { value: "VADA_PAV", label: "🍔 Vada Pav", group: "Snacks" },
  { value: "PAV_BHAJI", label: "🍞 Pav Bhaji", group: "Snacks" },
  { value: "PANI_PURI", label: "💧 Pani Puri", group: "Snacks" },
  { value: "BHEL_PURI", label: "🥣 Bhel Puri", group: "Snacks" },
  { value: "CHAT", label: "🍲 Chaat", group: "Snacks" },
  { value: "DHOKLA", label: "🍰 Dhokla", group: "Snacks" },
  
  { value: "TEA", label: "☕ Chai", group: "Beverages" },
  { value: "MASALA_CHAI", label: "🫖 Masala Chai", group: "Beverages" },
  { value: "COFFEE", label: "☕ Coffee", group: "Beverages" },
  { value: "LASSI", label: "🥛 Lassi", group: "Beverages" },
  { value: "SOFT_DRINKS", label: "🥤 Soft Drinks", group: "Beverages" },
  { value: "JUICES", label: "🧃 Juices", group: "Beverages" },
  
  { value: "BIRYANI", label: "🍚 Biryani", group: "Main Course" },
  { value: "THALI", label: "🍽️ Thali", group: "Main Course" },
  { value: "PARATHA", label: "🫓 Paratha", group: "Main Course" },
  { value: "DOSA", label: "🥞 Dosa", group: "Main Course" },
  { value: "IDLI", label: "🥮 Idli", group: "Main Course" },
  
  { value: "BURGER", label: "🍔 Burger", group: "Fast Food" },
  { value: "PIZZA", label: "🍕 Pizza", group: "Fast Food" },
  { value: "SANDWICH", label: "🥪 Sandwich", group: "Fast Food" },
  { value: "NOODLES", label: "🍜 Noodles", group: "Fast Food" },
  { value: "MANCHURIAN", label: "🥘 Manchurian", group: "Fast Food" },
  
  { value: "GULAB_JAMUN", label: "🍩 Gulab Jamun", group: "Sweets" },
  { value: "JALEBI", label: "🟠 Jalebi", group: "Sweets" },
  { value: "RASGULLA", label: "⚪ Rasgulla", group: "Sweets" },
  { value: "KHEER", label: "🥣 Kheer", group: "Sweets" },
  { value: "ICE_CREAM", label: "🍦 Ice Cream", group: "Sweets" },
  { value: "KULFI", label: "🍨 Kulfi", group: "Sweets" },
  
  { value: "COMBO", label: "📦 Combo", group: "Combos" },
  { value: "FAMILY_PACK", label: "👨‍👩‍👧 Family Pack", group: "Combos" },
  
  { value: "OTHER", label: "📦 Other", group: "Other" }
];

const groupedCategories = categories.reduce((acc, cat) => {
  if (!acc[cat.group]) acc[cat.group] = [];
  acc[cat.group].push(cat);
  return acc;
}, {});

const units = [
  { value: "PCS", label: "Piece (टुकड़ा)" },
  { value: "PLATE", label: "Plate (प्लेट)" },
  { value: "BOWL", label: "Bowl (कटोरी)" },
  { value: "CUP", label: "Cup (कप)" },
  { value: "GLASS", label: "Glass (गिलास)" },
  { value: "BOTTLE", label: "Bottle (बोतल)" },
  { value: "PACKET", label: "Packet (पैकेट)" },
  { value: "BOX", label: "Box (बॉक्स)" },
  { value: "BUCKET", label: "Bucket (बाल्टी)" },
  { value: "COMBO", label: "Combo (कॉम्बो)" },
  { value: "DOZEN", label: "Dozen (दर्जन)" }
];

const spiceLevels = [
  { value: "NO_SPICE", label: "🌱 No Spice" },
  { value: "MILD", label: "🌿 Mild" },
  { value: "MEDIUM", label: "🔥 Medium" },
  { value: "HOT", label: "🌶️ Hot" },
  { value: "EXTRA_HOT", label: "🔥🔥 Extra Hot" }
];

function AddProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "SAMOSA",
    price: "",
    discountPrice: "",
    stock: "",
    unit: "PCS",
    isVegetarian: true,
    isJain: false,
    spiceLevel: "MEDIUM",
    preparationTime: "10",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const addProductMutation = useMutation({
    mutationFn: (data) => addProduct(data),
    onSuccess: () => {
      toast.success("Product added successfully!");
      queryClient.invalidateQueries(["vendor-products"]);
      setTimeout(() => router.push("/vendor/products"), 1500);
    },
    onError: (error) => {
      toast.error("Failed to add product: " + error.message);
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();

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

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("description", formData.description);
    submitData.append("category", formData.category);
    submitData.append("price", formData.price);
    submitData.append("discountPrice", formData.discountPrice || "");
    submitData.append("stock", formData.stock);
    submitData.append("unit", formData.unit);
    submitData.append("isVegetarian", formData.isVegetarian);
    submitData.append("isJain", formData.isJain);
    submitData.append("spiceLevel", formData.spiceLevel);
    submitData.append("preparationTime", formData.preparationTime);
    submitData.append("image", selectedImage);

    addProductMutation.mutate(submitData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 px-4">
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4">
            <IoArrowBackOutline className="w-4 h-4" />
            Back to Products
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
              <IoCubeOutline className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Add New Product</h1>
              <p className="text-gray-400 mt-1">Add Indian snacks, sweets, and beverages to your menu</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
          {/* Image Upload */}
          <div className="p-6 border-b border-gray-700">
            <label className="block text-white font-medium mb-2">Product Image <span className="text-red-400">*</span></label>
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div onClick={() => document.getElementById("imageInput").click()} className={`w-32 h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${imagePreview ? "border-green-500 bg-green-500/10" : "border-gray-600 hover:border-orange-500"}`}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <>
                    <IoCloudUploadOutline className="text-gray-400 text-3xl mb-2" />
                    <span className="text-xs text-gray-500">Upload Image</span>
                  </>
                )}
              </div>
              <input id="imageInput" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              <div className="flex-1">
                <p className="text-sm text-gray-400">Recommended: Square image, at least 500x500px</p>
                <p className="text-xs text-gray-500 mt-1">Supported formats: JPG, PNG, WEBP (Max 5MB)</p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="p-6 space-y-5">
            {/* Product Name */}
            <div>
              <label className="block text-white font-medium mb-2">Product Name <span className="text-red-400">*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Pani Puri, Samosa, Gulab Jamun" className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500" />
            </div>

            {/* Description */}
            <div>
              <label className="block text-white font-medium mb-2">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Describe your product - ingredients, taste, special features..." className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none" />
            </div>

            {/* Category */}
            <div>
              <label className="block text-white font-medium mb-2">Category <span className="text-red-400">*</span></label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500">
                <optgroup label="🥟 Snacks">
                  {groupedCategories["Snacks"]?.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                </optgroup>
                <optgroup label="☕ Beverages">
                  {groupedCategories["Beverages"]?.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                </optgroup>
                <optgroup label="🍚 Main Course">
                  {groupedCategories["Main Course"]?.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                </optgroup>
                <optgroup label="🍔 Fast Food">
                  {groupedCategories["Fast Food"]?.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                </optgroup>
                <optgroup label="🍰 Sweets">
                  {groupedCategories["Sweets"]?.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                </optgroup>
                <optgroup label="📦 Combos">
                  {groupedCategories["Combos"]?.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                </optgroup>
              </select>
            </div>

            {/* Unit & Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">Unit <span className="text-red-400">*</span></label>
                <select name="unit" value={formData.unit} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white">
                  {units.map(unit => <option key={unit.value} value={unit.value}>{unit.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Price (₹) <span className="text-red-400">*</span></label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="120" step="0.01" min="0" className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white" />
              </div>
            </div>

            {/* Discount & Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">Discount Price (₹)</label>
                <input type="number" name="discountPrice" value={formData.discountPrice} onChange={handleChange} placeholder="100" step="0.01" min="0" className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Stock Quantity <span className="text-red-400">*</span></label>
                <input type="number" name="stock" value={formData.stock} onChange={handleChange} placeholder="150" min="0" className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white" />
              </div>
            </div>

            {/* Spice Level */}
            <div>
              <label className="block text-white font-medium mb-2">Spice Level</label>
              <div className="flex flex-wrap gap-3">
                {spiceLevels.map(level => (
                  <button key={level.value} type="button" onClick={() => setFormData(prev => ({ ...prev, spiceLevel: level.value }))} className={`px-4 py-2 rounded-lg transition-all ${formData.spiceLevel === level.value ? "bg-orange-500 text-white" : "bg-gray-900 text-gray-400 hover:bg-gray-700"}`}>
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Diet Preferences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, isVegetarian: !prev.isVegetarian }))} className={`w-12 h-6 rounded-full transition-all ${formData.isVegetarian ? "bg-green-500" : "bg-gray-600"}`}>
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform transform ${formData.isVegetarian ? "translate-x-6" : "translate-x-1"}`} />
                </button>
                <div className="flex items-center gap-2">
                  <IoLeafOutline className="text-green-400 text-lg" />
                  <span className="text-white">{formData.isVegetarian ? "Vegetarian" : "Non-Vegetarian"}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, isJain: !prev.isJain }))} className={`w-12 h-6 rounded-full transition-all ${formData.isJain ? "bg-green-500" : "bg-gray-600"}`}>
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform transform ${formData.isJain ? "translate-x-6" : "translate-x-1"}`} />
                </button>
                <div className="flex items-center gap-2">
                  <IoMoonOutline className="text-yellow-400 text-lg" />
                  <span className="text-white">{formData.isJain ? "Jain Food" : "Not Jain"}</span>
                </div>
              </div>
            </div>

            {/* Preparation Time */}
            <div>
              <label className="block text-white font-medium mb-2">Preparation Time (minutes)</label>
              <input type="number" name="preparationTime" value={formData.preparationTime} onChange={handleChange} placeholder="10" min="0" className="w-full md:w-48 px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 border-t border-gray-700 bg-gray-900/30 flex flex-col sm:flex-row gap-3">
            <button type="button" onClick={() => router.back()} className="px-6 py-2.5 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700">Cancel</button>
            <button type="submit" disabled={addProductMutation.isLoading} className="flex-1 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {addProductMutation.isLoading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Adding Product...</> : <><IoCheckmarkCircleOutline className="w-4 h-4" /> Add Product to Menu</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProductPage;