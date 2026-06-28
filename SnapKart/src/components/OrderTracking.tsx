import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Order } from "../types";
import { Package, Truck, Compass, CheckCircle, Home, Search, ChevronRight, AlertCircle, Copy, Check } from "lucide-react";

interface OrderTrackingProps {
  initialOrderId?: string;
}

export default function OrderTracking({ initialOrderId }: OrderTrackingProps) {
  const [searchId, setSearchId] = useState(initialOrderId || "");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialOrderId) {
      setSearchId(initialOrderId);
      fetchOrder(initialOrderId);
    }
  }, [initialOrderId]);

  const fetchOrder = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const docRef = doc(db, "orders", id.trim());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() } as Order);
      } else {
        setError("No order found with the provided tracking or order identifier.");
      }
    } catch (err: any) {
      console.error(err);
      setError("An error occurred while tracking. Please confirm your order identifier.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(searchId);
  };

  const copyId = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusStep = (status: Order["status"]) => {
    const steps = ["pending", "processing", "shipped", "out_for_delivery", "delivered"];
    return steps.indexOf(status);
  };

  const currentStepIndex = order ? getStatusStep(order.status) : -1;

  const stepsDetails = [
    { label: "Ordered", desc: "Supplier validated and received", icon: Package },
    { label: "Processing", desc: "Warehouse pick & quality audit", icon: Compass },
    { label: "Shipped", desc: "Handed over to local carrier", icon: Truck },
    { label: "In Transit", desc: "Arrived at destination hub", icon: Compass },
    { label: "Delivered", desc: "Securely left at shipping address", icon: Home },
  ];

  return (
    <div className="max-w-3xl mx-auto py-10 px-6 animate-fade-in font-sans">
      <div className="text-center mb-10 border-b border-[#ececeb] dark:border-[#2c2c2a] pb-6">
        <span className="text-[9px] font-bold text-[#16a34a] uppercase tracking-[0.25em] block mb-1">Logistics Monitor</span>
        <h1 className="text-3xl md:text-4xl font-light font-serif text-[#1a1a1a] dark:text-[#f5f5f2] tracking-tight">Track Your Shipment</h1>
        <p className="text-xs font-serif italic text-zinc-500 dark:text-zinc-400 mt-1">Real-time status of your direct-to-consumer dropshipping orders.</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-10 relative max-w-xl mx-auto">
        <input
          id="order-search-input"
          type="text"
          placeholder="Enter SnapKart Order ID (e.g. ord-123456...)"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="w-full pl-4 pr-14 py-3.5 bg-white dark:bg-[#161616] border border-[#ececeb] dark:border-[#2c2c2a] rounded-none focus:outline-none focus:border-zinc-900 text-[#1a1a1a] dark:text-white text-xs"
        />
        <button
          id="order-search-submit"
          type="submit"
          disabled={loading}
          className="absolute right-3 top-2.5 p-2 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black rounded-none transition-all cursor-pointer"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-none animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs rounded-none border border-red-100 dark:border-red-950/40 flex items-start gap-2 max-w-xl mx-auto">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {order && (
        <div className="bg-white dark:bg-[#161616] border border-[#ececeb] dark:border-[#2c2c2a] rounded-none p-6 space-y-8">
          {/* Tracking Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#ececeb] dark:border-[#2c2c2a]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-[#aaa] font-bold uppercase tracking-[0.2em]">ORDER IDENTIFIER</span>
                <button
                  id="copy-tracking-id"
                  onClick={copyId}
                  className="p-1 hover:bg-[#fbfbfa] dark:hover:bg-zinc-850 rounded-none text-zinc-400 hover:text-zinc-600 transition-all cursor-pointer"
                  title="Copy Order ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <h2 className="text-base font-bold text-[#1a1a1a] dark:text-white font-mono break-all uppercase tracking-wider">{order.id}</h2>
            </div>
            <div className="text-left md:text-right">
              <span className="text-[9px] text-[#aaa] font-bold uppercase tracking-[0.2em] block">STATUS</span>
              <span className={`inline-flex items-center px-3 py-1 text-[9px] font-bold uppercase tracking-widest mt-1 border ${
                order.status === "delivered" 
                  ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30"
                  : order.status === "shipped" || order.status === "out_for_delivery"
                  ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30"
                  : "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30"
              }`}>
                {order.status.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          {/* Stepper progress */}
          <div className="py-4 border-b border-[#ececeb] dark:border-[#2c2c2a] pb-8">
            <div className="flex flex-col md:flex-row justify-between relative gap-6 md:gap-2">
              {/* Line Connector for desktop */}
              <div className="hidden md:block absolute top-5 left-8 right-8 h-0.5 bg-zinc-100 dark:bg-zinc-800 -z-10">
                <div 
                  className="h-full bg-zinc-950 dark:bg-white transition-all duration-500" 
                  style={{ width: `${(currentStepIndex / (stepsDetails.length - 1)) * 100}%` }}
                />
              </div>

              {stepsDetails.map((step, idx) => {
                const IconComp = step.icon;
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={idx} className="flex md:flex-col items-start md:items-center text-left md:text-center flex-1 relative gap-4 md:gap-1">
                    {/* Square Box Node */}
                    <div className={`w-10 h-10 rounded-none flex items-center justify-center border transition-all ${
                      isCompleted 
                        ? "bg-zinc-950 dark:bg-white border-zinc-950 dark:border-white text-white dark:text-zinc-950"
                        : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 text-zinc-400"
                    }`}>
                      {isCompleted && idx < currentStepIndex ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <IconComp className="w-4 h-4" />
                      )}
                    </div>

                    {/* Step Labels */}
                    <div className="flex-1 md:mt-2">
                      <h4 className={`text-[10px] font-bold uppercase tracking-wider leading-tight ${isCompleted ? "text-zinc-900 dark:text-white font-bold" : "text-zinc-400"}`}>
                        {step.label}
                      </h4>
                      <p className="text-[9px] text-zinc-400 mt-0.5 leading-relaxed md:max-w-[120px] font-serif italic">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Carrier & Delivery Address details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <h3 className="text-[9px] font-bold text-[#aaa] uppercase tracking-[0.2em]">Ship To</h3>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white font-serif">{order.customerName}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed whitespace-pre-line font-serif italic">{order.shippingAddress}</p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-[9px] font-bold text-[#aaa] uppercase tracking-[0.2em]">Carrier Specifications</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-300">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">Logistics Network:</span> Global Dropship Air Express
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-300">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">Carrier Tracking Number:</span>{" "}
                <span className="font-mono bg-[#fdfdfc] dark:bg-zinc-800 border border-[#ececeb] dark:border-[#2c2c2a] py-0.5 px-1.5 text-[11px] font-semibold">
                  {order.trackingNumber || "PENDING SUPPLIER DISPATCH"}
                </span>
              </p>
              <p className="text-[10px] text-zinc-400 leading-relaxed italic font-serif">
                * Note: Delivery tracking may take 24-48 hours to activate after the tracking code is supplied.
              </p>
            </div>
          </div>

          {/* Cart items list in shipping */}
          <div className="pt-6 border-t border-[#ececeb] dark:border-[#2c2c2a]">
            <h3 className="text-[9px] font-bold text-[#aaa] uppercase tracking-[0.2em] mb-4">Shipment Manifest</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-xs py-1.5">
                  <div className="flex items-center gap-3">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-10 h-10 object-cover rounded-none bg-zinc-50 border border-[#ececeb] dark:border-[#2c2c2a]"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="font-light font-serif text-[#1a1a1a] dark:text-zinc-200">{item.name}</p>
                      <p className="text-zinc-400 text-[9px] uppercase tracking-wider">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-sm text-zinc-900 dark:text-white pt-4 border-t border-[#ececeb] dark:border-[#2c2c2a]">
                <span>Total Manifest Value</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
