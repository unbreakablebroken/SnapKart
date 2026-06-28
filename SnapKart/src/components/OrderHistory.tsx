import React, { useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Order } from "../types";
import { FileText, Calendar, DollarSign, Eye, AlertCircle, RefreshCw } from "lucide-react";

interface OrderHistoryProps {
  onTrackOrder: (orderId: string) => void;
  onNavigateToShop: () => void;
}

export default function OrderHistory({ onTrackOrder, onNavigateToShop }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const loadedOrders: Order[] = [];
        querySnapshot.forEach((doc) => {
          loadedOrders.push({ id: doc.id, ...doc.data() } as Order);
        });
        setOrders(loadedOrders);
      } catch (err: any) {
        console.error("Error loading order history:", err);
        setError("Could not retrieve past order logs. Note: Schema index creation may take a minute.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white"></div>
      </div>
    );
  }

  if (!auth.currentUser) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 rounded-full inline-flex mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">No active history</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Log in to view your orders, track real-time deliveries, and view invoices.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 animate-fade-in font-sans">
      <div className="mb-10 border-b border-[#ececeb] dark:border-[#2c2c2a] pb-6">
        <span className="text-[9px] font-bold text-[#16a34a] uppercase tracking-[0.25em] block mb-1">Customer Archives</span>
        <h1 className="text-3xl md:text-4xl font-light font-serif text-[#1a1a1a] dark:text-[#f5f5f2] tracking-tight">Your Orders</h1>
        <p className="text-xs font-serif italic text-zinc-500 dark:text-zinc-400 mt-1">Review past transactions, verify direct dispatch receipts, and track shipments.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 text-xs rounded-none border border-red-100 dark:border-red-950/40 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-[#161616] border border-[#ececeb] dark:border-[#2c2c2a] rounded-none p-10 text-center">
          <FileText className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#1a1a1a] dark:text-[#f5f5f2]">No orders placed yet</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 max-w-sm mx-auto mb-6 font-serif italic">
            You haven't bought any dropshipping items yet. Browse our curated catalogs and secure a premium item.
          </p>
          <button
            id="history-start-shopping"
            onClick={onNavigateToShop}
            className="py-3 px-6 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black text-[10px] font-bold uppercase tracking-widest rounded-none transition-all cursor-pointer"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-[#161616] border border-[#ececeb] dark:border-[#2c2c2a] rounded-none p-6 space-y-4 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#ececeb] dark:border-[#2c2c2a]">
                <div className="space-y-0.5">
                  <p className="text-[9px] text-[#aaa] font-bold uppercase tracking-[0.2em]">ORDER REFERENCE</p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white font-mono break-all uppercase tracking-wider">{order.id}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 bg-[#fbfbfa] dark:bg-zinc-800/40 py-1 px-2.5 border border-[#ececeb] dark:border-[#2c2c2a] text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                    <Calendar className="w-3 h-3" />
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                  <div className={`inline-flex items-center px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest border ${
                    order.status === "delivered" 
                      ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30"
                      : order.status === "shipped" || order.status === "out_for_delivery"
                      ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30"
                      : "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30"
                  }`}>
                    {order.status.replace(/_/g, " ")}
                  </div>
                </div>
              </div>

              {/* Items listing */}
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center gap-3">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-10 h-10 object-cover rounded-none bg-zinc-50 border border-[#ececeb] dark:border-[#2c2c2a]"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="font-light font-serif text-[#1a1a1a] dark:text-zinc-200">{item.name}</p>
                        <p className="text-zinc-400 text-[10px] tracking-wider uppercase">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Total & action */}
              <div className="flex items-center justify-between pt-4 border-t border-[#ececeb] dark:border-[#2c2c2a]">
                <div className="text-zinc-500 dark:text-zinc-400 text-xs font-serif italic">
                  Total Remitted: <span className="font-sans not-italic font-bold text-zinc-900 dark:text-white text-sm">${order.totalAmount.toFixed(2)}</span>
                </div>
                <button
                  id={`track-btn-${order.id}`}
                  onClick={() => onTrackOrder(order.id)}
                  className="flex items-center gap-2 py-2 px-4 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black text-[9px] font-bold uppercase tracking-widest rounded-none transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Track Delivery
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
