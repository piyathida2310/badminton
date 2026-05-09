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
      const checkResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/check`, userData);

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
  <div className="
    min-h-screen flex flex-col items-center justify-center
    bg-slate-50
    font-[Poppins] px-4 py-10
  ">

    {/* ---------------- HEADER ---------------- */}
    <div className="text-center mb-8 sm:mb-10">
     <h1
  className="
    text-[45px] font-extrabold font-prompt tracking-wide
    text-[#194185]
    drop-shadow-sm
  "
>
  เข้าสู่ระบบ
</h1>


    </div>

   
          {/* ----- Clerk Sign-In (centered) ------ */}
          <div className="w-full flex justify-center">
            <SignIn
              appearance={{
                elements: {
                  rootBox: "w-full",

                  // Hide Clerk default title
                  headerTitle: { display: "none" },
                  headerSubtitle: { display: "none" },

                  // Social login buttons
                  socialButtonsBlockButton: {
                    backgroundColor: "white",
                    border: "1.5px solid #E2E8F0",
                    color: "#52525B",
                    borderRadius: "0.75rem",
                    padding: "0.6rem",
                    fontSize: "0.95rem",
                    transition: "0.2s",
                    "&:hover": { backgroundColor: "#F8FAFC", borderColor: "#194185" },
                  },

                  // Continue button
                  formButtonPrimary: {
                    backgroundColor: "#194185",
                    color: "white",
                    fontWeight: "700",
                    borderRadius: "0.9rem",
                    padding: "0.7rem 1.1rem",
                    fontSize: "1rem",
                    letterSpacing: "0.3px",
                    boxShadow: "0 4px 12px rgba(25, 65, 133, 0.2)",
                    "&:hover": { backgroundColor: "#2ED3B7", transform: "scale(1.03)" },
                  },

                  // Input field
                  formFieldInput: {
                    backgroundColor: "white",
                    border: "2px solid #E2E8F0",
                    borderRadius: "0.8rem",
                    padding: "0.7rem",
                    "&:focus": {
                      borderColor: "#194185",
                      boxShadow: "0 0 0 3px rgba(25, 65, 133, 0.1)",
                    },
                  },

                  // Input label
                  formFieldLabel: {
                    color: "#444",
                    fontWeight: "600",
                    fontSize: "0.9rem",
                  },

                  // Divider
                  dividerLine: { backgroundColor: "#E2E8F0" },
                  dividerText: {
                    backgroundColor: "white",
                    color: "#555",
                    padding: "0 1rem",
                    borderRadius: "0.5rem",
                  },

                  // Error alert
                  alert: {
                    backgroundColor: "#FEF2F2",
                    border: "1.5px solid #FCA5A5",
                    color: "#B91C1C",
                    borderRadius: "0.8rem",
                  },

                  // Show password button
                  formFieldInputShowPasswordButton: {
                    color: "#194185",
                  },

                  // Footer
                  footer: { display: "none" },
                },
              }}
            />
          </div>
        </div>
 

);





}