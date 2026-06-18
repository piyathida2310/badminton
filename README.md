# 🏸 Badminton Tournament Management System (ระบบจัดการแข่งขันแบดมินตัน)

ระบบเว็บแอปพลิเคชันสำหรับจัดการทัวร์นาเมนต์และการแข่งขันแบดมินตันแบบครบวงจร รองรับทั้งผู้จัดงาน (Organizer) ในการสร้างทัวร์นาเมนต์ จัดตาราง ประเมินฝีมือ อนุมัติผู้สมัคร และบันทึกคะแนนการแข่งขัน และผู้เข้าแข่งขัน (Player) ในการสมัครเข้าร่วมการแข่งขัน อัปโหลดสลิปชำระเงิน และดูสายการแข่งขัน (Bracket) และผลคะแนนแบบเรียลไทม์

---

## 🏗️ สถาปัตยกรรมและเทคโนโลยีหลัก (Architecture & Tech Stack)

ระบบนี้พัฒนาขึ้นภายใต้สถาปัตยกรรมแบบ **Microservices** ย่อยๆ ที่ทำงานร่วมกันผ่าน **Docker Compose** โดยมีเทคโนโลยีหลักดังนี้:

*   **Gateway (Reverse Proxy):** [Nginx](https://www.nginx.com/) ทำหน้าที่เป็น Gateway ที่พอร์ต `80` คอยจัดการเส้นทาง (Routing) ไปยังบริการต่างๆ
*   **Frontend:** [Next.js 15](https://nextjs.org/) (App Router), [Tailwind CSS v4](https://tailwindcss.com/), [Clerk Auth](https://clerk.com/) (ระบบล็อกอิน), [Framer Motion](https://www.framer.com/motion/) (อนิเมชัน), [React Flow / XYFlow](https://reactflow.dev/) และ `react-tournament-bracket` (สำหรับแสดงผลสายการแข่งขัน)
*   **Backend:** [Express.js](https://expressjs.com/) (TypeScript) ร่วมกับ [Prisma ORM](https://www.prisma.io/), [JWT Authentication](https://jwt.io/), [Swagger](https://swagger.io/) (API Documentation) และการป้องกันความปลอดภัยด้วย [Helmet](https://helmetjs.github.io/) และ [Rate Limit](https://www.npmjs.com/package/express-rate-limit)
*   **Database:** [PostgreSQL 18.1](https://www.postgresql.org/) เสริมประสิทธิภาพด้วย Extension `pg_cron` และการตั้งค่าอัตโนมัติ
*   **Object Storage:** [MinIO](https://min.io/) (S3 Compatible Storage) สำหรับเก็บรูปภาพสลิปชำระเงิน รูปภาพโปสเตอร์การแข่งขัน และรูปคิวอาร์โค้ด
*   **AI Integration:** [OpenAI API](https://openai.com/) สำหรับฟังก์ชันการช่วยประเมินระดับมือ/ระดับฝีมือนักกีฬา

---

## 🌟 คุณสมบัติเด่น (Key Features)

### สำหรับผู้จัดงาน (Organizer)
*   **การจัดการทัวร์นาเมนต์:** สร้าง แก้ไข และยกเลิกทัวร์นาเมนต์ กำหนดสถานที่ ราคาค่าสมัคร ค่าลูกขนไก่ จำนวนผู้สมัครสูงสุด และกติกาการแข่งขัน
*   **ระบบคัดกรองผู้สมัคร:** ตรวจสอบวิดีโอประเมินมือ (Hand Type) ของนักกีฬา อนุมัติหรือปฏิเสธการสมัคร
*   **ตรวจสอบการชำระเงิน:** ตรวจสอบรูปภาพสลิปที่ส่งมาจากผู้สมัคร และอนุมัติสถานะการจ่ายเงิน
*   **การจับสลากแบ่งสายและกลุ่ม:**
    *   สร้างกลุ่ม (Groups) และสายการแข่งขัน (Brackets) แบบ Double-Elimination หรือ Single-Elimination อัตโนมัติ
    *   กำหนดเวลาแข่งรายคู่ และอัปเดตสถานะการแข่งขันแบบเรียลไทม์
*   **บันทึกคะแนนและสรุปผล:** บันทึกผลสกอร์รายเซ็ต จำนวนลูกขนไก่ที่ใช้ และสรุปผลอันดับการแข่งขัน (Summary)

### สำหรับผู้เข้าแข่งขัน (Player)
*   **ดูรายการแข่งขัน:** ค้นหาและดูรายละเอียดทัวร์นาเมนต์ที่เปิดรับสมัคร
*   **สมัครการแข่งขัน:** สามารถกรอกข้อมูลตนเองหรือทีม (ประเภทเดี่ยว/ประเภทคู่) พร้อมแนบลิงก์วิดีโอประเมินมือ
*   **ชำระเงินออนไลน์:** แสดงรายละเอียดบัญชีธนาคาร/QR Code อัปโหลดสลิปชำระเงินเข้าสู่ระบบ
*   **ติดตามผลการแข่งขัน:** ดูตารางแข่ง สายการแข่งขัน (Visualized Bracket) สกอร์ และอันดับแบบเรียลไทม์

---

## 📁 โครงสร้างโปรเจกต์ (Project Directory Structure)

```text
badminton/
├── backend/             # Express.js API (TypeScript)
│   ├── src/             # Source code (Controllers, Routes, Services, Middlewares)
│   ├── prisma/          # Prisma schema, migrations, และ seed scripts
│   ├── scripts/         # Scripts สำหรับการรัน Prisma
│   └── Dockerfile       # Dockerfile สำหรับ Backend
├── frontend/            # Next.js 15 (TypeScript + Tailwind CSS v4)
│   ├── src/app/         # App Router (หน้าจัดการระบบ และฝั่งผู้เล่น)
│   ├── components/      # UI Components ต่างๆ
│   ├── nginx/           # ค่าคอนฟิก Nginx สำหรับ Gateway
│   └── Dockerfile       # Dockerfile สำหรับ Frontend
├── db/                  # PostgreSQL 18.1 Database Configuration
│   ├── Dockerfile       # Dockerfile สำหรับ DB (ติดตั้ง pg_cron)
│   └── BADMINTON.sql    # SQL Schema เริ่มต้น
├── docker-compose.yml   # Docker Compose (สำหรับ Database)
├── docker-compose.dev.yml # Docker Compose สำหรับรันสภาพแวดล้อม Development ทั้งหมด
└── Badminton_API.json   # Postman / API spec backup
```

---

## ⚙️ การตั้งค่าสภาพแวดล้อม (Environment Variables Configuration)

ก่อนเริ่มใช้งาน ให้คัดลอกไฟล์คอนฟิกสภาพแวดล้อมหรือตรวจสอบค่าต่างๆ ดังนี้:

### 1. Root Directory (`.env`)
ตั้งค่าฐานข้อมูล PostgreSQL และ MinIO สำหรับ Docker
```env
DATABASE_USER=postgres
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=badminton
DATABASE_PORT=5432

MINIO_ROOT_USER=badminton
MINIO_ROOT_PASSWORD=your_minio_password
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
```

### 2. Backend Directory (`backend/.env`)
ใช้ตั้งค่าฐานข้อมูล (ผ่าน service `db` ใน Docker Compose), JWT, MinIO Client และ OpenAI
```env
DATABASE_URL="postgresql://postgres:your_db_password@db:5432/badminton?schema=public&timezone=Asia/Bangkok"
OPENAI_API_KEY="sk-proj-your_openai_key"

PORT=8000
NODE_ENV=development
APP_BASE_URL=http://localhost:8000

# JWT Settings
JWT_ACCESS_SECRET=your_jwt_access_secret_key
JWT_ACCESS_EXPIRES=1m
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
JWT_REFRESH_EXPIRES=7d
JWT_ISSUER=jwt-jet-system
JWT_AUDIENCE=jwt-users

# MinIO Settings
MINIO_ENDPOINT=http://minio
MINIO_ROOT_USER=badminton
MINIO_ROOT_PASSWORD=your_minio_password
MINIO_BUCKET=badminton
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
MINIO_USE_SSL=false
```

### 3. Frontend Directory (`frontend/.env`)
ใช้สำหรับ Clerk Authentication และ URL ในการเชื่อมต่อ API Gateway
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/sign-in

NEXT_PUBLIC_API_URL=/api
```

---

## 🚀 วิธีการติดตั้งและเริ่มใช้งาน (How to Run)

### วิธีการที่แนะนำ: รันผ่าน Docker Compose (Development Mode)

วิธีนี้จะจำลองและรันระบบทั้งหมด (Gateway, Frontend, Backend, Database, MinIO) ขึ้นมาโดยอัตโนมัติ

1.  **โคลนโปรเจกต์** และไปที่โฟลเดอร์หลัก:
    ```bash
    git clone https://github.com/piyathida2310/badminton.git
    cd badminton
    ```
2.  **ตรวจสอบไฟล์ `.env`** ทั้ง 3 จุดตามคู่มือด้านบน (Root, Backend, Frontend)
3.  **สั่งรันระบบผ่าน Docker Compose**:
    ```bash
    docker-compose -f docker-compose.dev.yml up --build
    ```
4.  เมื่อรันเสร็จสิ้น คุณจะสามารถเข้าใช้งานบริการต่างๆ ผ่านทาง Gateway (`http://localhost`):
    *   **Frontend (Web Application):** [http://localhost](http://localhost)
    *   **Backend REST APIs:** [http://localhost/api](http://localhost/api)
    *   **Backend Health Check:** [http://localhost/api/health](http://localhost/api/health)
    *   **MinIO Object Storage Console:** [http://localhost:9001](http://localhost:9001)

---

## 📄 เอกสารคู่มือ API (API Documentation)

ระบบมีเอกสารคู่มือ API (Swagger UI) ที่สร้างจาก JSDoc บน Express.js โดยอัตโนมัติ

*   เมื่อระบบ backend ทำงานแล้ว คุณสามารถเข้าดูรายละเอียด API, การส่ง Request และทดลองเรียกใช้งาน (Try it out) ได้ที่:
    *   **Swagger API Docs:** [http://localhost/api/api-docs](http://localhost/api/api-docs) (หรือ [http://localhost:8000/api-docs](http://localhost:8000/api-docs) หากทดสอบ backend โดยตรง)

---

## 🛠️ วิธีการพัฒนาเพิ่มเติมเฉพาะจุด (Manual Development Guide)

หากต้องการรันเฉพาะบริการทีละส่วนโดยไม่ใช้ Docker ทั้งหมดสำหรับทุกบริการ:

### Backend
1.  ตรวจสอบว่ารัน PostgreSQL และ MinIO ใน Docker แล้ว (`docker-compose up -d db minio`)
2.  เข้าไปที่โฟลเดอร์ `backend`:
    ```bash
    cd backend
    npm install
    ```
3.  เปลี่ยน `DATABASE_URL` ใน `backend/.env` จาก `@db:5432` เป็น `@localhost:5432` และ `MINIO_ENDPOINT` เป็น `http://localhost`
4.  รันคำสั่ง Migration และ Seed ข้อมูลเริ่มต้น:
    ```bash
    # Generate Prisma Client
    npm run prisma:generate
    # Run Migration และ Seed ข้อมูล
    npm run prisma:migrate:dev
    ```
5.  เริ่มรัน Server ในโหมดพัฒนา:
    ```bash
    npm run dev
    ```

### Frontend
1.  เข้าไปที่โฟลเดอร์ `frontend`:
    ```bash
    cd frontend
    npm install
    ```
2.  เริ่มรัน Next.js ในโหมดพัฒนา:
    ```bash
    npm run dev
    ```
3.  เข้าใช้งานเว็บแอปพลิเคชันผ่าน [http://localhost:3000](http://localhost:3000)

---

## 🔒 ความปลอดภัย (Security Features)
1.  **Helmet.js:** ป้องกันช่องโหว่ด้าน HTTP Headers
2.  **Express Rate Limit:** จำกัดความถี่การร้องขอ API เพื่อป้องกันการโจมตีแบบ Brute-Force หรือ DoS
3.  **CORS Config:** กำหนดสิทธิ์ให้เฉพาะโดเมนและพอร์ตที่อนุญาตเข้าใช้งานทรัพยากร
4.  **JWT Authentication:** เข้ารหัส access token และ refresh token ด้วย Secret Keys ที่รัดกุม พร้อมคุกกี้ที่ปลอดภัยแบบ HTTP-Only
