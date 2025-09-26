"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub, FaEye, FaEyeSlash, FaCheck } from "react-icons/fa";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";

export default function SignUpForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ firstName: "", lastName: "", email: "", password: "", general: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordCriteria, setShowPasswordCriteria] = useState(false);
  
  const { setSession, isLoading, setIsLoading } = useUserStore();
  const router = useRouter();

  // Password criteria state
  const [passwordCriteria, setPasswordCriteria] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  // Validate inputs in real-time
  useEffect(() => {
    const validateForm = () => {
      const newErrors = { firstName: "", lastName: "", email: "", password: "", general: "" };

      // First name validation
      if (firstName && firstName.length < 2) {
        newErrors.firstName = "First name must be at least 2 characters long";
      }

      // Last name validation
      if (lastName && lastName.length < 2) {
        newErrors.lastName = "Last name must be at least 2 characters long";
      }

      // Email validation
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = "Please enter a valid email address";
      }

      // Password criteria validation
      const minLength = password.length >= 8;
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumber = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

      setPasswordCriteria({
        minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumber,
        hasSpecialChar,
      });

      // Show password criteria when user starts typing
      setShowPasswordCriteria(password.length > 0);

      // Check if all password criteria are met
      if (password && (!minLength || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar)) {
        newErrors.password = "Password does not meet all requirements";
      }

      setErrors(newErrors);
    };

    validateForm();
  }, [firstName, lastName, email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (errors.firstName || errors.lastName || errors.email || errors.password || !firstName || !lastName || !email || !password) {
      setErrors(prev => ({ ...prev, general: "Please fix all errors before submitting" }));
      return;
    }

    if (!allCriteriaMet) {
      setErrors(prev => ({ ...prev, general: "Password does not meet all requirements" }));
      return;
    }

    setIsLoading(true);
    setErrors({ firstName: "", lastName: "", email: "", password: "", general: "" });
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            full_name: `${firstName.trim()} ${lastName.trim()}`
          }
        }
      });
      
      if (error) {
        if (error.message.includes('already registered')) {
          setErrors(prev => ({ ...prev, email: "This email is already registered" }));
        } else {
          setErrors(prev => ({ ...prev, general: error.message }));
        }
      } else if (data.session) {
        setSession(data.session);
        router.push("/dashboard");
      } else if (data.user && !data.session) {
        // Email confirmation required
        setErrors(prev => ({ ...prev, general: "Please check your email to confirm your account" }));
      }
    } catch {
      setErrors(prev => ({ ...prev, general: "An unexpected error occurred" }));
    } finally {
      setIsLoading(false);
    }
  };

  // Check if all password criteria are met
  const allCriteriaMet =
    passwordCriteria.minLength &&
    passwordCriteria.hasUpperCase &&
    passwordCriteria.hasLowerCase &&
    passwordCriteria.hasNumber &&
    passwordCriteria.hasSpecialChar;

  const isFormValid = firstName && lastName && email && password && !errors.firstName && !errors.lastName && !errors.email && !errors.password && allCriteriaMet;

  return (
    <div className="relative flex min-h-screen bg-gray-900 text-white">
      {/* Hero background */}
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

      {/* Left side - Form */}
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
              <div className="flex h-20 w-40 items-center justify-center rounded-md  overflow-hidden">
                <img  
                  src="/logom.png"   // مسار اللوجو داخل public/
                  alt="Debai Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              {/* <span className="font-semibold">Debai</span> */}
            </div>

            <h2 className="mt-6 text-2xl font-bold tracking-tight">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-300">
              Enter your details below to create a new account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
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
              <label className="block text-sm font-medium">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className={`mt-1 block w-full rounded-md border ${
                  errors.firstName ? "border-red-500" : "border-gray-600"
                } bg-gray-800 px-4 py-2 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200`}
              />
              <AnimatePresence>
                {errors.firstName && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-1 text-sm text-red-500"
                  >
                    {errors.firstName}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label className="block text-sm font-medium">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className={`mt-1 block w-full rounded-md border ${
                  errors.lastName ? "border-red-500" : "border-gray-600"
                } bg-gray-800 px-4 py-2 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200`}
              />
              <AnimatePresence>
                {errors.lastName && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-1 text-sm text-red-500"
                  >
                    {errors.lastName}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

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
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.password ? "border-red-500" : "border-gray-600"
                  } bg-gray-800 px-4 py-2 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200`}
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
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-1 text-sm text-red-500"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Password Criteria */}
              <AnimatePresence>
                {showPasswordCriteria && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 space-y-1 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <FaCheck className={`h-4 w-4 ${passwordCriteria.minLength ? "text-green-500" : "text-gray-500"}`} />
                      <span className={passwordCriteria.minLength ? "text-green-500" : "text-gray-500"}>
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCheck className={`h-4 w-4 ${passwordCriteria.hasUpperCase ? "text-green-500" : "text-gray-500"}`} />
                      <span className={passwordCriteria.hasUpperCase ? "text-green-500" : "text-gray-500"}>
                        Contains uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCheck className={`h-4 w-4 ${passwordCriteria.hasLowerCase ? "text-green-500" : "text-gray-500"}`} />
                      <span className={passwordCriteria.hasLowerCase ? "text-green-500" : "text-gray-500"}>
                        Contains lowercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCheck className={`h-4 w-4 ${passwordCriteria.hasNumber ? "text-green-500" : "text-gray-500"}`} />
                      <span className={passwordCriteria.hasNumber ? "text-green-500" : "text-gray-500"}>
                        Contains number
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCheck className={`h-4 w-4 ${passwordCriteria.hasSpecialChar ? "text-green-500" : "text-gray-500"}`} />
                      <span className={passwordCriteria.hasSpecialChar ? "text-green-500" : "text-gray-500"}>
                        Contains special character
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
                "Sign Up"
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <div className="flex-1 border-t border-gray-700" />
            <span className="text-xs text-gray-400">Or continue with</span>
            <div className="flex-1 border-t border-gray-700" />
          </div>

          {/* GitHub Sign Up */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-200 shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaGithub className="h-5 w-5" />
            Sign Up with GitHub
          </motion.button>

          {/* Login link */}
          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-indigo-400 hover:text-indigo-300"
            >
              Login
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right side - Empty with background */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900" />
    </div>
  );
}