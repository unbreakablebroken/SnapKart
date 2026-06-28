import React, { useState, useEffect } from "react";
import { auth, db } from "./lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Theme, Product } from "./types";
import Shop from "./components/Shop";
import Cart from "./components/Cart";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import OrderHistory from "./components/OrderHistory";
import OrderTracking from "./components/OrderTracking";
import Settings from "./components/Settings";
import TOC from "./components/TOC";
import AdminPanel from "./components/AdminPanel";
import AuthModal from "./components/AuthModal";
import { ShoppingBag, Menu, X, Sparkles, LogIn, LogOut, FileText, User, ShoppingCart, LayoutDashboard, Settings as SettingsIcon, Compass, ShieldCheck } from "lucide-react";

export default function App() {
  const [theme, setTheme] = useState<Theme>("light");
  const [activeTab, setActiveTab] = useState<string>("shop");
  const [trackingOrderId, setTrackingOrderId] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<"user" | "admin">("user");
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || "user");
          }
        } catch (err) {
          console.warn("Could not retrieve custom user metadata role:", err);
        }
      } else {
        setUserRole("user");
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("snapkart_cart_v1");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const saveCartToStorage = (newCart: typeof cart) => {
    setCart(newCart);
    localStorage.setItem("snapkart_cart_v1", JSON.stringify(newCart));
  };

  const handleAddToCart = (product: Product) => {
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      saveCartToStorage(updated);
    } else {
      saveCartToStorage([...cart, { product, quantity: 1 }]);
    }
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    const updated = cart
      .map((item) => {
        if (item.product.id === productId) {
          return { ...item, quantity: Math.max(1, item.quantity + delta) };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);
    saveCartToStorage(updated);
  };

  const handleRemoveItem = (productId: string) => {
    const updated = cart.filter((item) => item.product.id !== productId);
    saveCartToStorage(updated);
  };

  const handleClearCart = () => {
    saveCartToStorage([]);
  };

  const handleSignOut = () => {
    auth.signOut();
    setActiveTab("shop");
  };

  const getCartItemsCount = (productId: string) => {
    const item = cart.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const totalCartBadge = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  // Navigate directly with an orderId context
  const handleTrackSingleOrder = (orderId: string) => {
    setTrackingOrderId(orderId);
    setActiveTab("tracking");
  };

  // Theme layout styling wrapper variables
  const getThemeClasses = () => {
    switch (theme) {
      case "dark":
        return "bg-[#121212] text-[#f5f5f2] dark-theme";
      case "eco":
        return "bg-[#f6f9f7] text-[#112a1c] eco-theme";
      default:
        return "bg-[#fdfdfc] text-[#1a1a1a] light-theme";
    }
  };

  const getThemeTextSubtitle = () => {
    switch (theme) {
      case "eco":
        return "text-[#16a34a] font-serif italic";
      case "dark":
        return "text-zinc-400 font-serif italic";
      default:
        return "text-zinc-500 font-serif italic";
    }
  };

  const getHeaderClasses = () => {
    switch (theme) {
      case "dark":
        return "bg-[#121212]/95 border-[#2c2c2a] text-[#f5f5f2]";
      case "eco":
        return "bg-[#f6f9f7]/95 border-[#ececeb] text-[#112a1c]";
      default:
        return "bg-[#fdfdfc]/95 border-[#ececeb] text-[#1a1a1a]";
    }
  };

  const getNavButtonClasses = (tabId: string) => {
    const isActive = activeTab === tabId;
    const base = "flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest cursor-pointer transition-all duration-200";
    if (theme === "eco") {
      return `${base} ${
        isActive 
          ? "border-b-2 border-emerald-600 text-emerald-800" 
          : "text-emerald-800/60 hover:text-emerald-900 hover:border-b-2 hover:border-emerald-600/30"
      }`;
    } else if (theme === "dark") {
      return `${base} ${
        isActive 
          ? "border-b-2 border-white text-white" 
          : "text-zinc-400 hover:text-white hover:border-b-2 hover:border-white/30"
      }`;
    } else {
      return `${base} ${
        isActive 
          ? "border-b-2 border-zinc-900 text-zinc-900" 
          : "text-zinc-500 hover:text-zinc-950 hover:border-b-2 hover:border-zinc-900/30"
      }`;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${getThemeClasses()}`}>
      
      {/* Dynamic Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-300 ${getHeaderClasses()}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            onClick={() => setActiveTab("shop")} 
            className="flex flex-col justify-center cursor-pointer select-none group"
          >
            <h1 className="text-xl font-black tracking-tighter uppercase leading-none font-sans">
              Snap<span className={theme === "eco" ? "text-emerald-600" : "text-zinc-400"}>Kart</span>
            </h1>
            <p className="text-[8px] tracking-[0.25em] text-[#888] uppercase mt-1 leading-none font-sans font-semibold">
              {theme === "eco" ? "Eco-Minimalist Ops" : "Dropship Network"}
            </p>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-2">
            <button id="nav-shop" onClick={() => setActiveTab("shop")} className={getNavButtonClasses("shop")}>
              <Compass className="w-4 h-4" /> Catalog
            </button>
            {user && (
              <>
                <button id="nav-dashboard" onClick={() => setActiveTab("dashboard")} className={getNavButtonClasses("dashboard")}>
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </button>
                <button id="nav-orders" onClick={() => setActiveTab("orders")} className={getNavButtonClasses("orders")}>
                  <ShoppingBag className="w-4 h-4" /> Orders
                </button>
                <button id="nav-profile" onClick={() => setActiveTab("profile")} className={getNavButtonClasses("profile")}>
                  <User className="w-4 h-4" /> Profile
                </button>
              </>
            )}
            <button id="nav-tracking" onClick={() => { setActiveTab("tracking"); setTrackingOrderId(""); }} className={getNavButtonClasses("tracking")}>
              <Sparkles className="w-4 h-4" /> Live Tracking
            </button>
            <button id="nav-settings" onClick={() => setActiveTab("settings")} className={getNavButtonClasses("settings")}>
              <SettingsIcon className="w-4 h-4" /> Settings
            </button>
            <button id="nav-toc" onClick={() => setActiveTab("toc")} className={getNavButtonClasses("toc")}>
              <FileText className="w-4 h-4" /> Policies
            </button>
            <button id="nav-admin" onClick={() => setActiveTab("admin")} className={getNavButtonClasses("admin")}>
              <ShieldCheck className="w-4 h-4" /> Partners
            </button>
          </nav>

          {/* Right Action Menu */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <button
              id="header-cart-toggle"
              onClick={() => setActiveTab("cart")}
              className={`relative p-2 rounded-xl transition-all ${
                theme === "eco" 
                  ? "hover:bg-emerald-100/50 text-emerald-900" 
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-current"
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {totalCartBadge > 0 && (
                <span className={`absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full ${
                  theme === "eco" ? "bg-emerald-700 text-white" : "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950"
                }`}>
                  {totalCartBadge}
                </span>
              )}
            </button>

            {/* User Access Controls */}
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-xs font-semibold text-zinc-500 max-w-[100px] truncate">{user.displayName || user.email?.split("@")[0]}</span>
                <button
                  id="header-signout-btn"
                  onClick={handleSignOut}
                  className={`p-2 rounded-xl cursor-pointer transition-all ${
                    theme === "eco" ? "hover:bg-emerald-100 text-[#1c2e24]" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                  title="Secure Logout"
                >
                  <LogOut className="w-4.5 h-4.5 text-zinc-500" />
                </button>
              </div>
            ) : (
              <button
                id="header-login-trigger"
                onClick={() => setAuthModalOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer ${
                  theme === "eco"
                    ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                    : "bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900"
                }`}
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </button>
            )}

            {/* Mobile Menu Icon */}
            <button
              id="mobile-menu-trigger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 lg:hidden rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden px-4 pt-2 pb-4 border-t border-zinc-150 dark:border-zinc-800 space-y-2 animate-fade-in bg-inherit">
            <button
              id="mob-nav-shop"
              onClick={() => { setActiveTab("shop"); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 py-2 px-3 text-xs font-semibold rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <Compass className="w-4.5 h-4.5" /> Catalog Explorer
            </button>
            {user && (
              <>
                <button
                  id="mob-nav-dashboard"
                  onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 py-2 px-3 text-xs font-semibold rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <LayoutDashboard className="w-4.5 h-4.5" /> Personal Dashboard
                </button>
                <button
                  id="mob-nav-orders"
                  onClick={() => { setActiveTab("orders"); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 py-2 px-3 text-xs font-semibold rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <ShoppingBag className="w-4.5 h-4.5" /> Order Invoices
                </button>
                <button
                  id="mob-nav-profile"
                  onClick={() => { setActiveTab("profile"); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 py-2 px-3 text-xs font-semibold rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <User className="w-4.5 h-4.5" /> Shipping Profile
                </button>
              </>
            )}
            <button
              id="mob-nav-tracking"
              onClick={() => { setActiveTab("tracking"); setTrackingOrderId(""); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 py-2 px-3 text-xs font-semibold rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <Sparkles className="w-4.5 h-4.5" /> Shipment Tracker
            </button>
            <button
              id="mob-nav-settings"
              onClick={() => { setActiveTab("settings"); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 py-2 px-3 text-xs font-semibold rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <SettingsIcon className="w-4.5 h-4.5" /> Adjust Ambiance
            </button>
            <button
              id="mob-nav-toc"
              onClick={() => { setActiveTab("toc"); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 py-2 px-3 text-xs font-semibold rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <FileText className="w-4.5 h-4.5" /> Policies & Agreement
            </button>
            <button
              id="mob-nav-admin"
              onClick={() => { setActiveTab("admin"); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 py-2 px-3 text-xs font-semibold rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <ShieldCheck className="w-4.5 h-4.5" /> Partner Console
            </button>
          </div>
        )}
      </header>

      {/* Main Viewport Content */}
      <main className="flex-1 pb-16">
        {activeTab === "shop" && (
          <Shop onAddToCart={handleAddToCart} cartItemsCount={getCartItemsCount} />
        )}
        {activeTab === "cart" && (
          <Cart
            cartItems={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onNavigateToTab={(tab, orderId) => {
              setActiveTab(tab);
              if (orderId) setTrackingOrderId(orderId);
            }}
            onTriggerAuthModal={() => setAuthModalOpen(true)}
          />
        )}
        {activeTab === "dashboard" && (
          <Dashboard
            onNavigateToShop={() => setActiveTab("shop")}
            onTrackOrder={handleTrackSingleOrder}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}
        {activeTab === "orders" && (
          <OrderHistory
            onTrackOrder={handleTrackSingleOrder}
            onNavigateToShop={() => setActiveTab("shop")}
          />
        )}
        {activeTab === "profile" && <Profile />}
        {activeTab === "tracking" && (
          <OrderTracking initialOrderId={trackingOrderId} />
        )}
        {activeTab === "settings" && (
          <Settings currentTheme={theme} onThemeChange={setTheme} />
        )}
        {activeTab === "toc" && <TOC />}
        {activeTab === "admin" && <AdminPanel />}
      </main>

      {/* Footer */}
      <footer className={`py-8 px-4 border-t transition-colors duration-300 ${
        theme === "eco" ? "bg-[#eaf2ed] border-[#c6ded0] text-emerald-800/80" : "bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-400"
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <span>&copy; 2026 SnapKart Direct Dropship Network. All Rights Secured.</span>
          <div className="flex gap-4">
            <button id="footer-toc-link" onClick={() => setActiveTab("toc")} className="hover:underline cursor-pointer">Terms & Logistics Policies</button>
            <button id="footer-admin-link" onClick={() => setActiveTab("admin")} className="hover:underline cursor-pointer">Partner Access Console</button>
          </div>
        </div>
      </footer>

      {/* Auth Portal Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
