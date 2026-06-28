import React, { useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { User, Mail, MapPin, CheckCircle, Shield, AlertTriangle } from "lucide-react";

export default function Profile() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        setCurrentUser(user);
        setName(user.displayName || "");
        setEmail(user.email || "");

        // Fetch custom firestore metadata
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setAddress(data.address || "");
            setRole(data.role || "user");
          }
        } catch (err) {
          console.error("Error reading profile document:", err);
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setUpdating(true);
    setSuccess(false);

    try {
      // Update firestore data
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        name,
        address
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error("Error updating profile document:", err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-full inline-flex mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">No active profile</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Please sign up or sign in to view your user dashboard, profile and start dropshipping.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-6 animate-fade-in font-sans">
      <div className="mb-10 flex items-center justify-between border-b border-[#ececeb] dark:border-[#2c2c2a] pb-6">
        <div>
          <span className="text-[9px] font-bold text-[#16a34a] uppercase tracking-[0.25em] block mb-1">Account Console</span>
          <h1 className="text-3xl md:text-4xl font-light font-serif text-[#1a1a1a] dark:text-[#f5f5f2] tracking-tight">Your Profile</h1>
          <p className="text-xs font-serif italic text-zinc-500 dark:text-zinc-400 mt-1">Manage billing, shipping and secure merchant credentials.</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#fdfdfc] dark:bg-zinc-800 border border-[#ececeb] dark:border-[#2c2c2a] rounded-none text-[9px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
          <Shield className="w-3.5 h-3.5" />
          Role: <span className="text-zinc-900 dark:text-white">{role}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-[#161616] border border-[#ececeb] dark:border-[#2c2c2a] rounded-none p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#ececeb] dark:border-[#2c2c2a]">
          <div className="w-16 h-16 rounded-none border border-[#ececeb] dark:border-[#2c2c2a] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 text-2xl font-light font-serif">
            {name ? name.charAt(0).toUpperCase() : email.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-light font-serif text-[#1a1a1a] dark:text-white">{name || "Aesthetic Shopper"}</h2>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              {email}
              {currentUser.emailVerified ? (
                <span className="flex items-center gap-0.5 text-[#16a34a] font-bold uppercase tracking-wider text-[9px]">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider text-[9px]">
                  (Simulated Verified)
                </span>
              )}
            </div>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-none border border-emerald-100 dark:border-emerald-950/40 font-medium">
            Profile changes and shipping defaults saved successfully!
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-[9px] font-bold text-[#aaa] uppercase tracking-[0.2em] mb-1.5">DISPLAY NAME</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
              <input
                id="profile-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-xs bg-[#fbfbfa] dark:bg-zinc-800/10 border border-[#ececeb] dark:border-[#2c2c2a] rounded-none focus:outline-none focus:border-zinc-900 text-[#1a1a1a] dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-bold text-[#aaa] uppercase tracking-[0.2em] mb-1.5">EMAIL (READ-ONLY)</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
              <input
                id="profile-email-readonly"
                type="email"
                disabled
                value={email}
                className="w-full pl-10 pr-4 py-3 text-xs bg-zinc-100 dark:bg-zinc-800/20 border border-[#ececeb] dark:border-[#2c2c2a] rounded-none text-zinc-500 cursor-not-allowed focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-bold text-[#aaa] uppercase tracking-[0.2em] mb-1.5">DEFAULT SHIPPING ADDRESS</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-zinc-400" />
              <textarea
                id="profile-address-textarea"
                rows={3}
                placeholder="123 Minimalism Ave, Suite 404, Copenhagen, Denmark"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-xs bg-[#fbfbfa] dark:bg-zinc-800/10 border border-[#ececeb] dark:border-[#2c2c2a] rounded-none focus:outline-none focus:border-zinc-900 text-[#1a1a1a] dark:text-white leading-relaxed resize-none font-serif italic"
              />
            </div>
          </div>

          <button
            id="profile-submit-btn"
            type="submit"
            disabled={updating}
            className="w-full py-3.5 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-bold uppercase tracking-widest text-[10px] rounded-none transition-all cursor-pointer disabled:opacity-50"
          >
            {updating ? "Saving Changes..." : "Save Profile Defaults"}
          </button>
        </form>
      </div>
    </div>
  );
}
