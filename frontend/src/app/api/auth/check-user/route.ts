import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// API endpoint สำหรับตรวจสอบข้อมูลผู้ใช้จาก Clerk กับระบบฐานข้อมูล
export async function POST(request: NextRequest) {
  try {
    // รับข้อมูลจาก Clerk
    const userData = await request.json();
    const { clerkId, email, firstName, lastName, username, imageUrl } = userData;

    // เชื่อมต่อกับฐานข้อมูลของคุณเพื่อตรวจสอบข้อมูลผู้ใช้
    // เรียก API ไปยัง backend ของคุณ
    try {
      // เรียก API ไปยัง backend ของคุณ
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/users/check`, {
        clerkId,
        email,
        firstName,
        lastName,
        username,
        imageUrl
      });

      // ส่งข้อมูลกลับไปยัง frontend
      return NextResponse.json({
        success: true,
        exists: response.data.exists,
        role: response.data.role,
        userData: response.data.userData
      });

    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการเรียก API:', error);
      
      // ถ้าเกิดข้อผิดพลาดในการเชื่อมต่อกับ backend
      // สามารถส่งค่าเริ่มต้นกลับไปได้
      return NextResponse.json({
        success: false,
        exists: false,
        role: null,
        userData: null,
        error: 'ไม่สามารถเชื่อมต่อกับระบบฐานข้อมูลได้'
      });
    }

  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการประมวลผลข้อมูล:', error);
    return NextResponse.json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการประมวลผลข้อมูล'
    }, { status: 500 });
  }
}