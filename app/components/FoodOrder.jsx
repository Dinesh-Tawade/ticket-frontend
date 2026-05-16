"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast, Toaster } from "react-hot-toast";
import { 
  addToCart, 
  getCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart, 
  placeOrder 
} from "@/app/services/publicCommunication";
import { FaPlus, FaMinus, FaTrash, FaShoppingCart, FaRupeeSign, FaClock, FaUtensils, FaSpinner } from "react-icons/fa";

function FoodOrder({ theaterId, products, isLoading: productsLoading, bookingId, onComplete, onSkip }) {
  const queryClient = useQueryClient();
  const [cart, setCart] = useState({ items: [], totalAmount: 0, itemCount: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch cart
  const { data: cartData, refetch: refetchCart, isLoading: cartLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    enabled: true,
  });

  useEffect(() => {
    if (cartData?.data) {
      setCart({
        items: cartData.data.items || [],
        totalAmount: cartData.data.totalAmount || 0,
        itemCount: cartData.data.itemCount || 0,
      });
    }
  }, [cartData]);

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      refetchCart();
      toast.success("Item added to cart!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add item");
    },
  });

  // Update cart mutation
  const updateCartMutation = useMutation({
    mutationFn: ({ productId, quantity }) => updateCartItem(productId, quantity),
    onSuccess: () => refetchCart(),
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: removeFromCart,
    onSuccess: () => refetchCart(),
  });

  // Place order mutation
  const placeOrderMutation = useMutation({
    mutationFn: (orderData) => placeOrder(orderData),
    onSuccess: (data) => {
      toast.success("Order placed successfully!");
      onComplete?.(data.data);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to place order");
    },
    onSettled: () => setIsSubmitting(false),
  });

  const handleAddToCart = (productId, quantity = 1) => {
    addToCartMutation.mutate({ productId, quantity });
  };

  const handleUpdateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCartMutation.mutate(productId);
    } else {
      updateCartMutation.mutate({ productId, quantity });
    }
  };

  const handlePlaceOrder = () => {
    if (cart.itemCount === 0) {
      onSkip();
      return;
    }
    setIsSubmitting(true);
    placeOrderMutation.mutate({
      deliveryType: "SEAT_DELIVERY",
      bookingId: bookingId,
      paymentMethod: "ONLINE",
    });
  };

  if (productsLoading || cartLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSpinner className="animate-spin text-3xl text-yellow-500" />
      </div>
    );
  }

  const hasProducts = Object.keys(products).length > 0;
  const allProducts = Object.values(products).flat();

  return (
    <div className="max-w-6xl mx-auto">
      <Toaster position="top-right" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <div className="flex items-center gap-3 mb-4">
              <FaUtensils className="text-yellow-500 text-xl" />
              <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>Add Snacks & Beverages</h2>
            </div>
            
            {!hasProducts || allProducts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No food items available for this theater</p>
                <button
                  onClick={onSkip}
                  className="mt-4 px-6 py-2 rounded-xl bg-yellow-500 text-black font-semibold"
                >
                  Continue to Payment
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(products).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="text-lg font-semibold mb-3 capitalize" style={{ color: "var(--foreground)" }}>
                      {category.toLowerCase()}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {items.map((product) => (
                        <div
                          key={product._id}
                          className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02]"
                          style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}
                        >
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-gray-700 flex items-center justify-center">
                              <FaUtensils className="text-gray-400 text-2xl" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>{product.name}</h4>
                            <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>{product.description || "Delicious snack"}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-sm font-bold text-yellow-500">₹{product.discountPrice || product.price}</span>
                              <button
                                onClick={() => handleAddToCart(product._id)}
                                className="px-3 py-1 rounded-lg text-xs font-medium bg-yellow-500 text-black hover:bg-yellow-400 transition"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cart Section */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <div className="flex items-center gap-3 mb-4">
              <FaShoppingCart className="text-yellow-500 text-xl" />
              <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>Your Order</h2>
              {cart.itemCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-yellow-500 text-black text-xs font-bold">
                  {cart.itemCount}
                </span>
              )}
            </div>

            {cart.items.length === 0 ? (
              <div className="text-center py-8">
                <FaShoppingCart className="text-4xl mx-auto mb-3 opacity-30" />
                <p className="text-sm" style={{ color: "var(--foreground)", opacity: 0.5 }}>Your cart is empty</p>
                <p className="text-xs mt-1" style={{ color: "var(--foreground)", opacity: 0.3 }}>Add items or skip to continue</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between p-2 rounded-lg" style={{ background: "var(--background)" }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{item.productName}</p>
                        <p className="text-xs text-yellow-500">₹{item.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition"
                        >
                          <FaMinus size={10} />
                        </button>
                        <span className="text-sm w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition"
                        >
                          <FaPlus size={10} />
                        </button>
                        <button
                          onClick={() => removeFromCartMutation.mutate(item.productId)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500/10 transition"
                        >
                          <FaTrash size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t mt-4 pt-4" style={{ borderColor: "var(--card-border)" }}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Subtotal</span>
                    <span className="text-sm">₹{cart.totalAmount}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Tax (5% GST)</span>
                    <span className="text-sm">₹{(cart.totalAmount * 0.05).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="text-sm">Delivery Charge</span>
                    <span className="text-sm">₹20</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t" style={{ borderColor: "var(--card-border)" }}>
                    <span className="font-bold">Total</span>
                    <span className="text-xl font-bold text-yellow-500">₹{cart.totalAmount + (cart.totalAmount * 0.05) + 20}</span>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-yellow-500 to-amber-500 text-black hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <FaSpinner className="animate-spin" /> : cart.itemCount > 0 ? "Place Order" : "Skip & Continue"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FoodOrder;