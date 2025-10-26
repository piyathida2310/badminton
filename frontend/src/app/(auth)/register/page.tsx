'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  avatar?: string | null;
}

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'PLAYER',
    avatar: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm((prev) => ({ ...prev, avatar: ev.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (form.password !== form.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      setLoading(false);
      return;
    }

    try {
      const data = { ...form, fullName: `${form.firstName} ${form.lastName}`.trim() };
      await api.post('/auth/register', data);
      router.push('/login?registered=1');
    } catch (err: any) {
      setError('เกิดข้อผิดพลาดในการลงทะเบียน');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4
      bg-gradient-to-b from-[#FFF8E1] via-[#FFF3E0] to-[#E3F2FD]"
    >
      <div className="text-center mb-6">
        <h2 className="text-[28px] font-extrabold text-[#F06292] drop-shadow-sm">
          ลงทะเบียนผู้ใช้
        </h2>
      </div>

      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-[#FFE0B2] p-8">
        <div className="flex flex-col items-center mb-6">
          <label className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-[#FFB6C1] cursor-pointer hover:opacity-90 transition">
            {form.avatar ? (
              <Image src={form.avatar} alt="Avatar" fill className="object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm">
                เพิ่มรูป
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        </div>

        <div className="flex justify-center items-center space-x-6 mb-6">
          <label className="flex items-center space-x-2 text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="role"
              value="PLAYER"
              checked={form.role === 'PLAYER'}
              onChange={handleChange}
              className="accent-[#F48FB1]"
            />
            <span>ผู้เล่น</span>
          </label>
          <label className="flex items-center space-x-2 text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="role"
              value="ORGANIZER"
              checked={form.role === 'ORGANIZER'}
              onChange={handleChange}
              className="accent-[#F48FB1]"
            />
            <span>ผู้จัดแข่งขัน</span>
          </label>
        </div>

        {error && <p className="text-center text-red-500 mb-4 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm mb-1">ชื่อ</label>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="ชื่อจริง"
              required
              className="w-full px-4 py-2 rounded-lg border border-[#FFD6E0] bg-[#FFF9F9] text-gray-700 focus:ring-2 focus:ring-[#F8BBD0] outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm mb-1">นามสกุล</label>
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="นามสกุล"
              required
              className="w-full px-4 py-2 rounded-lg border border-[#FFD6E0] bg-[#FFF9F9] text-gray-700 focus:ring-2 focus:ring-[#F8BBD0] outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm mb-1">อีเมล</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
              required
              className="w-full px-4 py-2 rounded-lg border border-[#FFD6E0] bg-[#FFF9F9] text-gray-700 focus:ring-2 focus:ring-[#F8BBD0] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm mb-1">รหัสผ่าน</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="********"
                required
                className="w-full px-4 py-2 rounded-lg border border-[#FFD6E0] bg-[#FFF9F9] text-gray-700 focus:ring-2 focus:ring-[#F8BBD0] outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1">ยืนยันรหัสผ่าน</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="********"
                required
                className="w-full px-4 py-2 rounded-lg border border-[#FFD6E0] bg-[#FFF9F9] text-gray-700 focus:ring-2 focus:ring-[#F8BBD0] outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 rounded-full bg-[#FFC107] text-white font-bold shadow-md hover:bg-[#FFB300] transition-transform disabled:opacity-50"
          >
            {loading ? 'กำลังลงทะเบียน...' : 'สร้างบัญชี'}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          มีบัญชีอยู่แล้ว?{' '}
          <Link href="/login" className="text-[#E91E63] hover:underline font-medium">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
}
