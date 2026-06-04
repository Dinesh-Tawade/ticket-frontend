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
    <div className="min-h-screen transition-colors duration-300 py-8 px-4" style={{ background: "var(--background)" }}>
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto">
        <div className="relative border-b shadow-lg transition-all duration-300 rounded-xl mb-8" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
          <div className="px-8 py-4">
            <button onClick={() => router.back()} className="flex items-center gap-2 hover:opacity-100 transition-opacity mb-4" style={{ color: "var(--foreground)", opacity: 0.7 }}>
              <IoArrowBackOutline className="w-4 h-4" />
              Back to Products
            </button>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 animate-pulse blur-lg opacity-50" />
                  <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
                    <IoCubeOutline className="text-white text-xl" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
                    Add New Product
                  </h1>
                  <p className="text-xs font-medium" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                    Add Indian snacks, sweets, and beverages to your menu
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl overflow-hidden shadow-lg border" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
          {/* Image Upload */}
          <div className="p-6 border-b" style={{ borderColor: "var(--card-border)" }}>
            <label className="block font-medium mb-2" style={{ color: "var(--foreground)" }}>Product Image <span className="text-red-400">*</span></label>
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div onClick={() => document.getElementById("imageInput").click()} className={`w-32 h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${imagePreview ? "border-green-500 bg-green-500/10" : "hover:border-blue-500"}`} style={!imagePreview ? { borderColor: "var(--card-border)" } : {}}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <>
                    <IoCloudUploadOutline className="text-3xl mb-2" style={{ color: "var(--foreground)", opacity: 0.4 }} />
                    <span className="text-xs font-medium" style={{ color: "var(--foreground)", opacity: 0.6 }}>Upload Image</span>
                  </>
                )}
              </div>
              <input id="imageInput" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: "var(--foreground)", opacity: 0.5 }}>Recommended: Square image, at least 500x500px</p>
                <p className="text-xs mt-1" style={{ color: "var(--foreground)", opacity: 0.4 }}>Supported formats: JPG, PNG, WEBP (Max 5MB)</p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="p-6 space-y-5">
            {/* Product Name */}
            <div>
              <label className="block font-medium mb-2" style={{ color: "var(--foreground)" }}>Product Name <span className="text-red-400">*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Pani Puri, Samosa, Gulab Jamun" className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }} />
            </div>

            {/* Description */}
            <div>
              <label className="block font-medium mb-2" style={{ color: "var(--foreground)" }}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Describe your product - ingredients, taste, special features..." className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none" style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }} />
            </div>

            {/* Category */}
            <div>
              <label className="block font-medium mb-2" style={{ color: "var(--foreground)" }}>Category <span className="text-red-400">*</span></label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}>
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
                <label className="block font-medium mb-2" style={{ color: "var(--foreground)" }}>Unit <span className="text-red-400">*</span></label>
                <select name="unit" value={formData.unit} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-lg transition-all" style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}>
                  {units.map(unit => <option key={unit.value} value={unit.value}>{unit.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-2" style={{ color: "var(--foreground)" }}>Price (₹) <span className="text-red-400">*</span></label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="120" step="0.01" min="0" className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }} />
              </div>
            </div>

            {/* Discount & Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-2" style={{ color: "var(--foreground)" }}>Discount Price (₹)</label>
                <input type="number" name="discountPrice" value={formData.discountPrice} onChange={handleChange} placeholder="100" step="0.01" min="0" className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }} />
              </div>
              <div>
                <label className="block font-medium mb-2" style={{ color: "var(--foreground)" }}>Stock Quantity <span className="text-red-400">*</span></label>
                <input type="number" name="stock" value={formData.stock} onChange={handleChange} placeholder="150" min="0" className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }} />
              </div>
            </div>

            {/* Spice Level */}
            <div>
              <label className="block font-medium mb-2" style={{ color: "var(--foreground)" }}>Spice Level</label>
              <div className="flex flex-wrap gap-3">
                {spiceLevels.map(level => (
                  <button key={level.value} type="button" onClick={() => setFormData(prev => ({ ...prev, spiceLevel: level.value }))} className={`px-4 py-2 rounded-lg transition-all font-medium border ${formData.spiceLevel === level.value ? "bg-blue-500 text-white border-blue-500 shadow-md" : "hover:bg-black/10 dark:hover:bg-white/10"}`} style={formData.spiceLevel !== level.value ? { borderColor: "var(--card-border)", color: "var(--foreground)" } : {}}>
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Diet Preferences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg border transition-all" style={{ background: "var(--background)", borderColor: "var(--card-border)" }}>
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, isVegetarian: !prev.isVegetarian }))} className={`w-12 h-6 rounded-full transition-colors ${formData.isVegetarian ? "bg-green-500" : "bg-gray-400 dark:bg-gray-600"}`}>
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform transform ${formData.isVegetarian ? "translate-x-6" : "translate-x-1"}`} />
                </button>
                <div className="flex items-center gap-2">
                  <IoLeafOutline className="text-green-500 text-lg" />
                  <span className="font-medium" style={{ color: "var(--foreground)" }}>{formData.isVegetarian ? "Vegetarian" : "Non-Vegetarian"}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg border transition-all" style={{ background: "var(--background)", borderColor: "var(--card-border)" }}>
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, isJain: !prev.isJain }))} className={`w-12 h-6 rounded-full transition-colors ${formData.isJain ? "bg-green-500" : "bg-gray-400 dark:bg-gray-600"}`}>
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform transform ${formData.isJain ? "translate-x-6" : "translate-x-1"}`} />
                </button>
                <div className="flex items-center gap-2">
                  <IoMoonOutline className="text-yellow-500 text-lg" />
                  <span className="font-medium" style={{ color: "var(--foreground)" }}>{formData.isJain ? "Jain Food" : "Not Jain"}</span>
                </div>
              </div>
            </div>

            {/* Preparation Time */}
            <div>
              <label className="block font-medium mb-2" style={{ color: "var(--foreground)" }}>Preparation Time (minutes)</label>
              <input type="number" name="preparationTime" value={formData.preparationTime} onChange={handleChange} placeholder="10" min="0" className="w-full md:w-48 px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 border-t flex flex-col sm:flex-row gap-3" style={{ background: "var(--background)", borderColor: "var(--card-border)" }}>
            <button type="button" onClick={() => router.back()} className="px-6 py-2.5 border rounded-lg hover:opacity-80 transition-opacity font-medium" style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}>Cancel</button>
            <button type="submit" disabled={addProductMutation.isLoading} className="flex-1 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-medium">
              {addProductMutation.isLoading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Adding Product...</> : <><IoCheckmarkCircleOutline className="w-5 h-5" /> Add Product to Menu</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProductPage;