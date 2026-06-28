import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { Product } from "../types";
import { INITIAL_PRODUCTS } from "../data/initialProducts";
import { Search, Filter, ShoppingCart, Plus, HelpCircle, Package, Info, Check, CheckCircle } from "lucide-react";

interface ShopProps {
  onAddToCart: (product: Product) => void;
  cartItemsCount: (productId: string) => number;
}

export default function Shop({ onAddToCart, cartItemsCount }: ShopProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [successAddId, setSuccessAddId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const fbProducts: Product[] = [];
        querySnapshot.forEach((doc) => {
          fbProducts.push({ id: doc.id, ...doc.data() } as Product);
        });

        // Combine firebase custom products with beautiful default mock products
        // Ensure we deduplicate if needed, or simply append
        const allProducts = [...fbProducts, ...INITIAL_PRODUCTS];
        
        // Remove duplicates by ID (e.g. if we already have initial products in DB)
        const uniqueProducts = allProducts.reduce((acc: Product[], current) => {
          const x = acc.find(item => item.id === current.id);
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []);

        setProducts(uniqueProducts);
      } catch (err) {
        console.warn("Could not read products database, using beautiful default catalog.", err);
        setProducts(INITIAL_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const triggerAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid opening detailed modal
    onAddToCart(product);
    setSuccessAddId(product.id);
    setTimeout(() => setSuccessAddId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 animate-fade-in font-sans">
      {/* Intro Hero Banner */}
      <div className="mb-12 text-center space-y-3">
        <span className="text-[10px] font-bold text-[#16a34a] uppercase tracking-[0.3em] block">Curated Logistics</span>
        <h1 className="text-4xl md:text-5xl font-light font-serif text-[#1a1a1a] dark:text-[#f5f5f2] tracking-tight">
          SnapKart Catalog
        </h1>
        <div className="h-[1px] w-12 bg-[#ececeb] dark:bg-[#2c2c2a] mx-auto my-4"></div>
        <p className="text-sm font-serif italic text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
          Direct-to-consumer dropshipped products, carefully vetted for beautiful aesthetic form, high shipping speeds, and exceptional standards.
        </p>
      </div>

      {/* Catalog Search and Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 border-b border-[#ececeb] dark:border-[#2c2c2a] pb-6">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
          <input
            id="catalog-search"
            type="text"
            placeholder="Search aesthetic dropship products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-transparent border border-[#ececeb] dark:border-[#2c2c2a] rounded-none focus:outline-none focus:border-zinc-900 dark:focus:border-white text-zinc-900 dark:text-white text-xs tracking-wide"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-zinc-400 mr-1 hidden sm:block" />
          {categories.map((cat: any) => (
            <button
              id={`cat-filter-${(cat as string).replace(/\s+/g, "-")}`}
              key={cat as string}
              onClick={() => setSelectedCategory(cat as string)}
              className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-none transition-all cursor-pointer border ${
                selectedCategory === cat
                  ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                  : "bg-transparent hover:bg-[#f5f5f2] dark:hover:bg-zinc-800 text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white border-[#ececeb] dark:border-[#2c2c2a]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-[#f9f9f7] dark:bg-[#161616] border border-[#ececeb] dark:border-[#2c2c2a] rounded-none">
          <Package className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#1a1a1a] dark:text-[#f5f5f2]">No products found</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 max-w-sm mx-auto">Try clearing search filters or entering alternative terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((p) => {
            const countInCart = cartItemsCount(p.id);
            return (
              <div
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className="group bg-white dark:bg-[#161616] border border-[#ececeb] dark:border-[#2c2c2a] rounded-none overflow-hidden cursor-pointer hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image container */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-zinc-50 dark:bg-zinc-950 border-b border-[#ececeb] dark:border-[#2c2c2a]">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-102 transition-all duration-700 ease-out"
                      referrerPolicy="no-referrer"
                    />
                    {p.inventory < 15 && (
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-[8px] font-bold tracking-[0.15em] uppercase px-2 py-0.5 rounded-none">
                        Low Stock
                      </span>
                    )}
                    {countInCart > 0 && (
                      <span className="absolute top-3 right-3 bg-black dark:bg-white text-white dark:text-black text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-none">
                        {countInCart} In Cart
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-2">
                    <span className="text-[9px] font-bold text-[#16a34a] uppercase tracking-[0.2em]">{p.category}</span>
                    <h3 className="text-lg font-light font-serif text-[#1a1a1a] dark:text-[#f5f5f2] group-hover:text-[#16a34a] transition-all truncate">
                      {p.name}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/40 mt-2">
                  <span className="text-base font-medium font-serif text-[#1a1a1a] dark:text-[#f5f5f2]">${p.price.toFixed(2)}</span>
                  <button
                    id={`add-cart-btn-${p.id}`}
                    onClick={(e) => triggerAddToCart(p, e)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black text-[10px] font-bold uppercase tracking-widest rounded-none transition-all"
                  >
                    {successAddId === p.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Added
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div 
            id="detail-modal-card"
            className="bg-[#fdfdfc] dark:bg-[#161616] border border-[#ececeb] dark:border-[#2c2c2a] rounded-none max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative shadow-2xl transition-all"
          >
            <button
              id="close-detail-modal"
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-black dark:hover:text-white transition-all"
            >
              <Plus className="w-6 h-6 rotate-45" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="aspect-square rounded-none overflow-hidden bg-[#fbfbfa] border border-[#ececeb] dark:border-[#2c2c2a]">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <span className="text-[9px] font-bold text-[#16a34a] uppercase tracking-[0.2em]">{selectedProduct.category}</span>
                  <h2 className="text-2xl font-light font-serif text-[#1a1a1a] dark:text-[#f5f5f2] leading-tight">{selectedProduct.name}</h2>
                  <p className="text-xl font-medium font-serif text-[#1a1a1a] dark:text-[#f5f5f2]">${selectedProduct.price.toFixed(2)}</p>
                  
                  <div className="h-[1px] w-8 bg-[#ececeb] dark:bg-[#2c2c2a] my-2"></div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed pt-1 font-sans">
                    {selectedProduct.description}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#ececeb] dark:border-[#2c2c2a]">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    <Info className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Est. Delivery: <strong className="text-zinc-800 dark:text-zinc-200">5-8 Business Days</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    <Package className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Warehouse stock: <strong className="text-zinc-800 dark:text-zinc-200">{selectedProduct.inventory} units</strong></span>
                  </div>

                  <button
                    id="modal-add-to-cart"
                    onClick={(e) => {
                      onAddToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black text-[10px] font-bold uppercase tracking-widest rounded-none transition-all shadow-md mt-4"
                  >
                    <ShoppingCart className="w-4 h-4" /> Add to Order Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
