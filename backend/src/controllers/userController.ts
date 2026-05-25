import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ตรวจสอบว่ามีผู้ใช้ในระบบหรือไม่โดยใช้ clerkId
export const checkUserByClerkId = async (req: Request, res: Response) => {
  try {
    const { clerkId } = req.body;

    // ตรวจสอบว่ามี clerkId หรือไม่
    if (!clerkId) {
      return res.status(400).json({
        success: false,
        message: 'ต้องระบุ clerkId'
      });
    }

    // ค้นหาผู้ใช้โดยใช้ clerkId (เก็บในฟิลด์ userName)
    const user = await prisma.user.findUnique({
      where: {
        userName: clerkId
      }
    });

    if (user) {
      // ถ้าพบผู้ใช้ในระบบแล้ว
      return res.status(200).json({
        success: true,
        exists: true,
        role: user.role,
        userData: {
          id: user.id,
          userName: user.userName,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          playType: user.playType,
          profileImg: user.profileImg,
          rank: user.rank
        }
      });
    } else {
      // ถ้ายังไม่มีผู้ใช้ในระบบ
      return res.status(200).json({
        success: true,
        exists: false,
        role: null,
        userData: null
      });
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการตรวจสอบข้อมูลผู้ใช้:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูลผู้ใช้'
    });
  }
};

// สร้างผู้ใช้ใหม่จากข้อมูล Clerk
export const createUserFromClerk = async (req: Request, res: Response) => {
  try {
    const {
      clerkId,
      email,
      firstName,
      lastName,
      imageUrl,
      age,
      playType,

    } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!clerkId || !email || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'ต้องระบุข้อมูลที่จำเป็น (clerkId, email, firstName, lastName)'
      });
    }

    // ตรวจสอบว่ามีผู้ใช้อยู่แล้วหรือไม่
    const existingUser = await prisma.user.findUnique({
      where: {
        userName: clerkId
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'มีผู้ใช้นี้ในระบบแล้ว'
      });
    }

    // สร้างผู้ใช้ใหม่
    const newUser = await prisma.user.create({
      data: {
        userName: clerkId, // เก็บ clerkId ไว้ในฟิลด์ userName
        email: email,
        firstName: firstName,
        lastName: lastName,
        gmail: email, // เก็บ email ไว้ในฟิลด์ gmail ด้วย
        profileImg: imageUrl || null,
        role: 'PLAYER', // ค่าเริ่มต้นเป็น PLAYER
        password: 'clerk-auth', // ใส่ค่า password ชั่วคราวเนื่องจากใช้ Clerk ในการยืนยันตัวตน
        age: age ? parseInt(age) : null,
        playType: playType || null,
        // phoneNumber ไม่มีใน schema แต่สามารถเพิ่มในภายหลังได้
      }
    });

    return res.status(201).json({
      success: true,
      message: 'สร้างผู้ใช้สำเร็จ',
      userData: {
        id: newUser.id,
        userName: newUser.userName,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        playType: newUser.playType,
        profileImg: newUser.profileImg,
        rank: newUser.rank,
        age: newUser.age
      }
    });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการสร้างผู้ใช้:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้างผู้ใช้'
    });
  }
};