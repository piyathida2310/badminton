'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import api from '@/lib/api';

interface LoginForm {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  expiresIn: number;
}



// Magical particle component
const MagicalParticle = ({ delay = 0 }: { delay?: number }) => {
  const seed = delay * 1.732050807569; // Square root of 3
  return (
    <motion.div
      className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full pointer-events-none"
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
        x: ((seed * 800) % 800) - 400,
        y: ((seed * 600) % 600) - 300,
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        delay,
        ease: "easeOut",
      }}
    />
  );
};

const LoginPage = () => {
  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post<LoginResponse>('/auth/login', form);
      
      // Store token in localStorage
      localStorage.setItem('accessToken', response.data.accessToken);
      
      // Redirect to dashboard or home page
      router.push('/dashboard');
    } catch (err: any) {
      if (err.response) {
        setError(err.response?.data?.message || 'Login failed');
      } else {
        setError('An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Animated background with stars */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
        {/* Twinkling stars */}
        {Array.from({ length: 50 }, (_, i) => {
          const seed = i * 0.618033988749; // Golden ratio for better distribution
          return (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${((seed * 100) % 100)}%`,
                top: `${((seed * 73.5) % 100)}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: ((seed * 3) % 3) + 2,
                repeat: Infinity,
                delay: (seed * 2) % 2,
              }}
            />
          );
        })}
      </div>

  

      {/* Magical particles */}
      {Array.from({ length: 20 }, (_, i) => {
        const seed = i * 2.718281828459; // Euler's number
        return (
          <MagicalParticle key={i} delay={(seed * 3) % 3} />
        );
      })}

      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Logo with glow effect */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="flex items-center justify-center mb-4">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full blur-lg opacity-75 animate-pulse"></div>
                
              </motion.div>
              <div>
                <motion.h1 
                  className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  BADMINTON
                </motion.h1>
                <p className="text-sm text-cyan-300 font-medium">COMPETITION MANAGEMENT</p>
              </div>
            </div>
          </motion.div>

          {/* Login Form with magical effects */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            {/* Magical border glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
            
            <div className="relative bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-indigo-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
              <motion.h2 
                className="text-3xl font-bold text-center bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                เข้าสู่ระบบ
              </motion.h2>

              {error && (
                <motion.div 
                  className="rounded-md bg-red-500/20 border border-red-400/50 p-4 mb-4 backdrop-blur-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="text-sm text-red-200">{error}</div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form Fields with magical styling */}
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  <div className="group">
                    <label className="block text-sm font-medium text-cyan-200 mb-2">
                      อีเมล
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="อีเมล"
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm transition-all duration-300 group-hover:bg-white/15"
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-medium text-cyan-200 mb-2">
                      รหัสผ่าน
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="รหัสผ่าน"
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm transition-all duration-300 group-hover:bg-white/15"
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>
                </motion.div>

                {/* Submit Button with magical effects */}
                <motion.div 
                  className="flex justify-center mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                >
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="relative px-8 py-3 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white font-bold rounded-full shadow-2xl disabled:opacity-50 overflow-hidden group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                      boxShadow: [
                        "0 0 20px rgba(6, 182, 212, 0.5)",
                        "0 0 40px rgba(168, 85, 247, 0.5)",
                        "0 0 20px rgba(236, 72, 153, 0.5)",
                        "0 0 20px rgba(6, 182, 212, 0.5)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    <span className="relative z-10">
                      {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                    </span>
                  </motion.button>
                </motion.div>
              </form>

              {/* Register Link */}
              <motion.div 
                className="text-center mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.6 }}
              >
                <p className="text-sm text-white/70">
                  ยังไม่มีบัญชี?{' '}
                  <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-200 hover:underline">
                    สมัครสมาชิกใหม่
                  </Link>
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;