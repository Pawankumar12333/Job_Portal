import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "../config/supabase";

// ✅ Local Icons
import googleIcon from "../photo/google.svg";
import facebookIcon from "../photo/facebook.svg";
import loginPic from "../photo/loginpic.jpg";
import user1 from "../photo/user1.jpg";
import user2 from "../photo/user2.jpg";
import user3 from "../photo/user3.jpg";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:5173/home'
      }
    });
    
    if (error) {
      console.error("Google login error:", error);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-[#0F5C5E] to-[#0C4F50]">
      {/* LEFT SECTION - Hero Image */}
      <div className="hidden lg:flex lg:flex-1 relative">
        <img src={loginPic} alt="login" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="absolute bottom-50 left-105 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-white shadow-md">
          <p className="text-sm font-semibold">100k+ Active Users</p>
          <p className="text-xs text-gray-200">Trusted worldwide</p>
        </div>

        <div className="absolute bottom-30 left-5 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-white shadow-md flex items-center gap-3">
          <div className="flex -space-x-2">
            <img src={user1} className="w-8 h-8 rounded-full border-2 border-white" alt="user" />
            <img src={user2} className="w-8 h-8 rounded-full border-2 border-white" alt="user" />
            <img src={user3} className="w-8 h-8 rounded-full border-2 border-white" alt="user" />
          </div>
          <div>
            <p className="text-sm font-semibold">100k+ Job holder</p>
            <p className="text-xs text-gray-200">Trusted worldwide</p>
          </div>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
          <h1 className="text-4xl font-bold mb-4">Find your Dream job & Matrimony</h1>
          <p className="opacity-80">Login to continue your journey</p>
        </div>
      </div>

      {/* RIGHT SECTION - Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <AuthCard key="login" type="login" switchMode={() => setIsLogin(false)} onGoogleLogin={handleGoogleLogin} />
            ) : (
              <AuthCard key="signup" type="signup" switchMode={() => setIsLogin(true)} onGoogleLogin={handleGoogleLogin} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const AuthCard = ({ type, switchMode, onGoogleLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (type === "signup") {
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords don't match!");
        return;
      }
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username
          }
        }
      });
      
      if (error) {
        alert(error.message);
      } else {
        alert("Signup successful! Please check your email to verify.");
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });
      
      if (error) {
        alert(error.message);
      } else {
        window.location.href = "/home";
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -40, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="w-full p-8 rounded-3xl bg-[#2C3E50]/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.4)] text-white"
    >
      <h2 className="text-3xl font-semibold mb-6 text-center">
        {type === "login" ? "Log in" : "Sign up"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {type === "signup" && (
          <Input
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
          />
        )}

        <Input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <div className="relative">
          <Input
            name="password"
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 text-sm hover:text-purple-100 transition"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {type === "signup" && (
          <Input
            name="confirmPassword"
            placeholder="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        )}

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-purple-400 text-purple-900 font-semibold hover:bg-purple-300 transition shadow-lg shadow-purple-500/40"
        >
          {type === "login" ? "Log in" : "Sign up"}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-purple-600/30"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-[#2C3E50]/80 text-purple-200">Or continue with</span>
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-4">
        <IconButton 
          icon={googleIcon} 
          onClick={onGoogleLogin}
          provider="google"
        />
        <IconButton 
          icon={facebookIcon} 
          onClick={() => alert("Facebook login coming soon!")}
          provider="facebook"
        />
      </div>

      <p className="text-center text-sm mt-6 text-purple-200">
        {type === "login"
          ? "Don't have an account?"
          : "Already have an account?"}
      </p>

      <button
        onClick={switchMode}
        className="w-full mt-3 py-2.5 rounded-xl bg-purple-400/20 border border-purple-400/40 text-purple-200 font-semibold hover:bg-purple-400/30 transition"
      >
        {type === "login" ? "Create an account" : "Log in to existing account"}
      </button>
    </motion.div>
  );
};

const Input = ({ placeholder, type = "text", name, value, onChange, required = false }) => (
  <input
    type={type}
    name={name}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    required={required}
    className="w-full px-4 py-2.5 rounded-xl bg-purple-800/40 border border-purple-600/30 placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 text-white transition"
  />
);

const IconButton = ({ icon, onClick, provider }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-16 h-14 flex items-center justify-center border-2 border-white/40 rounded-xl bg-transparent hover:bg-white/10 hover:border-purple-400 transition-all duration-300 group"
  >
    <img 
      src={icon} 
      alt={provider} 
      className="w-6 h-6 transition-transform group-hover:scale-110" 
    />
  </button>
);

export default AuthPage;