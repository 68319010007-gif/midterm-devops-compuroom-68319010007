# CompuRoom — ระบบบันทึกข้อมูลเครื่องคอมพิวเตอร์ประจำห้อง

**นายชัยวัฒน์ ฮาดนิล** · รหัสนักศึกษา **68319010007** · DevOps 30901-2008

[![CI - compuroom](https://github.com/68319010007-gif/midterm-devops-compuroom-68319010007/actions/workflows/ci.yml/badge.svg)](https://github.com/68319010007-gif/midterm-devops-compuroom-68319010007/actions/workflows/ci.yml)

## คำอธิบายระบบ

ระบบบันทึกข้อมูลเครื่องคอมพิวเตอร์ในห้องปฏิบัติการของแผนก รองรับ CRUD ครบถ้วนผ่าน REST API และหน้าเว็บ HTML + Vanilla JS

| ฟิลด์ | คำอธิบาย |
|------|----------|
| `asset_code` | รหัสครุภัณฑ์/รหัสเครื่อง |
| `brand_model` | ยี่ห้อและรุ่น |
| `cpu` | สเปก CPU |
| `ram_gb` | RAM (GB) |
| `room` | ห้องที่ติดตั้ง |
| `status` | `active` (ใช้งาน) · `repair` (ส่งซ่อม) · `disposed` (จำหน่าย) |

## Tech Stack

| ส่วน | เทคโนโลยี |
|------|-----------|
| Backend | Node.js + Express + PostgreSQL |
| Frontend | HTML + Vanilla JS + Nginx |
| Container | Docker + Docker Compose |
| CI/CD | GitHub Actions |

## API Endpoints

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| GET | `/health` | Health check `{ status, version }` |
| GET | `/api/computers` | ดึงรายการเครื่องทั้งหมด |
| GET | `/api/computers/:id` | ดึงข้อมูลตาม id (404 ถ้าไม่พบ) |
| POST | `/api/computers` | เพิ่มข้อมูลเครื่อง |
| PUT | `/api/computers/:id` | แก้ไขข้อมูลเครื่อง |
| DELETE | `/api/computers/:id` | ลบข้อมูลเครื่อง |

### ตัวอย่าง Request Body (POST / PUT)

```json
{
  "asset_code": "PC-LAB-001",
  "brand_model": "Dell OptiPlex 7090",
  "cpu": "Intel Core i5-11500",
  "ram_gb": 8,
  "room": "ห้อง 101",
  "status": "active"
}
```

## วิธีรัน (Development — build จาก source)

```bash
# 1. clone repository
git clone https://github.com/68319010007-gif/midterm-devops-compuroom-68319010007.git
cd midterm-devops-compuroom-68319010007

# 2. คัดลอก env (ถ้าต้องการปรับค่า)
copy .env.example .env

# 3. รันทั้งระบบ
docker compose up -d --build
```

- Frontend: http://localhost:8080
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/health

## วิธีรัน (Production — pull จาก Docker Hub)

```bash
docker compose -f docker-compose.prod.yml up -d
```

## Docker Hub

| Image | Repository |
|-------|------------|
| Backend API | https://hub.docker.com/r/chaiwat007/compuroom-api |
| Frontend Web | https://hub.docker.com/r/chaiwat007/compuroom-web |

Tags: `latest`, `v1.0.0`

```bash
docker pull chaiwat007/compuroom-api:latest
docker pull chaiwat007/compuroom-web:latest
```

## รัน Backend แบบ local (ไม่ใช้ Docker)

```bash
cd backend
copy .env.example .env
npm install
npm run lint
npm test
npm start
```

## GitHub Repository

https://github.com/68319010007-gif/midterm-devops-compuroom-68319010007
