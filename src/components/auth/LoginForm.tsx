"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "", general: "" });
  const [showPassword, setShowPassword] = useState(false);
  
  const { setSession, isLoading, setIsLoading } = useUserStore();
  const router = useRouter();

  // Basic email validation
  useEffect(() => {
    const newErrors = { email: "", password: "", general: "" };
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    setErrors(prev => ({ ...prev, ...newErrors }));
  }, [email]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setErrors(prev => ({ ...prev, general: "Please fill in all fields" }));
      return;
    }
    
    if (errors.email) return;

    setIsLoading(true);
    setErrors({ email: "", password: "", general: "" });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password 
      });
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrors(prev => ({ ...prev, general: "Invalid email or password" }));
        } else {
          setErrors(prev => ({ ...prev, general: error.message }));
        }
      } else if (data.session) {
        setSession(data.session);
        router.push("/dashboard");
      }
    } catch {
      setErrors(prev => ({ ...prev, general: "An unexpected error occurred" }));
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = email && password && !errors.email;

  return (
    <div className="relative flex min-h-screen bg-gray-900 text-white">
      {/* Background */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      >
        <div
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72rem]"
        />
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Logo + Title */}
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-20 w-40 items-center justify-center rounded-md overflow-hidden">
                <img 
                  src="/logom.png"
                  alt="Debai Logo"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
            <h2 className="mt-6 text-2xl font-bold tracking-tight">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-300">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="mt-6 space-y-6">
            {/* General Error */}
            <AnimatePresence>
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500 rounded-md p-3"
                >
                  <p className="text-red-500 text-sm">{errors.general}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m@example.com"
                className={`mt-1 block w-full rounded-md border ${
                  errors.email ? "border-red-500" : "border-gray-600"
                } bg-gray-800 px-4 py-2 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200`}
              />
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-1 text-sm text-red-500"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label className="block text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </motion.button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: isFormValid ? 1.02 : 1 }}
              whileTap={{ scale: isFormValid ? 0.98 : 1 }}
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`flex w-full justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 ${
                isFormValid && !isLoading
                  ? "bg-indigo-500 hover:bg-indigo-400"
                  : "bg-gray-600 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-5 w-5 border-2 border-t-transparent border-white rounded-full"
                />
              ) : (
                "Sign In"
              )}
            </motion.button>
          </form>

          {/* Sign up link */}
          <p className="mt-6 text-center text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-indigo-400 hover:text-indigo-300"
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right side - Empty with background */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900" />
    </div>
  );
}
