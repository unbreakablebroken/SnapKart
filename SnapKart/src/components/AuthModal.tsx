import React, { useState } from "react";
import { auth, googleProvider } from "../lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, updateProfile, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { X, Mail, Lock, User, ShieldCheck, HelpCircle } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update name
        await updateProfile(user, { displayName: name });
        
        // Try sending email verification (simulated or real depending on Firebase config)
        try {
          await sendEmailVerification(user);
          setVerificationSent(true);
        } catch (verifErr) {
          console.warn("Could not send real email verification:", verifErr);
        }

        // Initialize user record in Firestore
        await setDoc(doc(db, "users", user.uid), {
          id: user.uid,
          name: name || user.email?.split("@")[0] || "Shopper",
          email: user.email,
          role: "user", // Default role is user
          createdAt: new Date().toISOString()
        });

      } else {
        // Sign In
        await signInWithEmailAndPassword(auth, email, password);
      }
      
      if (!isSignUp || !verificationSent) {
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email address is already in use.");
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        setError("Invalid email or password. Please try again.");
      } else {
        setError(err.message || "An error occurred during authentication.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      // Check if user already exists, if not initialize profile
      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        name: user.displayName || user.email?.split("@")[0] || "Google Shopper",
        email: user.email,
        role: "user",
        createdAt: new Date().toISOString()
      }, { merge: true });

      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to authenticate with Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleSandboxLogin = async (role: "user" | "admin") => {
    setError("");
    setLoading(true);
    const mockEmail = role === "admin" ? "partner@snapkart-admin.com" : "customer@snapkart.com";
    const mockPass = "snapkart2026";
    const mockName = role === "admin" ? "Partner (Admin)" : "Demo Customer";

    try {
      // Try to sign in first
      try {
        await signInWithEmailAndPassword(auth, mockEmail, mockPass);
      } catch (signInErr: any) {
        // If user doesn't exist, create it
        if (signInErr.code === "auth/user-not-found" || signInErr.code === "auth/invalid-credential") {
          const userCredential = await createUserWithEmailAndPassword(auth, mockEmail, mockPass);
          const user = userCredential.user;
          await updateProfile(user, { displayName: mockName });
          
          await setDoc(doc(db, "users", user.uid), {
            id: user.uid,
            name: mockName,
            email: mockEmail,
            role: role,
            createdAt: new Date().toISOString()
          });
        } else {
          throw signInErr;
        }
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setError("Sandbox login failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-fade-in font-sans">
      <div 
        id="auth-modal-card"
        className="relative w-full max-w-md p-6 bg-white dark:bg-[#161616] border border-[#ececeb] dark:border-[#2c2c2a] rounded-none shadow-xl transition-all duration-300"
      >
        <button 
          id="close-auth-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-black dark:hover:text-white rounded-none transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {verificationSent ? (
          <div className="text-center py-6">
            <div className="inline-flex p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-none mb-4 border border-emerald-100 dark:border-emerald-900/30">
              <Mail className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-light font-serif text-[#1a1a1a] dark:text-white mb-2">Verify your email</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 font-serif italic leading-relaxed">
              We have sent a verification link to <span className="font-bold text-zinc-800 dark:text-zinc-200">{email}</span>. Please verify your account to start shopping!
            </p>
            <button
              id="confirm-verification-btn"
              onClick={() => {
                setVerificationSent(false);
                onClose();
              }}
              className="w-full py-3 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-bold uppercase tracking-widest text-[10px] rounded-none transition-all cursor-pointer"
            >
              Back to Store
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <span className="text-[9px] font-bold text-[#16a34a] uppercase tracking-[0.25em] block mb-1">Gatekeeper Portal</span>
              <h2 className="text-2xl font-light font-serif text-[#1a1a1a] dark:text-white">
                {isSignUp ? "Create your account" : "Welcome back"}
              </h2>
              <p className="text-xs font-serif italic text-zinc-500 dark:text-zinc-400 mt-1">
                {isSignUp ? "Sign up to start dropshipping & buying products" : "Secure login for customers and partners"}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs rounded-none border border-red-100 dark:border-red-950/40 font-serif italic">
                {error}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-[9px] font-bold text-[#aaa] uppercase tracking-[0.2em] mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                    <input
                      id="signup-name-input"
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#fbfbfa] dark:bg-zinc-800/10 border border-[#ececeb] dark:border-[#2c2c2a] rounded-none focus:outline-none focus:border-zinc-900 text-[#1a1a1a] dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[9px] font-bold text-[#aaa] uppercase tracking-[0.2em] mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                  <input
                    id="auth-email-input"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#fbfbfa] dark:bg-zinc-800/10 border border-[#ececeb] dark:border-[#2c2c2a] rounded-none focus:outline-none focus:border-zinc-900 text-[#1a1a1a] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-[#aaa] uppercase tracking-[0.2em] mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                  <input
                    id="auth-password-input"
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#fbfbfa] dark:bg-zinc-800/10 border border-[#ececeb] dark:border-[#2c2c2a] rounded-none focus:outline-none focus:border-zinc-900 text-[#1a1a1a] dark:text-white"
                  />
                </div>
              </div>

              <button
                id="submit-auth-form"
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-bold uppercase tracking-widest text-[10px] rounded-none shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? "Authenticating..." : isSignUp ? "Sign Up with Verification" : "Sign In"}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#ececeb] dark:border-[#2c2c2a]" /></div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider"><span className="px-2 bg-white dark:bg-[#161616] text-zinc-400">or continue with</span></div>
            </div>

            <button
              id="google-signin-btn"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-4 border border-[#ececeb] dark:border-[#2c2c2a] hover:bg-[#fbfbfa] dark:hover:bg-zinc-800/50 rounded-none transition-all text-[10px] text-zinc-700 dark:text-zinc-300 font-bold uppercase tracking-widest cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.66 0 3.12.57 4.28 1.67l3.22-3.22C17.52 1.58 14.94 1 12 1 7.24 1 3.2 3.73 1.24 7.72l3.86 3C6.03 7.73 8.78 5.04 12 5.04z" />
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.43c-.28 1.44-1.1 2.67-2.33 3.5l3.61 2.8c2.11-1.95 3.78-4.83 3.78-8.45z" />
                <path fill="#FBBC05" d="M5.1 14.28a7.136 7.136 0 0 1 0-4.56l-3.86-3C.43 8.27 0 10.08 0 12s.43 3.73 1.24 5.28l3.86-3z" />
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.61-2.8c-1.01.67-2.3 1.07-4.35 1.07-3.22 0-5.97-2.69-6.94-5.68l-3.86 3C3.2 20.27 7.24 23 12 23z" />
              </svg>
              Sign In with Google
            </button>

            {/* Sandbox Quick Bypass Area */}
            <div className="mt-6 pt-4 border-t border-[#ececeb] dark:border-[#2c2c2a]">
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-400 mb-3 tracking-widest uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
                DEVELOPER ACCESS (SANDBOX)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="sandbox-customer-btn"
                  onClick={() => handleSandboxLogin("user")}
                  className="py-2.5 px-2 bg-[#fbfbfa] hover:bg-zinc-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/80 text-[9px] text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider rounded-none border border-[#ececeb] dark:border-[#2c2c2a] transition-all text-center cursor-pointer"
                >
                  ⚡ Demo Customer
                </button>
                <button
                  id="sandbox-partner-btn"
                  onClick={() => handleSandboxLogin("admin")}
                  className="py-2.5 px-2 bg-[#fbfbfa] hover:bg-zinc-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/80 text-[9px] text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider rounded-none border border-[#ececeb] dark:border-[#2c2c2a] transition-all text-center cursor-pointer"
                >
                  👑 Admin Partner
                </button>
              </div>
            </div>

            <div className="text-center mt-5">
              <button
                id="toggle-auth-mode"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-black dark:hover:text-white transition-all underline underline-offset-4 cursor-pointer"
              >
                {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
