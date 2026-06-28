import React, { useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { Order } from "../types";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ShieldCheck, TrendingUp, ShoppingBag, CreditCard, Clock, ChevronRight, BarChart2 } from "lucide-react";

interface DashboardProps {
  onNavigateToShop: () => void;
  onTrackOrder: (orderId: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function Dashboard({ onNavigateToShop, onTrackOrder, onNavigateToTab }: DashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSpent: 0,
    totalOrders: 0,
    activeDeliveries: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const loadedOrders: Order[] = [];
        let spentSum = 0;
        let activeCount = 0;

        querySnapshot.forEach((doc) => {
          const ord = { id: doc.id, ...doc.data() } as Order;
          loadedOrders.push(ord);
          spentSum += ord.totalAmount;
          if (ord.status !== "delivered") {
            activeCount++;
          }
        });

        setOrders(loadedOrders);
        setStats({
          totalSpent: spentSum,
          totalOrders: loadedOrders.length,
          activeDeliveries: activeCount,
        });
      } catch (err) {
        console.error("Error reading dashboard orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format chart data based on user orders (or mock statistics if they have 0-1 orders)
  const getChartData = () => {
    if (orders.length > 2) {
      return [...orders]
        .reverse()
        .map((o) => ({
          name: new Date(o.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          Amount: o.totalAmount,
        }));
    }
    // Beautiful default trends for aesthetic placeholder charts
    return [
      { name: "May 10", Amount: 34 },
      { name: "Jun 01", Amount: 79 },
      { name: "Jun 12", Amount: 129 },
      { name: "Jun 20", Amount: 49 },
      { name: "Jun 28", Amount: stats.totalSpent > 0 ? stats.totalSpent : 95 },
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white"></div>
      </div>
    );
  }

  const chartData = getChartData();

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 animate-fade-in font-sans">
      {/* Welcome Banner */}
      <div className="mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white dark:bg-[#161616] border border-[#ececeb] dark:border-[#2c2c2a] rounded-none p-8">
        <div className="space-y-1">
          <span className="text-[9px] font-bold text-[#16a34a] uppercase tracking-[0.25em] block">Dashboard Console</span>
          <h1 className="text-3xl font-light font-serif text-[#1a1a1a] dark:text-[#f5f5f2] tracking-tight">
            Welcome back, {auth.currentUser?.displayName || auth.currentUser?.email?.split("@")[0] || "Shopper"}
          </h1>
          <p className="text-xs font-serif italic text-zinc-500 dark:text-zinc-400">
            Secure, minimalist dropshipping order operations.
          </p>
        </div>
        <button
          id="dashboard-explore-catalog"
          onClick={onNavigateToShop}
          className="py-3 px-6 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black text-[10px] font-bold uppercase tracking-widest rounded-none transition-all shrink-0"
        >
          Explore Catalog
        </button>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-[#161616] border border-[#ececeb] dark:border-[#2c2c2a] rounded-none p-6 flex items-center gap-4">
          <div className="p-3 bg-[#fdfdfc] dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-[#ececeb] dark:border-[#2c2c2a]">
            <CreditCard className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-[#aaa] uppercase tracking-[0.2em]">Total Capital Spent</p>
            <h3 className="text-2xl font-light font-serif text-[#1a1a1a] dark:text-[#f5f5f2] mt-0.5">${stats.totalSpent.toFixed(2)}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#161616] border border-[#ececeb] dark:border-[#2c2c2a] rounded-none p-6 flex items-center gap-4">
          <div className="p-3 bg-[#fdfdfc] dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-[#ececeb] dark:border-[#2c2c2a]">
            <ShoppingBag className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-[#aaa] uppercase tracking-[0.2em]">Processed Orders</p>
            <h3 className="text-2xl font-light font-serif text-[#1a1a1a] dark:text-[#f5f5f2] mt-0.5">{stats.totalOrders}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#161616] border border-[#ececeb] dark:border-[#2c2c2a] rounded-none p-6 flex items-center gap-4">
          <div className="p-3 bg-[#fdfdfc] dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-[#ececeb] dark:border-[#2c2c2a]">
            <Clock className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-[#aaa] uppercase tracking-[0.2em]">Active Packages</p>
            <h3 className="text-2xl font-light font-serif text-[#1a1a1a] dark:text-[#f5f5f2] mt-0.5">{stats.activeDeliveries}</h3>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Chart & Spending Analysis */}
        <div className="bg-white dark:bg-[#161616] border border-[#ececeb] dark:border-[#2c2c2a] rounded-none p-6 md:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-[#ececeb] dark:border-[#2c2c2a] pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-zinc-500" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#1a1a1a] dark:text-[#f5f5f2]">Shopping Analytics</h3>
            </div>
            <span className="text-[9px] font-bold text-[#aaa] uppercase tracking-[0.15em] bg-[#f5f5f2] dark:bg-zinc-800 py-1 px-2.5">
              {stats.totalOrders > 2 ? "Personal" : "Aesthetic Trends"}
            </span>
          </div>

          <div className="h-48 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#aaaaaa" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#aaaaaa" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#fdfdfc", 
                    border: "1px solid #ececeb", 
                    borderRadius: "0px",
                    fontSize: "11px",
                    color: "#1a1a1a" 
                  }} 
                />
                <Area type="monotone" dataKey="Amount" stroke="#16a34a" strokeWidth={1.5} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Order Watchlist */}
        <div className="bg-white dark:bg-[#161616] border border-[#ececeb] dark:border-[#2c2c2a] rounded-none p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-[#ececeb] dark:border-[#2c2c2a] pb-4">
              <Clock className="w-4 h-4 text-zinc-500" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#1a1a1a] dark:text-[#f5f5f2]">Transit Watchlist</h3>
            </div>

            {orders.filter(o => o.status !== "delivered").length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-zinc-400 font-serif italic">No pending active shipments.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders
                  .filter(o => o.status !== "delivered")
                  .slice(0, 3)
                  .map((o) => (
                    <div 
                      key={o.id} 
                      onClick={() => onTrackOrder(o.id)}
                      className="group flex items-center justify-between p-3 rounded-none hover:bg-[#f9f9f7] dark:hover:bg-zinc-800/40 border border-[#ececeb] dark:border-[#2c2c2a] cursor-pointer transition-all"
                    >
                      <div className="min-w-0">
                        <p className="text-[10px] font-mono text-[#1a1a1a] dark:text-white truncate font-bold uppercase tracking-wider">{o.id}</p>
                        <p className="text-[9px] text-[#16a34a] font-bold uppercase tracking-widest mt-0.5">Status: {o.status.replace(/_/g, " ")}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-all shrink-0" />
                    </div>
                  ))}
              </div>
            )}
          </div>

          <button
            id="dashboard-view-all-orders"
            onClick={() => onNavigateToTab("orders")}
            className="w-full mt-6 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-black dark:hover:text-white pt-4 border-t border-[#ececeb] dark:border-[#2c2c2a] transition-all cursor-pointer"
          >
            Manage Order Logs
          </button>
        </div>
      </div>
    </div>
  );
}
