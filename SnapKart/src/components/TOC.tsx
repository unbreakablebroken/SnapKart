import React from "react";
import { FileText, ShieldAlert, Truck, RefreshCw } from "lucide-react";

export default function TOC() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-6 animate-fade-in font-sans">
      <div className="text-center mb-10 border-b border-[#ececeb] dark:border-[#2c2c2a] pb-6">
        <span className="text-[9px] font-bold text-[#16a34a] uppercase tracking-[0.25em] block mb-1">Corporate Charter</span>
        <h1 className="text-3xl md:text-4xl font-light font-serif text-[#1a1a1a] dark:text-[#f5f5f2] tracking-tight">Terms of Service & Policies</h1>
        <p className="text-xs font-serif italic text-zinc-500 dark:text-zinc-400 mt-2">Effective date: June 28, 2026</p>
      </div>

      <div className="bg-white dark:bg-[#161616] border border-[#ececeb] dark:border-[#2c2c2a] rounded-none p-6 space-y-8 shadow-sm">
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
            <ShieldAlert className="w-5 h-5 text-zinc-500" />
            <h2 className="text-base font-light font-serif">1. Agreement to Terms</h2>
          </div>
          <p className="text-xs font-serif text-zinc-600 dark:text-zinc-300 leading-relaxed italic">
            By accessing or placing an order through <strong>SnapKart</strong>, you represent and warrant that you agree to be bound by these Terms of Service. If you do not agree to all terms, please refrain from using our marketplace.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
            <Truck className="w-5 h-5 text-zinc-500" />
            <h2 className="text-base font-light font-serif">2. Dropshipping Shipping Policy</h2>
          </div>
          <p className="text-xs font-serif text-zinc-600 dark:text-zinc-300 leading-relaxed italic">
            SnapKart operates a direct-to-consumer dropshipping fulfillment model. Products are shipped directly from selected supplier warehouses across global networks. 
          </p>
          <ul className="list-disc list-inside text-xs font-serif text-zinc-600 dark:text-zinc-300 space-y-1.5 pl-4">
            <li>Standard Processing time: 1-3 business days.</li>
            <li>Estimated Delivery window: 5-15 business days depending on location.</li>
            <li>Multiple-item orders may occasionally arrive in separate packages with unique tracking codes.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
            <RefreshCw className="w-5 h-5 text-zinc-500" />
            <h2 className="text-base font-light font-serif">3. Returns, Refunds & Buyer Protection</h2>
          </div>
          <p className="text-xs font-serif text-zinc-600 dark:text-zinc-300 leading-relaxed italic">
            Customer satisfaction is our utmost priority. We provide standard buyer protections:
          </p>
          <ul className="list-disc list-inside text-xs font-serif text-zinc-600 dark:text-zinc-300 space-y-1.5 pl-4">
            <li><strong>Full Refund:</strong> If your order does not arrive within the guaranteed maximum 30 business day window.</li>
            <li><strong>Damaged Items:</strong> Please report broken or incorrect items with photo evidence within 14 days of delivery for immediate free replacement or refund.</li>
            <li><strong>Change of Mind:</strong> Due to direct supplier routing, returns for change of mind require items to be returned unopened and unused to our local staging office at buyer's cost.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-light font-serif text-[#1a1a1a] dark:text-white">4. Secure Gateway Compliance</h2>
          <p className="text-xs font-serif text-zinc-600 dark:text-zinc-300 leading-relaxed italic">
            All credit card and personal identity transactions are processed through end-to-end encrypted tunnels complying with modern PCI-DSS criteria. SnapKart does not store credit card credentials on its local servers.
          </p>
        </section>

        <div className="pt-6 border-t border-[#ececeb] dark:border-[#2c2c2a] flex items-center justify-between text-[10px] uppercase tracking-wider text-zinc-400">
          <span>SnapKart Dropshipping Marketplace</span>
          <span>Security Certified PCI-DSS</span>
        </div>
      </div>
    </div>
  );
}
