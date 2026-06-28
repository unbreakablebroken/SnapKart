import React, { useState } from "react";
import { Product, OrderItem } from "../types";
import { auth, db } from "../lib/firebase";
import { collection, doc, addDoc, updateDoc, getDoc } from "firebase/firestore";
import { ShoppingCart, Trash2, ShieldAlert, CreditCard, Lock, CheckCircle, RefreshCw, AlertCircle, Sparkles } from "lucide-react";

interface CartProps {
  cartItems: { product: Product; quantity: number }[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onNavigateToTab: (tab: string, initialOrderId?: string) => void;
  onTriggerAuthModal: () => void;
}

export default function Cart({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onNavigateToTab,
  onTriggerAuthModal,
}: CartProps) {
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "shipping" | "processing" | "success">("cart");
  const [shippingName, setShippingName] = useState("");
  const [shippingEmail, setShippingEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");
  const [error, setError] = useState("");
  const [placedOrderId, setPlacedOrderId] = useState("");

  const subtotal = cartItems.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);
  const totalAmount = subtotal; // Free shipping

  const handleProceedToShipping = async () => {
    const user = auth.currentUser;
    if (!user) {
      onTriggerAuthModal();
      return;
    }
    setShippingEmail(user.email || "");
    setShippingName(user.displayName || "");

    // Try reading defaults from profile
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.address) setShippingAddress(data.address);
        if (data.name) setShippingName(data.name);
      }
    } catch (err) {
      console.warn("Could not load user defaults:", err);
    }

    setCheckoutStep("shipping");
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!shippingName || !shippingEmail || !shippingAddress || !cardNumber || !cardExpiry || !cardCVC) {
      setError("Please fulfill all shipping and secure payment parameters.");
      return;
    }

    if (cardNumber.replace(/\s+/g, "").length < 16) {
      setError("Please supply a valid 16-digit credit credentials standard.");
      return;
    }

    setCheckoutStep("processing");

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Security verification expired. Please sign in again.");

      const orderItemsList: OrderItem[] = cartItems.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
      }));

      // Create Order document inside Firestore
      const orderRef = await addDoc(collection(db, "orders"), {
        userId: user.uid,
        customerName: shippingName,
        customerEmail: shippingEmail,
        shippingAddress: shippingAddress,
        items: orderItemsList,
        totalAmount: totalAmount,
        status: "pending",
        trackingNumber: "SPK-" + Math.floor(100000 + Math.random() * 900000),
        paymentId: "PAY-" + Math.floor(100000000 + Math.random() * 900000000),
        createdAt: new Date().toISOString(),
      });

      // Synchronize integrated supplier stock levels in Firestore if possible
      for (const item of cartItems) {
        try {
          const productDocRef = doc(db, "products", item.product.id);
          const productSnap = await getDoc(productDocRef);
          if (productSnap.exists()) {
            const currentStock = productSnap.data().inventory || 100;
            const newStock = Math.max(0, currentStock - item.quantity);
            await updateDoc(productDocRef, { inventory: newStock });
          }
        } catch (stockErr) {
          console.warn("Note: Supplier inventory stock synced locally but Firestore bypass was active:", stockErr);
        }
      }

      setPlacedOrderId(orderRef.id);
      onClearCart();
      setCheckoutStep("success");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Fulfillment processing failed. Please check network conditions.");
      setCheckoutStep("shipping");
    }
  };

  if (checkoutStep === "processing") {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-6 space-y-6">
        <div className="relative flex justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-zinc-100 border-t-zinc-900 dark:border-zinc-800 dark:border-t-white"></div>
          <Lock className="absolute top-5 w-6 h-6 text-zinc-800 dark:text-zinc-200 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-light font-serif text-zinc-900 dark:text-white">Connecting Secure Gateway</h2>
          <p className="text-[10px] uppercase tracking-widest text-zinc-400">Encrypting credentials with bank standard SSL/TLS...</p>
        </div>
      </div>
    );
  }

  if (checkoutStep === "success") {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-6 space-y-6 animate-fade-in">
        <div className="inline-flex p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
          <CheckCircle className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-light font-serif text-zinc-900 dark:text-white">Order placed successfully!</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Supplier has received checkout routing. A verification tracking number has been generated.
          </p>
        </div>

        <div className="p-4 bg-[#fdfdfc] dark:bg-[#161616] border border-[#ececeb] dark:border-[#2c2c2a] rounded-none">
          <span className="text-[9px] font-bold text-[#aaa] uppercase tracking-[0.2em] block mb-1">SNAPKART ORDER ID</span>
          <span className="text-sm font-bold text-zinc-900 dark:text-white font-mono break-all uppercase tracking-wider">{placedOrderId}</span>
        </div>

        <div className="flex flex-col gap-2">
          <button
            id="cart-track-order-btn"
            onClick={() => onNavigateToTab("tracking", placedOrderId)}
            className="w-full py-3 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black text-[10px] font-bold uppercase tracking-widest rounded-none transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" /> Track Shipment
          </button>
          <button
            id="cart-continue-shopping-success"
            onClick={() => onNavigateToTab("shop")}
            className="w-full py-2 text-zinc-400 hover:text-black dark:hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all"
          >
            Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 animate-fade-in font-sans">
      <div className="mb-10 border-b border-[#ececeb] dark:border-[#2c2c2a] pb-6">
        <span className="text-[9px] font-bold text-[#16a34a] uppercase tracking-[0.25em] block mb-1">Your Cart Allocations</span>
        <h1 className="text-3xl md:text-4xl font-light font-serif text-[#1a1a1a] dark:text-[#f5f5f2] tracking-tight">Your Cart</h1>
        <p className="text-xs font-serif italic text-zinc-500 dark:text-zinc-400 mt-1">Review selected supplier allocations and proceed with secure checkouts.</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-white dark:bg-[#161616] border border-[#ececeb] dark:border-[#2c2c2a] rounded-none p-12 text-center">
          <ShoppingCart className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a] dark:text-[#f5f5f2]">Your cart is empty</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 max-w-xs mx-auto mb-6">
            Explore our dropshipping collections and find aesthetic top tier products to add here.
          </p>
          <button
            id="cart-start-shopping"
            onClick={() => onNavigateToTab("shop")}
            className="py-3 px-6 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black text-[10px] font-bold uppercase tracking-widest rounded-none transition-all"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items list / shipping details */}
          <div className="lg:col-span-2 space-y-6">
            {checkoutStep === "cart" ? (
              <div className="bg-white dark:bg-[#161616] border border-[#ececeb] dark:border-[#2c2c2a] rounded-none p-6 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-[#ececeb] dark:border-[#2c2c2a] last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-none bg-zinc-50 border border-[#ececeb] dark:border-[#2c2c2a] shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-light font-serif text-[#1a1a1a] dark:text-white truncate">{item.product.name}</h4>
                        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#888]">{item.product.category}</p>
                        <p className="text-sm font-medium font-serif text-[#1a1a1a] dark:text-white mt-1">${item.product.price.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      <div className="flex items-center border border-[#ececeb] dark:border-[#2c2c2a] rounded-none overflow-hidden bg-white dark:bg-[#121212]">
                        <button
                          id={`qty-dec-${item.product.id}`}
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="px-2.5 py-1 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-xs font-semibold text-zinc-950 dark:text-white bg-[#f9f9f7] dark:bg-zinc-900">
                          {item.quantity}
                        </span>
                        <button
                          id={`qty-inc-${item.product.id}`}
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          className="px-2.5 py-1 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        >
                          +
                        </button>
                      </div>

                      <button
                        id={`remove-item-${item.product.id}`}
                        onClick={() => onRemoveItem(item.product.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-[#fbfbfa] dark:hover:bg-red-950/20 rounded-none transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Shipping Form */
              <div className="bg-white dark:bg-[#161616] border border-[#ececeb] dark:border-[#2c2c2a] rounded-none p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#ececeb] dark:border-[#2c2c2a]">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#1a1a1a] dark:text-[#f5f5f2]">Shipping & Secure Payment Parameters</h3>
                  <button
                    id="back-to-cart-step"
                    onClick={() => setCheckoutStep("cart")}
                    className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400 hover:text-black dark:hover:text-white underline underline-offset-2 cursor-pointer"
                  >
                    Modify Allocations
                  </button>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-950/40 text-red-600 dark:text-red-400 text-xs rounded-none font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleCheckout} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-[#aaa] uppercase tracking-[0.2em] mb-1.5">Consignee Name</label>
                      <input
                        id="shipping-name"
                        type="text"
                        required
                        placeholder="Jane Doe"
                        value={shippingName}
                        onChange={(e) => setShippingName(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#fbfbfa] dark:bg-zinc-800/20 border border-[#ececeb] dark:border-[#2c2c2a] rounded-none focus:outline-none focus:border-zinc-900 text-[#1a1a1a] dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-[#aaa] uppercase tracking-[0.2em] mb-1.5">Notification Email</label>
                      <input
                        id="shipping-email"
                        type="email"
                        required
                        placeholder="jane@example.com"
                        value={shippingEmail}
                        onChange={(e) => setShippingEmail(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#fbfbfa] dark:bg-zinc-800/20 border border-[#ececeb] dark:border-[#2c2c2a] rounded-none focus:outline-none focus:border-zinc-900 text-[#1a1a1a] dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-[#aaa] uppercase tracking-[0.2em] mb-1.5">Detailed Delivery Address</label>
                    <textarea
                      id="shipping-address"
                      rows={2}
                      required
                      placeholder="123 Minimalism Ave, Copenhagen, Denmark"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#fbfbfa] dark:bg-zinc-800/20 border border-[#ececeb] dark:border-[#2c2c2a] rounded-none focus:outline-none focus:border-zinc-900 text-[#1a1a1a] dark:text-white"
                    />
                  </div>

                  {/* Payment Info Box */}
                  <div className="pt-4 border-t border-[#ececeb] dark:border-[#2c2c2a] space-y-4">
                    <div className="flex items-center justify-between text-zinc-500">
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-400 tracking-[0.15em]">
                        <Lock className="w-3.5 h-3.5 text-zinc-400" />
                        SECURE PCI-DSS GATEWAY (SIMULATED)
                      </div>
                      <CreditCard className="w-5 h-5 text-zinc-400" />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-[#aaa] uppercase tracking-[0.2em] mb-1.5">Debit/Credit Card Number</label>
                      <input
                        id="checkout-card-number"
                        type="text"
                        required
                        placeholder="4111 2222 3333 4444"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                        className="w-full px-3 py-2 text-xs bg-[#fbfbfa] dark:bg-zinc-800/20 border border-[#ececeb] dark:border-[#2c2c2a] rounded-none focus:outline-none focus:border-zinc-900 text-[#1a1a1a] dark:text-white font-mono tracking-widest"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-bold text-[#aaa] uppercase tracking-[0.2em] mb-1.5">Expiration Date</label>
                        <input
                          id="checkout-card-expiry"
                          type="text"
                          required
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
                          className="w-full px-3 py-2 text-xs bg-[#fbfbfa] dark:bg-zinc-800/20 border border-[#ececeb] dark:border-[#2c2c2a] rounded-none focus:outline-none focus:border-zinc-900 text-[#1a1a1a] dark:text-white font-mono tracking-widest"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-[#aaa] uppercase tracking-[0.2em] mb-1.5">CVC / CVV</label>
                        <input
                          id="checkout-card-cvc"
                          type="password"
                          required
                          placeholder="•••"
                          value={cardCVC}
                          onChange={(e) => setCardCVC(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          className="w-full px-3 py-2 text-xs bg-[#fbfbfa] dark:bg-zinc-800/20 border border-[#ececeb] dark:border-[#2c2c2a] rounded-none focus:outline-none focus:border-zinc-900 text-[#1a1a1a] dark:text-white font-mono tracking-widest"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    id="checkout-final-submit"
                    type="submit"
                    className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-bold rounded-none shadow-md text-[10px] tracking-widest uppercase transition-all cursor-pointer"
                  >
                    <Lock className="w-4 h-4" /> Finalize Secure Transaction
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Cart summary box */}
          <div className="bg-white dark:bg-[#161616] border border-[#ececeb] dark:border-[#2c2c2a] rounded-none p-6 shadow-sm h-fit space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#1a1a1a] dark:text-[#f5f5f2] border-b border-[#ececeb] dark:border-[#2c2c2a] pb-3">Fulfillment Summary</h3>
            
            <div className="space-y-2 pb-4 border-b border-[#ececeb] dark:border-[#2c2c2a]">
              <div className="flex justify-between text-xs text-zinc-500">
                <span>Subtotal ({cartItems.reduce((a, c) => a + c.quantity, 0)} items)</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-zinc-500">
                <span>Dropship Air Logistics</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-[10px]">FREE Standard</span>
              </div>
            </div>

            <div className="flex justify-between font-bold font-serif text-base text-zinc-900 dark:text-white py-2">
              <span>Grand Total</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>

            {checkoutStep === "cart" && (
              <button
                id="cart-proceed-to-checkout"
                onClick={handleProceedToShipping}
                className="w-full py-3.5 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black text-[10px] font-bold rounded-none tracking-widest uppercase shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" /> Proceed to Secure Checkout
              </button>
            )}

            <div className="flex items-start gap-2 p-3 bg-[#fdfdfc] dark:bg-zinc-900 border border-[#ececeb] dark:border-[#2c2c2a] rounded-none text-[9px] text-zinc-400 leading-relaxed uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 shrink-0 text-zinc-400 mt-0.5" />
              <span>Full Buyer Protection included. Deliveries tracked and backed by standard refund coverage.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
