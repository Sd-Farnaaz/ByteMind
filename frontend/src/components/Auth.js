import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { login, register } from '../services/authService';
import ByteMindMascot from './ByteMindMascot';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (isLogin) {
        response = await login(formData.email.trim(), formData.password);
      } else {
        response = await register(formData.name.trim(), formData.email.trim(), formData.password);
      }

      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        toast.success(isLogin ? `Welcome back, ${response.user.name}!` : 'Account created successfully!');
        onLogin(response.user);
      } else {
        toast.error(response.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center dreamscape-bg p-4 relative overflow-hidden">
      {/* Dreamy Ambient Depth Glows */}
      <div className="absolute top-10 left-10 w-80 h-80 rounded-full bg-violet-300/30 filter blur-[80px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-sky-300/30 filter blur-[90px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="glass-card rounded-3xl p-8 sm:p-10 w-full max-w-md relative z-10 shadow-2xl border border-white/80"
      >
        {/* Mascot & Brand Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <ByteMindMascot size="md" interactive={true} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            {isLogin ? 'Welcome back to ByteMind' : 'Join ByteMind AI'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isLogin
              ? 'Your intelligent AI companion for coding & discovery'
              : 'Create an account to start smart conversations'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-2xl bg-slate-100/80 mb-6 border border-slate-200/60">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
              isLogin
                ? 'bg-white text-violet-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
              !isLogin
                ? 'bg-white text-violet-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative flex items-center">
                <FiUser className="absolute left-3.5 text-slate-400" size={16} />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/70 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all"
                  placeholder="Alex Mercer"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative flex items-center">
              <FiMail className="absolute left-3.5 text-slate-400" size={16} />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/70 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all"
                placeholder="alex@bytemind.ai"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <FiLock className="absolute left-3.5 text-slate-400" size={16} />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/70 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-500/25 transition-all duration-200 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? (
              <span>Connecting to ByteMind...</span>
            ) : (
              <>
                <span>{isLogin ? 'Sign In' : 'Create My Account'}</span>
                <FiArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <span>Protected with JWT authentication and encrypted sessions.</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
