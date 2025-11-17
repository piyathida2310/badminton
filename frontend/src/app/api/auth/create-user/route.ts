import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// API endpoint สำหรับสร้างผู้ใช้ใหม่จากข้อมูล Clerk
export async function POST(request: NextRequest) {
  try {
    // รับข้อมูลจาก Clerk
    const userData = await request.json();
    const { clerkId, email, firstName, lastName, username, imageUrl } = userData;

    // เรียก API ไปยัง backend ของคุณ
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/users/create`, {
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
        message: 'สร้างผู้ใช้สำเร็จ',
        userData: response.data.userData
      });

    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการเรียก API:', error);
      
      // ถ้าเกิดข้อผิดพลาดในการเชื่อมต่อกับ backend
      return NextResponse.json({
        success: false,
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