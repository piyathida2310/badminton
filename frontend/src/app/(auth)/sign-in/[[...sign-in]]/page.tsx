'use client'

import { SignIn, useUser } from '@clerk/nextjs'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

export default function Page() {
  const { isSignedIn, user } = useUser()
  const router = useRouter()

  // ฟังก์ชันสำหรับตรวจสอบข้อมูลผู้ใช้และเรียก API
  const checkUserAndRedirect = async (clerkUser: any) => {
    try {
      // 1. แสดงข้อมูลผู้ใช้จาก Clerk
      console.log('=== ข้อมูลผู้ใช้จาก Clerk ===');
      console.log('ID:', clerkUser.id);
      console.log('Email:', clerkUser.primaryEmailAddress?.emailAddress);
      console.log('ชื่อ:', clerkUser.firstName);
      console.log('นามสกุล:', clerkUser.lastName);
      console.log('ชื่อเต็ม:', clerkUser.fullName);
      console.log('ชื่อผู้ใช้:', clerkUser.username);
      console.log('รูปโปรไฟล์:', clerkUser.imageUrl);
      console.log('วันที่สร้าง:', clerkUser.createdAt);
      console.log('วันที่อัปเดตล่าสุด:', clerkUser.updatedAt);
      
      if (clerkUser.publicMetadata) {
        console.log('ข้อมูลสาธารณะ (Public Metadata):', clerkUser.publicMetadata);
      }
      
      if (clerkUser.privateMetadata) {
        console.log('ข้อมูลส่วนตัว (Private Metadata):', clerkUser.privateMetadata);
      }
      
      if (clerkUser.unsafeMetadata) {
        console.log('ข้อมูลไม่ปลอดภัย (Unsafe Metadata):', clerkUser.unsafeMetadata);
      }
      
      console.log('ข้อมูลทั้งหมด:', clerkUser);
      console.log('==========================');

      // 2. เตรียมข้อมูลสำหรับเรียก API
      const userData = {
        clerkId: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        username: clerkUser.username,
        imageUrl: clerkUser.imageUrl,
        // เพิ่มข้อมูลอื่นๆ ที่ต้องการส่งไปยัง backend
      };

      // 3. เรียก API โดยตรงไปยัง backend เพื่อตรวจสอบว่าผู้ใช้มีข้อมูลในระบบหรือไม่
      // ใช้ axios แทน fetch
      const checkResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/users/check`, userData);

      console.log('ผลลัพธ์จาก API:', checkResponse.data);

      // 4. ตรวจสอบว่าผู้ใช้มีอยู่ในระบบหรือไม่
      if (checkResponse.data.exists) {
        // 5. เรียก API login เพื่อรับ token
        const loginResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
          email: clerkUser.primaryEmailAddress?.emailAddress,
          password: 'clerk-auth' // ใช้รหัสผ่านสำหรับผู้ใช้จาก Clerk
        });

        console.log('Token จาก login API:', loginResponse.data);
        console.log("role:", checkResponse.data.role)
        // 6. เก็บ token ไว้ใน localStorage ก่อน แล้วค่อย redirect
        if (loginResponse.data.accessToken) {
          // เก็บ token และ role ลง localStorage ก่อน
          localStorage.setItem('accessToken', loginResponse.data.accessToken);
          localStorage.setItem('userRole', checkResponse.data.role);
          
          // แล้วค่อย redirect ตาม role โดยใช้ replace เพื่อให้สามารถกด back ได้
          if(checkResponse.data.role == 'PLAYER'){
            router.replace('/user/tournament')  // ใช้ replace แทน push เพื่อให้กด back กลับไปหน้าก่อนหน้าได้
          } else if(checkResponse.data.role == 'ORGANIZER'){
            router.replace('/manage')
          }
        }
      } else {
        // ถ้ายังไม่มีข้อมูลในระบบ ให้ไปหน้า sign-up
        router.push('/sign-up');
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการตรวจสอบข้อมูลผู้ใช้:', error);
    }
  };

  useEffect(() => {
    if (isSignedIn && user) {
      // เรียกฟังก์ชันเพื่อตรวจสอบข้อมูลและ redirect
      checkUserAndRedirect(user);
    }
  }, [isSignedIn, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-yellow-100 to-pink-200 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-pink-200/50 overflow-hidden">
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mb-4">
                <div className="inline-block p-4 bg-gradient-to-br from-pink-400 to-yellow-400 rounded-full shadow-lg">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-yellow-500 to-pink-600 bg-clip-text text-transparent mb-2">
                แบดมินตัน ออนไลน์
              </h1>
              <p className="text-gray-600 text-lg">เข้าสู่ระบบเพื่อเริ่มเล่น</p>
            </div>

            {/* Clerk Sign In Component */}
            <div>
              <SignIn
                appearance={{
                  elements: {
                    rootBox: "mx-auto",
                    card: {
                      backgroundColor: "rgb(254 240 138)", // สีเหลืองอ่อน (yellow-200)
                      borderRadius: "1rem",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      padding: "2rem"
                    },
                    headerTitle: {
                      display: "none"
                    },
                    headerSubtitle: {
                      display: "none"
                    },
                    socialButtonsBlockButton: {
                      backgroundColor: "white",
                      border: "2px solid rgb(251 207 232)", // pink-200
                      color: "rgb(75 85 99)", // gray-600
                      transition: "all 0.2s",
                      "&:hover": {
                        backgroundColor: "rgb(254 240 138)" // yellow-200
                      }
                    },
                    formButtonPrimary: {
                      background: "linear-gradient(to right, rgb(236 72 153), rgb(250 204 21), rgb(236 72 153))", // pink-500 -> yellow-400 -> pink-500
                      color: "white",
                      fontWeight: "600",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      transition: "all 0.2s",
                      "&:hover": {
                        transform: "scale(1.02)"
                      }
                    },
                    formFieldInput: {
                      background: "linear-gradient(to right, rgb(252 231 243), rgb(254 249 195))", // pink-100 -> yellow-100
                      border: "2px solid rgb(251 207 232)", // pink-200
                      borderRadius: "0.75rem",
                      "&:focus": {
                        borderColor: "rgb(236 72 153)", // pink-500
                        outline: "none",
                        boxShadow: "0 0 0 3px rgba(236, 72, 153, 0.1)"
                      }
                    },
                    formFieldLabel: {
                      color: "rgb(55 65 81)", // gray-700
                      fontWeight: "500"
                    },
                    footerActionLink: {
                      color: "rgb(236 72 153)", // pink-500
                      fontWeight: "600",
                      "&:hover": {
                        color: "rgb(250 204 21)" // yellow-400
                      }
                    },
                    dividerLine: {
                      backgroundColor: "rgb(251 207 232)" // pink-200
                    },
                    dividerText: {
                      color: "rgb(107 114 128)", // gray-500
                      backgroundColor: "rgb(254 240 138)", // yellow-200
                      padding: "0 1rem",
                      fontWeight: "500"
                    },
                    alert: {
                      backgroundColor: "rgb(252 231 243)", // pink-100
                      border: "2px solid rgb(251 207 232)", // pink-200
                      color: "rgb(190 24 93)", // pink-700
                      borderRadius: "0.75rem"
                    },
                    formFieldInputShowPasswordButton: {
                      color: "rgb(236 72 153)" // pink-500
                    },
                    footer: {
                      display: "none" // ซ่อน "Secured by Clerk"
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}