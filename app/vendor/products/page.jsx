"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaSpinner, FaEye, FaSyncAlt, FaBox } from "react-icons/fa";
import {
  getMyProducts,
  deleteProduct,
  updateProductStock,
  getProductById
} from "../../services/adminCommunication";

function ProductsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [deleteModal, setDeleteModal] = useState({ open: false, productId: null, productName: "" });

  // Fetch Products
  const { data: productsData, isLoading, refetch } = useQuery({
    queryKey: ["vendor-products"],
    queryFn: getMyProducts,
  });

  // Delete Product
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success("Product deleted successfully!");
      queryClient.invalidateQueries(["vendor-products"]);
      setDeleteModal({ open: false, productId: null, productName: "" });
    },
    onError: (error) => toast.error("Failed to delete: " + error.message),
  });

  const products = productsData?.data || [];

  // Filter Products
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(p =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  // Stats
  const stats = {
    total: products.length,
    totalStock: products.reduce((sum, p) => sum + (p.stock || 0), 0),
    lowStock: products.filter(p => (p.stock || 0) < 20 && (p.stock || 0) > 0).length,
    outOfStock: products.filter(p => (p.stock || 0) === 0).length,
  };

  // Decrypt Name
  const decryptName = (name) => {
    if (!name) return "N/A";
    if (name.startsWith("U2FsdGVkX1")) {
      try {
        const CryptoJS = require("crypto-js");
        const bytes = CryptoJS.AES.decrypt(name, "secret-key");
        return bytes.toString(CryptoJS.enc.Utf8) || name.substring(0, 20);
      } catch {
        return name.substring(0, 20);
      }
    }
    return name;
  };

  // View Product
  const handleView = async (id) => {
    try {
      const res = await getProductById(id);
      const product = res.data;
      const finalPrice = product.discountPrice || product.price;
      const originalPrice = product.price;
      const discountPercent = product.discountPrice ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0;
      
      toast.custom((t) => (
        <div className="rounded-xl max-w-md w-full p-5 shadow-2xl border" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>{decryptName(product.name)}</h3>
            <button onClick={() => toast.dismiss(t.id)} className="hover:opacity-70 transition-opacity" style={{ color: "var(--foreground)", opacity: 0.5 }}>
              <FaTimes />
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span style={{ color: "var(--foreground)", opacity: 0.7 }}>Category:</span><span className="font-medium" style={{ color: "var(--foreground)" }}>{product.category?.replace("_", " ")}</span></div>
            <div className="flex justify-between"><span style={{ color: "var(--foreground)", opacity: 0.7 }}>Price:</span><span className="font-medium" style={{ color: "var(--foreground)" }}>₹{finalPrice} {product.discountPrice && <span className="line-through text-gray-500 ml-1">₹{originalPrice}</span>}</span></div>
            {product.discountPrice && <div className="flex justify-between"><span style={{ color: "var(--foreground)", opacity: 0.7 }}>Discount:</span><span className="text-green-500 font-medium">{discountPercent}% OFF</span></div>}
            <div className="flex justify-between"><span style={{ color: "var(--foreground)", opacity: 0.7 }}>Stock:</span><span className="font-medium" style={{ color: "var(--foreground)" }}>{product.stock} {product.unit}</span></div>
            <div className="flex justify-between"><span style={{ color: "var(--foreground)", opacity: 0.7 }}>Preparation:</span><span className="font-medium" style={{ color: "var(--foreground)" }}>{product.preparationTime} min</span></div>
            <div className="flex justify-between"><span style={{ color: "var(--foreground)", opacity: 0.7 }}>Type:</span><span className={product.isVegetarian ? "text-green-500 font-medium" : "text-orange-500 font-medium"}>{product.isVegetarian ? "Vegetarian" : "Non-Vegetarian"}</span></div>
            {product.description && <div className="border-t pt-2 mt-2" style={{ borderColor: "var(--card-border)" }}><p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.7 }}>{product.description.startsWith("U2FsdGVkX1") ? "Encrypted description" : product.description}</p></div>}
          </div>
        </div>
      ), { duration: 5000 });
    } catch {
      toast.error("Failed to load product details");
    }
  };

  // Edit Product
  const handleEdit = (id) => {
    router.push(`/vendor/products/edit/${id}`);
  };

  // Delete Product
  const handleDelete = (id, name) => {
    setDeleteModal({ open: true, productId: id, productName: name });
  };

  const confirmDelete = () => {
    deleteMutation.mutate(deleteModal.productId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] transition-colors duration-300" style={{ background: "var(--background)" }}>
        <FaSpinner className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300 p-6" style={{ background: "var(--background)" }}>
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="relative border-b shadow-lg transition-all duration-300 rounded-xl mb-8" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
          <div className="px-8 py-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 animate-pulse blur-lg opacity-50" />
                  <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
                    <FaBox className="text-white text-xl" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
                    Products
                  </h1>
                  <p className="text-xs font-medium" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                    Manage your store inventory
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => refetch()} className="px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors border hover:shadow-md" style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}>
                  <FaSyncAlt className="w-4 h-4" /> Refresh
                </button>
                <button onClick={() => router.push("/vendor/products/add")} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-lg rounded-lg text-white text-sm flex items-center gap-2 transition-all font-medium">
                  <FaPlus className="w-4 h-4" /> Add Product
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl border transition-all duration-300 hover:shadow-md" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
            <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "var(--foreground)", opacity: 0.5 }}>Total Products</p>
            <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{stats.total}</p>
          </div>
          <div className="p-4 rounded-xl border transition-all duration-300 hover:shadow-md" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
            <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "var(--foreground)", opacity: 0.5 }}>Total Stock</p>
            <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{stats.totalStock}</p>
          </div>
          <div className="p-4 rounded-xl border transition-all duration-300 hover:shadow-md" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
            <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "var(--foreground)", opacity: 0.5 }}>Low Stock</p>
            <p className="text-2xl font-bold text-yellow-500">{stats.lowStock}</p>
          </div>
          <div className="p-4 rounded-xl border transition-all duration-300 hover:shadow-md" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
            <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "var(--foreground)", opacity: 0.5 }}>Out of Stock</p>
            <p className="text-2xl font-bold text-red-500">{stats.outOfStock}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" style={{ color: "var(--foreground)" }} />
          <input
            type="text"
            placeholder="Search by name or category..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm"
            style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <FaTimes className="opacity-50 hover:opacity-100 transition-opacity" style={{ color: "var(--foreground)" }} />
            </button>
          )}
        </div>

        {/* Products Table */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 rounded-xl border" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
            <p className="text-lg font-medium mb-2" style={{ color: "var(--foreground)" }}>No products found</p>
            <p className="text-sm mb-4" style={{ color: "var(--foreground)", opacity: 0.6 }}>Get started by adding your first product.</p>
            <button onClick={() => router.push("/vendor/products/add")} className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white font-medium hover:shadow-lg transition-all">
              Add Product
            </button>
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden shadow-md" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ background: "var(--background)", borderBottom: "1px solid var(--card-border)" }}>
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground)", opacity: 0.7 }}>Image</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground)", opacity: 0.7 }}>Product Name</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground)", opacity: 0.7 }}>Category</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground)", opacity: 0.7 }}>Type</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground)", opacity: 0.7 }}>Price</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground)", opacity: 0.7 }}>Stock</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground)", opacity: 0.7 }}>Unit</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground)", opacity: 0.7 }}>Sales</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground)", opacity: 0.7 }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ divideColor: "var(--card-border)" }}>
                  {paginatedProducts.map((product) => {
                    const finalPrice = product.discountPrice || product.price;
                    const hasDiscount = product.discountPrice && product.discountPrice < product.price;
                    
                    return (
                      <tr key={product._id} className="transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                        <td className="px-6 py-4">
                          {product.image ? (
                            <img src={`${process.env.NEXT_PUBLIC_BE_URL}/${product.image}`} alt={decryptName(product.name)} className="w-12 h-12 rounded-lg object-cover shadow-sm border" style={{ borderColor: "var(--card-border)" }} />
                          ) : (
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center border shadow-sm" style={{ background: "var(--background)", borderColor: "var(--card-border)" }}>
                              <FaSpinner className="opacity-50" style={{ color: "var(--foreground)" }} />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium" style={{ color: "var(--foreground)" }}>{decryptName(product.name)}</td>
                        <td className="px-6 py-4 text-sm" style={{ color: "var(--foreground)", opacity: 0.8 }}>{product.category?.replace("_", " ")}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${product.isVegetarian ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20" : "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20"}`}>
                            {product.isVegetarian ? "Veg" : "Non-Veg"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {hasDiscount ? (
                            <div className="flex flex-col">
                              <span className="font-semibold" style={{ color: "var(--foreground)" }}>₹{finalPrice}</span>
                              <span className="text-xs line-through" style={{ color: "var(--foreground)", opacity: 0.5 }}>₹{product.price}</span>
                            </div>
                          ) : (
                            <span className="font-semibold" style={{ color: "var(--foreground)" }}>₹{finalPrice}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-semibold px-2.5 py-1 rounded-full text-xs border ${
                            product.stock === 0 ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" : 
                            product.stock < 20 ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20" : 
                            "bg-black/5 dark:bg-white/5 border-transparent"
                          }`} style={product.stock >= 20 ? { color: "var(--foreground)" } : {}}>
                            {product.stock || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: "var(--foreground)", opacity: 0.8 }}>{product.unit}</td>
                        <td className="px-6 py-4 font-medium text-sm" style={{ color: "var(--foreground)" }}>{product.salesCount || 0}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-3">
                            <button onClick={() => handleView(product._id)} className="text-blue-500 hover:text-blue-600 transition-colors bg-blue-500/10 p-2 rounded-lg" title="View">
                              <FaEye className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleEdit(product._id)} className="text-amber-500 hover:text-amber-600 transition-colors bg-amber-500/10 p-2 rounded-lg" title="Edit">
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(product._id, decryptName(product.name))} className="text-red-500 hover:text-red-600 transition-colors bg-red-500/10 p-2 rounded-lg" title="Delete">
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center px-6 py-4 border-t" style={{ borderColor: "var(--card-border)", background: "var(--background)" }}>
                <span className="text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>
                  Showing <span className="font-medium" style={{ opacity: 1 }}>{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-medium" style={{ opacity: 1 }}>{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> of <span className="font-medium" style={{ opacity: 1 }}>{filteredProducts.length}</span> results
                </span>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 border rounded-lg disabled:opacity-50 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}>
                    Prev
                  </button>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 border rounded-lg disabled:opacity-50 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}>
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="rounded-xl max-w-sm w-full p-6 shadow-2xl border" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
            <h3 className="text-xl font-bold mb-3" style={{ color: "var(--foreground)" }}>Delete Product?</h3>
            <p className="text-sm mb-6" style={{ color: "var(--foreground)", opacity: 0.7 }}>Are you sure you want to delete <span className="font-bold">"{deleteModal.productName}"</span>? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal({ open: false, productId: null, productName: "" })} className="flex-1 px-4 py-2.5 border rounded-lg font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}>
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={deleteMutation.isLoading} className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 rounded-lg text-white font-medium transition-colors flex items-center justify-center shadow-lg shadow-red-500/20">
                {deleteMutation.isLoading ? <FaSpinner className="animate-spin" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductsPage;