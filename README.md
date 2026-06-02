# Badminton Tournament Management

ระบบจัดการการแข่งขันแบดมินตันอัจฉริยะ พร้อม AI ช่วยจัดกลุ่มผู้เล่น (Chain of Thought Grouping)

## เริ่มต้นใช้งาน

### 1. เตรียมโปรเจกต์และไฟล์ Environment
```bash
git clone https://github.com/piyathida2310/badminton.git && cd badminton
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
> [!IMPORTANT]
> **อย่าลืม:** แก้ไขไฟล์ `.env` ทั้ง 3 จุด (Root, Backend, Frontend) และใส่ค่าคอนฟิกจริง (เช่น Database, API Keys, Clerk Secrets)

### 2. รันระบบด้วย Docker Compose
```bash
docker compose -f docker-compose.dev.yml up -d --build
```

### โครงสร้างและเซอร์วิสของระบบ (Services Routing)

| Path / Port       | Service           | Description                                  |
| ----------------- | ----------------- | -------------------------------------------- |
| `localhost:80`    | **Gateway**       | Nginx Reverse Proxy (เชื่อม Frontend/Backend)|
| `localhost:80/`   | **Frontend**      | Next.js Web Application UI                   |
| `/api/*`          | **Backend API**   | Node.js / Express.js API Endpoints           |
| `localhost:5432`  | **Database**      | PostgreSQL Database                          |
| `localhost:9000`  | **MinIO API**     | S3 Compatible Object Storage                 |
| `localhost:9001`  | **MinIO Console** | Web UI สำหรับจัดการไฟล์ (Storage)              |

---
