import React, { useState, useEffect } from "react";
import { db, auth } from "../lib/firebase";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Product, Order } from "../types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ShieldCheck, Plus, Package, FileText, Settings, RefreshCw, Trash2, CheckCircle, Search, Edit2, TrendingUp, DollarSign } from "lucide-react";

export default function AdminPanel() {
  const [partnerVerified, setPartnerVerified] = useState(false);
  const [partnerCode, setPartnerCode] = useState("");
  const [partnerError, setPartnerError] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // New product form states
  const [newProdName, setNewProdName] = useState("");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdWholesale, setNewProdWholesale] = useState("");
  const [newProdImage, setNewProdImage] = useState("");
  const [newProdInventory, setNewProdInventory] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Tech & Gadgets");
  
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Edit tracking states
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editTrackingNum, setEditTrackingNum] = useState("");
  const [editStatus, setEditStatus] = useState<Order["status"]>("pending");

  // Load admin data once verified
  useEffect(() => {
    if (partnerVerified) {
      fetchAdminData();
    }
  }, [partnerVerified]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch Products
      const prodSnap = await getDocs(collection(db, "products"));
      const loadedProducts: Product[] = [];
      prodSnap.forEach((doc) => {
        loadedProducts.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(loadedProducts);

      // Fetch Orders
      const orderSnap = await getDocs(collection(db, "orders"));
      const loadedOrders: Order[] = [];
      orderSnap.forEach((doc) => {
        loadedOrders.push({ id: doc.id, ...doc.data() } as Order);
      });
      setOrders(loadedOrders);
    } catch (err) {
      console.error("Admin data fetching failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePartnerVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setPartnerError("");

    // Accept typical demo codes: "SNAPKART_PARTNER_2026" or "PARTNER777" or check if current user has admin role
    const codeClean = partnerCode.trim().toUpperCase();
    if (codeClean === "SNAPKART_PARTNER_2026" || codeClean === "PARTNER777" || codeClean === "ADMIN") {
      setPartnerVerified(true);
    } else {
      setPartnerError("Invalid partner credentials code. (Try code: PARTNER777)");
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError("");
    setUploadSuccess(false);

    if (!newProdName || !newProdDesc || !newProdPrice || !newProdWholesale || !newProdInventory || !newProdImage) {
      setUploadError("Please fulfill all product fields.");
      return;
    }

    try {
      const priceNum = parseFloat(newProdPrice);
      const wholesaleNum = parseFloat(newProdWholesale);
      const inventoryNum = parseInt(newProdInventory);

      if (isNaN(priceNum) || isNaN(wholesaleNum) || isNaN(inventoryNum)) {
        setUploadError("Prices and stock levels must be numerical.");
        return;
      }

      const docRef = await addDoc(collection(db, "products"), {
        name: newProdName,
        description: newProdDesc,
        price: priceNum,
        wholesalePrice: wholesaleNum,
        image: newProdImage,
        inventory: inventoryNum,
        category: newProdCategory,
        createdAt: new Date().toISOString(),
        createdBy: auth.currentUser?.uid || "partner_admin",
      });

      setUploadSuccess(true);
      setNewProdName("");
      setNewProdDesc("");
      setNewProdPrice("");
      setNewProdWholesale("");
      setNewProdImage("");
      setNewProdInventory("");
      
      fetchAdminData();
    } catch (err: any) {
      console.error(err);
      setUploadError("Failed to upload product record inside Firestore: " + err.message);
    }
  };

  const handleDeleteProduct = async (prodId: string) => {
    if (!window.confirm("Confirm deletion of this dropshipping item?")) return;
    try {
      await deleteDoc(doc(db, "products", prodId));
      fetchAdminData();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleUpdateOrder = async (orderId: string) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: editStatus,
        trackingNumber: editTrackingNum,
      });
      setEditingOrderId(null);
      fetchAdminData();
    } catch (err) {
      console.error("Order status update failed:", err);
    }
  };

  // Financial statistics calculations
  const calculateFinancials = () => {
    let totalRev = 0;
    let totalCost = 0;
    orders.forEach((o) => {
      totalRev += o.totalAmount;
      // Calculate supplier costs
      o.items.forEach((item) => {
        // If wholesalePrice is missing, simulate 40% supplier cost
        const matchedProduct = products.find((p) => p.id === item.productId);
        const wsPrice = matchedProduct ? matchedProduct.wholesalePrice : item.price * 0.4;
        totalCost += wsPrice * item.quantity;
      });
    });

    const profit = totalRev - totalCost;
    return {
      revenue: totalRev,
      cost: totalCost,
      profit: profit,
    };
  };

  if (!partnerVerified) {
    return (
      <div className="max-w-md mx-auto py-16 px-6 animate-fade-in font-sans">
        <div className="bg-white dark:bg-[#161616] border border-[#ececeb] dark:border-[#2c2c2a] rounded-none p-6 text-center space-y-6">
          <div className="inline-flex p-3 border border-[#ececeb] dark:border-[#2c2c2a] text-zinc-900 dark:text-white rounded-none bg-[#fbfbfa] dark:bg-zinc-800/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <span className="text-[9px] font-bold text-[#16a34a] uppercase tracking-[0.25em] block">Security Verification</span>
            <h2 className="text-xl font-light font-serif text-[#1a1a1a] dark:text-white">Partner Credentials</h2>
            <p className="text-xs font-serif italic text-zinc-500 dark:text-zinc-400 leading-relaxed">Exclusive console for you and your other 2 partners to upload products, monitor logistics margins, and dispatch carrier codes.</p>
          </div>

          {partnerError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-950/40 text-red-600 dark:text-red-400 text-[11px] rounded-none font-serif italic">
              {partnerError}
            </div>
          )}

          <form onSubmit={handlePartnerVerify} className="space-y-4">
            <input
              id="partner-code-input"
              type="password"
              placeholder="Enter Partner Access Token (Code: PARTNER777)"
              value={partnerCode}
              onChange={(e) => setPartnerCode(e.target.value)}
              className="w-full pl-4 pr-4 py-3 bg-[#fbfbfa] dark:bg-zinc-800/10 border border-[#ececeb] dark:border-[#2c2c2a] rounded-none focus:outline-none focus:border-black text-zinc-900 dark:text-white text-center text-xs"
            />
            <button
              id="verify-partner-btn"
              type="submit"
              className="w-full py-3.5 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-bold uppercase tracking-widest text-[10px] rounded-none shadow-md transition-all cursor-pointer"
            >
              Verify Session
            </button>
          </form>
        </div>
      </div>
    );
  }

  const financials = calculateFinancials();

  // Recharts Chart Data
  const marginChartData = [
    { name: "Gross Sales Revenue", Amount: financials.revenue },
    { name: "Wholesale Supplier COGS", Amount: financials.cost },
    { name: "Net Profit Margin", Amount: financials.profit },
  ];

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 space-y-10 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ececeb] dark:border-[#2c2c2a] pb-6">
        <div>
          <span className="text-[9px] font-bold text-[#16a34a] uppercase tracking-[0.25em] block mb-1">Partners Portal</span>
          <h1 className="text-3xl md:text-4xl font-light font-serif text-[#1a1a1a] dark:text-[#f5f5f2] tracking-tight">SnapKart Partner Panel</h1>
          <p className="text-xs font-serif italic text-zinc-500 dark:text-zinc-400 mt-1">Unified administrative board tracking stock allocations, supplier expenses, and client dispatches.</p>
        </div>
        <button
          id="refresh-admin-panel"
          onClick={fetchAdminData}
          className="flex items-center gap-1.5 py-2 px-4 bg-[#fbfbfa] hover:bg-zinc-150 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-bold uppercase tracking-widest rounded-none border border-[#ececeb] dark:border-[#2c2c2a] transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Systems
        </button>
      </div>

      {/* Financial Health Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#161616] border border-[#ececeb] dark:border-[#2c2c2a] rounded-none p-5 flex items-center gap-4">
          <div className="p-3 border border-[#ececeb] dark:border-[#2c2c2a] bg-[#fdfdfc] dark:bg-zinc-800 rounded-none text-zinc-950 dark:text-white">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-[#aaa] uppercase tracking-[0.2em]">Gross Sales</p>
            <h3 className="text-xl font-light font-serif text-[#1a1a1a] dark:text-white">${financials.revenue.toFixed(2)}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#161616] border border-[#ececeb] dark:border-[#2c2c2a] rounded-none p-5 flex items-center gap-4">
          <div className="p-3 border border-[#ececeb] dark:border-[#2c2c2a] bg-[#fdfdfc] dark:bg-zinc-800 rounded-none text-zinc-950 dark:text-white">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-[#aaa] uppercase tracking-[0.2em]">Supplier COGS</p>
            <h3 className="text-xl font-light font-serif text-[#1a1a1a] dark:text-white">${financials.cost.toFixed(2)}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#161616] border border-[#ececeb] dark:border-[#2c2c2a] rounded-none p-5 flex items-center gap-4">
          <div className="p-3 border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/40 dark:bg-emerald-950/10 text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-[#aaa] uppercase tracking-[0.2em]">Net Margin Profit</p>
            <h3 className="text-xl font-light font-serif text-[#1a1a1a] dark:text-white">${financials.profit.toFixed(2)}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#161616] border border-[#ececeb] dark:border-[#2c2c2a] rounded-none p-5 flex items-center gap-4">
          <div className="p-3 border border-[#ececeb] dark:border-[#2c2c2a] bg-[#fdfdfc] dark:bg-zinc-800 rounded-none text-zinc-950 dark:text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-[#aaa] uppercase tracking-[0.2em]">Partners Enrolled</p>
            <h3 className="text-xl font-light font-serif text-[#1a1a1a] dark:text-white">3 Active</h3>
          </div>
        </div>
      </div>

      {/* Margin and Profit Visualizer Chart */}
      <div className="bg-white dark:bg-[#161616] border border-[#ececeb] dark:border-[#2c2c2a] rounded-none p-6">
        <h3 className="text-[10px] font-bold text-[#1a1a1a] dark:text-white uppercase tracking-widest mb-4">Logistics Profit Margins Visualizer</h3>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={marginChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "rgba(255, 255, 255, 0.98)", 
                  border: "1px solid #ececeb", 
                  borderRadius: "0px", 
                  fontSize: "11px" 
                }} 
              />
              <Bar dataKey="Amount" fill="#1a1a1a" radius={[0, 0, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Products Panel */}
        <div className="bg-white dark:bg-[#161616] border border-[#ececeb] dark:border-[#2c2c2a] rounded-none p-6 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-[#ececeb] dark:border-[#2c2c2a]">
            <Plus className="w-4 h-4 text-zinc-500" />
            <h3 className="text-xs font-bold text-[#1a1a1a] dark:text-white uppercase tracking-widest">Upload Dropshipping Item</h3>
          </div>

          {uploadSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-none border border-emerald-100 font-serif italic">
              Product registered successfully in SnapKart supplier list!
            </div>
          )}

          {uploadError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs rounded-none border border-red-100 font-serif italic">
              {uploadError}
            </div>
          )}

          <form onSubmit={handleAddProduct} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-[#aaa] uppercase tracking-[0.2em] mb-1.5">Item Title</label>
                <input
                  id="admin-product-name"
                  type="text"
                  required
                  placeholder="Premium Smart Ring"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-[#fbfbfa] dark:bg-zinc-800/10 border border-[#ececeb] dark:border-[#2c2c2a] rounded-none focus:outline-none focus:border-zinc-900 text-[#1a1a1a] dark:text-white font-serif"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-[#aaa] uppercase tracking-[0.2em] mb-1.5">Collection</label>
                <select
                  id="admin-product-category"
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-[#fbfbfa] dark:bg-zinc-800/10 border border-[#ececeb] dark:border-[#2c2c2a] rounded-none focus:outline-none focus:border-zinc-900 text-[#1a1a1a] dark:text-white font-serif"
                >
                  <option>Tech & Gadgets</option>
                  <option>Aesthetic Home</option>
                  <option>Minimal Apparel</option>
                  <option>Fitness & Wellness</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-[#aaa] uppercase tracking-[0.2em] mb-1.5">Wholesale Cost</label>
                <input
                  id="admin-product-wholesale"
                  type="text"
                  required
                  placeholder="24.00"
                  value={newProdWholesale}
                  onChange={(e) => setNewProdWholesale(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-[#fbfbfa] dark:bg-zinc-800/10 border border-[#ececeb] dark:border-[#2c2c2a] rounded-none focus:outline-none focus:border-zinc-900 text-[#1a1a1a] dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-[#aaa] uppercase tracking-[0.2em] mb-1.5">Retail Price</label>
                <input
                  id="admin-product-price"
                  type="text"
                  required
                  placeholder="59.00"
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-[#fbfbfa] dark:bg-zinc-800/10 border border-[#ececeb] dark:border-[#2c2c2a] rounded-none focus:outline-none focus:border-zinc-900 text-[#1a1a1a] dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-[#aaa] uppercase tracking-[0.2em] mb-1.5">Warehouse Stock</label>
                <input
                  id="admin-product-inventory"
                  type="text"
                  required
                  placeholder="150"
                  value={newProdInventory}
                  onChange={(e) => setNewProdInventory(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-[#fbfbfa] dark:bg-zinc-800/10 border border-[#ececeb] dark:border-[#2c2c2a] rounded-none focus:outline-none focus:border-zinc-900 text-[#1a1a1a] dark:text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-[#aaa] uppercase tracking-[0.2em] mb-1.5">High-Res Image URL</label>
              <input
                id="admin-product-image"
                type="text"
                required
                placeholder="https://images.unsplash.com/..."
                value={newProdImage}
                onChange={(e) => setNewProdImage(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-[#fbfbfa] dark:bg-zinc-800/10 border border-[#ececeb] dark:border-[#2c2c2a] rounded-none focus:outline-none focus:border-zinc-900 text-[#1a1a1a] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold text-[#aaa] uppercase tracking-[0.2em] mb-1.5">Description</label>
              <textarea
                id="admin-product-desc"
                rows={3}
                required
                placeholder="Details specifications, material composition, sizes, supplier warranty tags..."
                value={newProdDesc}
                onChange={(e) => setNewProdDesc(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-[#fbfbfa] dark:bg-zinc-800/10 border border-[#ececeb] dark:border-[#2c2c2a] rounded-none focus:outline-none focus:border-zinc-900 text-[#1a1a1a] dark:text-white resize-none font-serif italic leading-relaxed"
              />
            </div>

            <button
              id="admin-product-submit"
              type="submit"
              className="w-full py-3.5 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-bold uppercase tracking-widest text-[10px] rounded-none transition-all cursor-pointer"
            >
              Upload Active Catalog Item
            </button>
          </form>
        </div>

        {/* Catalog list manager */}
        <div className="bg-white dark:bg-[#161616] border border-[#ececeb] dark:border-[#2c2c2a] rounded-none p-6 shadow-none space-y-4 max-h-[620px] overflow-y-auto">
          <div className="flex items-center gap-2 pb-3 border-b border-[#ececeb] dark:border-[#2c2c2a]">
            <Package className="w-4 h-4 text-zinc-500" />
            <h3 className="text-xs font-bold text-[#1a1a1a] dark:text-white uppercase tracking-widest">Active Product Assets ({products.length})</h3>
          </div>

          <div className="space-y-3">
            {products.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3.5 bg-[#fbfbfa] dark:bg-zinc-850/50 rounded-none border border-[#ececeb] dark:border-[#2c2c2a]">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-none border border-[#ececeb] dark:border-[#2c2c2a] bg-zinc-100" referrerPolicy="no-referrer" />
                  <div className="min-w-0">
                    <p className="text-xs font-light font-serif text-zinc-900 dark:text-white truncate">{p.name}</p>
                    <p className="text-[10px] text-zinc-400 font-serif italic">Stock: <span className="font-semibold">{p.inventory}</span> | Category: {p.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">${p.price.toFixed(2)}</span>
                  <button
                    id={`admin-del-prod-${p.id}`}
                    onClick={() => handleDeleteProduct(p.id)}
                    className="p-1.5 text-zinc-400 hover:text-red-500 rounded-none border border-[#ececeb] dark:border-[#2c2c2a] transition-all cursor-pointer hover:bg-red-50"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Dispatch manager */}
      <div className="bg-white dark:bg-[#161616] border border-[#ececeb] dark:border-[#2c2c2a] rounded-none p-6 shadow-none space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#ececeb] dark:border-[#2c2c2a]">
          <FileText className="w-4 h-4 text-zinc-500" />
          <h3 className="text-xs font-bold text-[#1a1a1a] dark:text-white uppercase tracking-widest">Supplier Logistics Control Center ({orders.length} orders)</h3>
        </div>

        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="p-4 bg-[#fdfdfc] dark:bg-zinc-850/50 rounded-none border border-[#ececeb] dark:border-[#2c2c2a] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#ececeb] dark:border-[#2c2c2a]">
                <div>
                  <span className="text-[9px] font-bold text-[#aaa] uppercase tracking-wider block">ID REFERENCE</span>
                  <span className="text-xs font-mono font-bold text-[#1a1a1a] dark:text-zinc-200">{o.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 font-serif italic">{o.customerEmail}</span>
                  <span className={`inline-flex items-center px-3 py-0.5 text-[9px] font-bold border uppercase tracking-wider ${
                    o.status === "delivered" 
                      ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/20"
                      : o.status === "shipped" || o.status === "out_for_delivery"
                      ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/20"
                      : "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/20"
                  }`}>
                    {o.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              {editingOrderId === o.id ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-[9px] font-bold text-[#aaa] uppercase tracking-wider mb-1.5">Set Delivery State</label>
                    <select
                      id={`edit-status-select-${o.id}`}
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as Order["status"])}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-[#ececeb] dark:border-[#2c2c2a] rounded-none font-serif"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="out_for_delivery">Out For Delivery</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-[#aaa] uppercase tracking-wider mb-1.5">Carrier Tracking Number</label>
                    <input
                      id={`edit-tracking-input-${o.id}`}
                      type="text"
                      value={editTrackingNum}
                      onChange={(e) => setEditTrackingNum(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-[#ececeb] dark:border-[#2c2c2a] rounded-none font-mono"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      id={`save-order-btn-${o.id}`}
                      onClick={() => handleUpdateOrder(o.id)}
                      className="flex-1 py-2 px-3 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black text-[10px] font-bold uppercase tracking-widest rounded-none cursor-pointer"
                    >
                      Save Dispatch
                    </button>
                    <button
                      id={`cancel-order-btn-${o.id}`}
                      onClick={() => setEditingOrderId(null)}
                      className="py-2 px-3 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-250 text-[10px] font-bold uppercase tracking-widest rounded-none cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-1">
                  <div className="text-xs text-zinc-500 font-serif italic">
                    Carrier Tracking: <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{o.trackingNumber || "PENDING SUPPLIER DISPATCH"}</span>
                  </div>
                  <button
                    id={`edit-order-btn-${o.id}`}
                    onClick={() => {
                      setEditingOrderId(o.id);
                      setEditTrackingNum(o.trackingNumber || "");
                      setEditStatus(o.status);
                    }}
                    className="flex items-center gap-1.5 py-1.5 px-3 border border-[#ececeb] dark:border-[#2c2c2a] bg-white dark:bg-zinc-900 hover:bg-[#fbfbfa] dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[9px] font-bold uppercase tracking-wider rounded-none cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" /> Update Logistics Status
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
