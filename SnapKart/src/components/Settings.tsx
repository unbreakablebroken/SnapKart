import React from "react";
import { Theme } from "../types";
import { Sun, Moon, Leaf, Bell, Shield, Keyboard, ToggleLeft, ToggleRight } from "lucide-react";

interface SettingsProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export default function Settings({ currentTheme, onThemeChange }: SettingsProps) {
  const [orderStatusNotifications, setOrderStatusNotifications] = React.useState(true);
  const [inventoryAlerts, setInventoryAlerts] = React.useState(false);
  const [mockBiometric, setMockBiometric] = React.useState(false);

  return (
    <div className="max-w-3xl mx-auto py-10 px-6 animate-fade-in font-sans">
      <div className="mb-10 border-b border-[#ececeb] dark:border-[#2c2c2a] pb-6">
        <span className="text-[9px] font-bold text-[#16a34a] uppercase tracking-[0.25em] block mb-1">Configuration Control</span>
        <h1 className="text-3xl md:text-4xl font-light font-serif text-[#1a1a1a] dark:text-[#f5f5f2] tracking-tight">Settings</h1>
        <p className="text-xs font-serif italic text-zinc-500 dark:text-zinc-400 mt-1">Configure SnapKart environment, security and themes.</p>
      </div>

      <div className="space-y-8">
        {/* Theme Settings */}
        <div className="bg-white dark:bg-[#161616] border border-[#ececeb] dark:border-[#2c2c2a] rounded-none p-6 shadow-sm">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-white mb-4">
            <Sun className="w-5 h-5 text-zinc-500" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#1a1a1a] dark:text-[#f5f5f2]">Appearance Theme</h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 font-serif italic">Choose an ambiance that fits your viewing style. The Eco theme utilizes a relaxing warm-green visual palette.</p>
          
          <div className="grid grid-cols-3 gap-4">
            {/* Light Theme Button */}
            <button
              id="theme-btn-light"
              onClick={() => onThemeChange("light")}
              className={`flex flex-col items-center justify-center p-5 border cursor-pointer transition-all rounded-none ${
                currentTheme === "light"
                  ? "border-black bg-zinc-50 text-zinc-900 dark:border-white dark:bg-zinc-800 dark:text-white"
                  : "border-[#ececeb] dark:border-[#2c2c2a] hover:bg-[#fbfbfa] dark:hover:bg-zinc-800/20 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <Sun className="w-5 h-5 mb-2" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Light</span>
            </button>

            {/* Dark Theme Button */}
            <button
              id="theme-btn-dark"
              onClick={() => onThemeChange("dark")}
              className={`flex flex-col items-center justify-center p-5 border cursor-pointer transition-all rounded-none ${
                currentTheme === "dark"
                  ? "border-black bg-zinc-50 text-zinc-900 dark:border-white dark:bg-zinc-800 dark:text-white"
                  : "border-[#ececeb] dark:border-[#2c2c2a] hover:bg-[#fbfbfa] dark:hover:bg-zinc-800/20 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <Moon className="w-5 h-5 mb-2" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Dark</span>
            </button>

            {/* Eco Theme Button */}
            <button
              id="theme-btn-eco"
              onClick={() => onThemeChange("eco")}
              className={`flex flex-col items-center justify-center p-5 border cursor-pointer transition-all rounded-none ${
                currentTheme === "eco"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-950/20 dark:text-emerald-400"
                  : "border-[#ececeb] dark:border-[#2c2c2a] hover:bg-[#fbfbfa] dark:hover:bg-zinc-800/20 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <Leaf className="w-5 h-5 mb-2 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Eco Green</span>
            </button>
          </div>
        </div>

        {/* Notifications Settings */}
        <div className="bg-white dark:bg-[#161616] border border-[#ececeb] dark:border-[#2c2c2a] rounded-none p-6 shadow-sm">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-white mb-4">
            <Bell className="w-5 h-5 text-zinc-500" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#1a1a1a] dark:text-[#f5f5f2]">Notification Rules</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-[#ececeb] dark:border-[#2c2c2a] pb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a] dark:text-zinc-200">Order Updates</h3>
                <p className="text-xs text-zinc-500 font-serif italic mt-0.5">Receive SMS or emails when suppliers ship your orders.</p>
              </div>
              <button 
                id="toggle-order-notifications"
                onClick={() => setOrderStatusNotifications(!orderStatusNotifications)}
                className="text-zinc-400 dark:text-zinc-600"
              >
                {orderStatusNotifications ? (
                  <ToggleRight className="w-9 h-9 text-zinc-850 dark:text-white cursor-pointer" />
                ) : (
                  <ToggleLeft className="w-9 h-9 cursor-pointer" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a] dark:text-zinc-200">Partner Inventory Alerts</h3>
                <p className="text-xs text-zinc-500 font-serif italic mt-0.5">Get notified when dropshipping supplier stock level is below 10.</p>
              </div>
              <button 
                id="toggle-inventory-alerts"
                onClick={() => setInventoryAlerts(!inventoryAlerts)}
                className="text-zinc-400 dark:text-zinc-600"
              >
                {inventoryAlerts ? (
                  <ToggleRight className="w-9 h-9 text-zinc-850 dark:text-white cursor-pointer" />
                ) : (
                  <ToggleLeft className="w-9 h-9 cursor-pointer" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white dark:bg-[#161616] border border-[#ececeb] dark:border-[#2c2c2a] rounded-none p-6 shadow-sm">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-white mb-4">
            <Shield className="w-5 h-5 text-zinc-500" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#1a1a1a] dark:text-[#f5f5f2]">Extra Verification Features</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a] dark:text-zinc-200">Mock Biometric / Passkey Login</h3>
                <p className="text-xs text-zinc-500 font-serif italic mt-0.5">Secure your session using device fingerprint credentials.</p>
              </div>
              <button 
                id="toggle-biometric"
                onClick={() => setMockBiometric(!mockBiometric)}
                className="text-zinc-400 dark:text-zinc-600"
              >
                {mockBiometric ? (
                  <ToggleRight className="w-9 h-9 text-zinc-800 dark:text-white cursor-pointer" />
                ) : (
                  <ToggleLeft className="w-9 h-9 cursor-pointer" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
