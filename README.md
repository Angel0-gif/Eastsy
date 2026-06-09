# EATSY — Full-Stack Restaurant App
### Université Saint Jean Ingénieur — 2025–2026
**Authors:** Chetsong Ange · Djeufack Wilson  
**Supervisor:** Mme. YTEMBE

---

## Project Structure
```
eatsy/
├── eatsy-frontend/      ← Ionic 7 + Angular 17 (TypeScript)
└── eatsy-backend/       ← Django 4.2 + DRF + MySQL
```

## Admin Account
User: admin@eatsy.cm
Password: Eatsy@Admin2025

---

## Quick Start

### Backend (Django)
```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # Edit with your DB credentials
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
# API: http://127.0.0.1:8000/api/
# Docs: http://127.0.0.1:8000/api/docs/
```

### Frontend (Ionic)
```bash
cd frontend
npm install
ionic serve                    # Browser: http://localhost:8100
ionic capacitor run android    # Android device/emulator
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Create account |
| POST | `/api/auth/login/` | Get JWT tokens |
| POST | `/api/auth/token/refresh/` | Refresh access token |
| POST | `/api/auth/logout/` | Blacklist refresh token |
| GET  | `/api/auth/me/` | Get/update profile |
| GET  | `/api/menu/items/` | List menu items |
| GET  | `/api/menu/items/?category=main` | Filter by category |
| GET  | `/api/menu/categories/` | List categories |
| GET  | `/api/tables/` | List tables (with availability) |
| GET  | `/api/tables/?date=YYYY-MM-DD&time=HH:MM` | Availability check |
| GET/POST | `/api/reservations/` | List / create reservations |
| PATCH | `/api/reservations/{id}/` | Update / cancel |
| GET/POST | `/api/orders/` | List / create orders |
| GET  | `/api/orders/{id}/track/` | Live order status |
| POST | `/api/payments/initiate/` | Initiate payment |
| GET  | `/api/payments/{id}/` | Payment status |
| GET/POST | `/api/reviews/` | List / create reviews |
| GET  | `/api/reviews/summary/` | Rating summary |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile UI | Ionic 7 + Angular 17 |
| Language (FE) | TypeScript |
| Language (BE) | Python 3.11 |
| API Framework | Django REST Framework 3.14 |
| Auth | JWT (SimpleJWT) |
| Database | MySQL 8.0 (InnoDB) |
| ORM | Django ORM |
| Task Queue | Celery + Redis |
| API Docs | drf-spectacular (Swagger/ReDoc) |
| Android Build | Capacitor 5 |

---

## Architecture
```
[Ionic App] ──HTTPS──► [Django REST API] ──► [MySQL 8.0]
                               │
                               └──► [Redis / Celery] (SMS, async tasks)
```

---

*EATSY v1.0.0 — Built with ❤️ in Yaoundé, Cameroun*
