'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

export default function SignUp() {
  const { isSignedIn, user } = useUser()
  const router = useRouter()
  const [formData, setFormData] = useState({
    role: 'PLAYER' as 'PLAYER' | 'ORGANIZER'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/sign-in')
    }
  }, [isSignedIn, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // เรียก API สมัครสมาชิกจาก backend
      const response = await axios.post('/api/auth/register', {
        fullName: `${user?.firstName} ${user?.lastName}`,
        email: user?.primaryEmailAddress?.emailAddress,
        password: 'clerk-auth', // ใช้รหัสผ่านสำหรับผู้ใช้จาก Clerk
        confirmPassword: 'clerk-auth',
        username: user?.username || user?.id,
        role: formData.role,
        clerkId: user?.id
      })
      console.log("response.data registerregisterregisterregisterregister:", response.data)
      if (response.data.accessToken) {
          router.push("/sign-in")
      } else {
        setError(response.data.message || 'เกิดข้อผิดพลาดในการสร้างบัญชี')
      }
    } catch (error: any) {
      console.error('เกิดข้อผิดพลาด:', error)
      if (error.response && error.response.data) {
        setError(error.response.data.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์')
      } else {
        setError('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
        >
          <div className="p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center mb-1"
            >
              <h1 className="text-3xl font-bold text-[#194185] mb-1">
                สมัครสมาชิก
              </h1>
              <p className="text-gray-600">กรุณาเลือกบทบาท</p>
            </motion.div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              onSubmit={handleSubmit}
            >
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  บทบาท
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#194185] focus:ring-[#194185]/20"
                  required
                >
                  <option value="PLAYER">ผู้เล่น (Player)</option>
                  <option value="ORGANIZER">ผู้จัดการแข่งขัน (Organizer)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#194185] hover:bg-[#2ED3B7] text-white font-medium shadow-lg transition-all duration-200 transform hover:scale-[1.02] py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
              </button>
            </motion.form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}