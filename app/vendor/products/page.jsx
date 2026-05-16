"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaSpinner, FaEye, FaSyncAlt } from "react-icons/fa";
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
        <div className="bg-gray-800 rounded-xl max-w-md w-full p-5 shadow-2xl border border-gray-700">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-white">{decryptName(product.name)}</h3>
            <button onClick={() => toast.dismiss(t.id)} className="text-gray-400 hover:text-white">
              <FaTimes />
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Category:</span><span className="text-white">{product.category?.replace("_", " ")}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Price:</span><span className="text-white">₹{finalPrice} {product.discountPrice && <span className="line-through text-gray-500 ml-1">₹{originalPrice}</span>}</span></div>
            {product.discountPrice && <div className="flex justify-between"><span className="text-gray-400">Discount:</span><span className="text-green-400">{discountPercent}% OFF</span></div>}
            <div className="flex justify-between"><span className="text-gray-400">Stock:</span><span className="text-white">{product.stock} {product.unit}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Preparation:</span><span className="text-white">{product.preparationTime} min</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Type:</span><span className={product.isVegetarian ? "text-green-400" : "text-orange-400"}>{product.isVegetarian ? "Vegetarian" : "Non-Vegetarian"}</span></div>
            {product.description && <div className="border-t border-gray-700 pt-2 mt-2"><p className="text-gray-400 text-xs">{product.description.startsWith("U2FsdGVkX1") ? "Encrypted description" : product.description}</p></div>}
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
      <div className="flex justify-center items-center min-h-[60vh]">
        <FaSpinner className="w-10 h-10 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Products</h1>
            <p className="text-gray-400 text-sm">Manage your store inventory</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => refetch()} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm flex items-center gap-2">
              <FaSyncAlt className="w-4 h-4" /> Refresh
            </button>
            <button onClick={() => router.push("/vendor/products/add")} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm flex items-center gap-2">
              <FaPlus className="w-4 h-4" /> Add Product
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-xs">Total Products</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-xs">Total Stock</p>
            <p className="text-2xl font-bold text-white">{stats.totalStock}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-xs">Low Stock</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.lowStock}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-xs">Out of Stock</p>
            <p className="text-2xl font-bold text-red-400">{stats.outOfStock}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or category..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <FaTimes className="text-gray-500 hover:text-gray-400" />
            </button>
          )}
        </div>

        {/* Products Table */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/30 rounded-lg">
            <p className="text-gray-400">No products found</p>
            <button onClick={() => router.push("/vendor/products/add")} className="mt-3 px-4 py-2 bg-green-600 rounded-lg text-white text-sm">
              Add Product
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Image</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Product Name</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Price</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Stock</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Unit</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Sales</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {paginatedProducts.map((product) => {
                    const finalPrice = product.discountPrice || product.price;
                    const hasDiscount = product.discountPrice && product.discountPrice < product.price;
                    
                    return (
                      <tr key={product._id} className="hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3">
                          {product.image ? (
                            <img src={`${process.env.NEXT_PUBLIC_BE_URL}/${product.image}`} alt={decryptName(product.name)} className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                              <FaSpinner className="text-gray-500" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-white text-sm">{decryptName(product.name)}</td>
                        <td className="px-4 py-3 text-gray-300 text-sm">{product.category?.replace("_", " ")}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded ${product.isVegetarian ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"}`}>
                            {product.isVegetarian ? "Veg" : "Non-Veg"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {hasDiscount ? (
                            <div className="flex items-center gap-1">
                              <span className="text-white text-sm">₹{finalPrice}</span>
                              <span className="text-gray-500 text-xs line-through">₹{product.price}</span>
                            </div>
                          ) : (
                            <span className="text-white text-sm">₹{finalPrice}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm ${product.stock === 0 ? "text-red-400" : product.stock < 20 ? "text-yellow-400" : "text-white"}`}>
                            {product.stock || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-300 text-sm">{product.unit}</td>
                        <td className="px-4 py-3 text-gray-300 text-sm">{product.salesCount || 0}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => handleView(product._id)} className="text-blue-400 hover:text-blue-300" title="View">
                              <FaEye className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleEdit(product._id)} className="text-yellow-400 hover:text-yellow-300" title="Edit">
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(product._id, decryptName(product.name))} className="text-red-400 hover:text-red-300" title="Delete">
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
              <div className="flex justify-center gap-2 mt-6">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 bg-gray-800 rounded disabled:opacity-50 text-white text-sm">
                  Prev
                </button>
                <span className="px-3 py-1 text-white text-sm">{currentPage} / {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-800 rounded disabled:opacity-50 text-white text-sm">
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-sm w-full p-5">
            <h3 className="text-lg font-bold text-white mb-2">Delete Product?</h3>
            <p className="text-gray-400 text-sm mb-4">Are you sure you want to delete "{deleteModal.productName}"? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal({ open: false, productId: null, productName: "" })} className="flex-1 px-4 py-2 border border-gray-600 rounded-lg text-gray-300 text-sm">
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={deleteMutation.isLoading} className="flex-1 px-4 py-2 bg-red-600 rounded-lg text-white text-sm">
                {deleteMutation.isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductsPage;