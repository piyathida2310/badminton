# 🏸 Badminton Management System - Frontend Client

ส่วนหน้าจอผู้ใช้งาน (Frontend) ของระบบจัดการการแข่งขันแบดมินตัน พัฒนาด้วย **Next.js 15 (App Router)** และ **Tailwind CSS v4** ร่วมกับระบบยืนยันตัวตน **Clerk Auth**

สำหรับคู่มือและรายละเอียดภาพรวมของโปรเจกต์ทั้งหมด (รวม Backend, Database, MinIO) กรุณาดูที่ **[Root README](../README.md)**

---

## 🚀 เทคโนโลยีและไลบรารีที่เลือกใช้ (Tech Stack & Libraries)

*   **Framework:** [Next.js 15](https://nextjs.org/) (App Router, React 19)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **Authentication:** [@clerk/nextjs](https://clerk.com/)
*   **State / Flow Visualization:**
    *   [@xyflow/react / reactflow](https://reactflow.dev/) (แสดงผลและขยับสายการแข่ง)
    *   `react-tournament-bracket` (สำหรับวาดสายการแข่งขัน)
*   **HTTP Client:** [Axios](https://axios-http.com/)
*   **UI Components & Icons:**
    *   [Lucide React](https://lucide.dev/) (ไอคอนประกอบ)
    *   [SweetAlert2](https://sweetalert2.github.io/) (แสดง Popups แจ้งเตือนสไตล์พรีเมียม)
    *   `react-datepicker` (ปฏิทินเลือกวัน)
*   **Internationalization (i18n):** `i18next`, `react-i18next` สำหรับรองรับการใช้งานหลายภาษา
*   **Animations:** [Framer Motion](https://www.framer.com/motion/)

---

## ⚙️ การตั้งค่าระบบจำลอง (Environment Setup)

สร้างไฟล์ `.env` ในโฟลเดอร์ `frontend/` และเพิ่มตัวแปรสภาพแวดล้อมดังนี้:

```env
# Clerk Keys (ลงทะเบียนผ่าน clerk.com เพื่อสร้าง Dashboard ทดสอบ)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk Redirect Routes
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/sign-in

# API Base URL (หากผ่าน Gateway จะวิ่งเข้าหา /api เสมอ)
NEXT_PUBLIC_API_URL=/api
```

---

## 🛠️ คำสั่งการใช้งานสำหรับนักพัฒนา (Development Scripts)

ตรวจสอบให้แน่ใจว่าติดตั้ง Node.js (เวอร์ชัน 18 ขึ้นไป แนะนำเวอร์ชัน 20+) จากนั้นรันคำสั่งต่อไปนี้ในโฟลเดอร์ `frontend/`:

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รันหน้าเว็บโหมดพัฒนา (Development Server)
```bash
npm run dev
```
ระบบจะเปิดใช้งานที่หน้าเว็บ: [http://localhost:3000](http://localhost:3000) (หากไม่ผ่าน Gateway) หรือผ่าน Gateway พอร์ต 80 ที่ [http://localhost](http://localhost)

### 3. ตรวจสอบการคอมไพล์และ Build Production
```bash
npm run build
```

### 4. รันระบบที่ Build เสร็จแล้ว (Production Mode)
```bash
npm run start
```

---

## 📁 โครงสร้างโฟลเดอร์หลัก (Main Folder Structure)

*   `src/app/` : เก็บหน้าเว็บหลัก (App Router)
    *   `(auth)/` : หน้าการลงชื่อเข้าใช้งานและการสมัครสมาชิก (Sign-in / Sign-up)
    *   `(main)/user/` : หน้าจัดการโปรไฟล์และการสมัครทัวร์นาเมนต์สำหรับผู้เล่น (Player)
    *   `(main)/manage/` : แผงควบคุมระบบ (Dashboard) สำหรับผู้จัดงาน (Organizer)
    *   `api/` : API Routes ภายใน Next.js (ถ้ามี)
*   `src/components/` : คอมโพเนนต์ที่นำกลับมาใช้ซ้ำได้ เช่น ตาราง, ฟอร์ม, หรือปุ่ม
*   `src/contexts/` : Context providers สำหรับใช้เก็บ State ส่วนกลาง
*   `src/lib/` : คอนฟิกหลัก เช่น Axios setup และ utils ต่างๆ
*   `nginx/` : คอนฟิกูเรชันของ Nginx สำหรับทำ Reverse Proxy ใน Docker-compose
