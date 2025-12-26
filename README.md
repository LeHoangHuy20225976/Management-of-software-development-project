# 🏨 Hotel Booking Management System

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.x-black.svg)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://postgresql.org/)

> **Course Project**: Management of Software Development  
> **University**: Hanoi University of Science and Technology (HUST)  
> **Semester**: 20251

A comprehensive hotel booking and management platform with AI-powered features, built as a full-stack application with microservices architecture.

---

## 📋 Table of Contents

- [Team Members](#-team-members)
- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Features](#-features)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [License](#-license)

---

## 👥 Team Members

| # | Name | Student ID | Email |
|---|------|------------|-------|
| 1 | Trần Gia Khánh | 20226048 | khanh.tg226048@sis.hust.edu.vn |
| 2 | Phan Gia Đô | 20226026 | do.pg226026@sis.hust.edu.vn |
| 3 | Nguyễn Công Đạt | 20226022 | dat.nc226022@sis.hust.edu.vn |
| 4 | Lê Hoàng Huy | 20225976 | huy.lh225976@sis.hust.edu.vn |
| 5 | Lê Văn Hậu | 20226038 | hau.lv226038@sis.hust.edu.vn |
| 6 | Nguyễn Trung Hiếu | 20225971 | hieu.nt225971@sis.hust.edu.vn |
| 7 | Nguyễn Công Minh | 20226056 | minh.nc226056@sis.hust.edu.vn |
| 8 | Bùi Nguyễn Minh | 20226055 | minh.bn226055@sis.hust.edu.vn |
| 9 | Phùng Đức Đạt | 20226025 | dat.pd226025@sis.hust.edu.vn |
| 10 | Hà Minh Đức | 20226027 | duc.hm226027@sis.hust.edu.vn |
| 11 | Nguyễn Trung Kiên | 20226052 | kien.nt226052@sis.hust.edu.vn |
| 12 | Vũ Hải Đăng | 20226021 | dang.vh226021@sis.hust.edu.vn |
| 13 | Phạm Duy Hoàng | 20226042 | hoang.pd226042@sis.hust.edu.vn |

**Group 10**

---

## 🎯 Project Overview

This project is a **Hotel Booking Management System** that provides:

- **For Customers**: Search hotels, book rooms, make payments, write reviews
- **For Hotel Managers**: Manage rooms, pricing, bookings, facilities, images
- **For Administrators**: System management, user management, revenue analytics
- **AI Features**: CV processing, ML recommendations, LLM-powered chatbot, RAG integration

### System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│     Backend     │────▶│    Database     │
│   (Next.js)     │     │   (Express.js)  │     │  (PostgreSQL)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │   AI Services   │
                        │   (FastAPI)     │
                        └─────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        ┌──────────┐    ┌──────────┐    ┌──────────┐
        │ CV Svc   │    │ ML Svc   │    │ LLM Svc  │
        └──────────┘    └──────────┘    └──────────┘
```

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.x | React framework with App Router |
| React | 19.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Styling |
| Zustand | - | State management |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18.x | Runtime |
| Express.js | 4.x | Web framework |
| Sequelize | 6.x | ORM |
| PostgreSQL | 15.x | Database |
| MinIO | - | Object storage |
| JWT | - | Authentication |

### AI Services
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11 | Runtime |
| FastAPI | - | API framework |
| LangChain | - | LLM orchestration |
| Prefect | - | Workflow orchestration |
| RabbitMQ | - | Message queue |

### DevOps
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |
| Nginx | Reverse proxy |
| GitHub Actions | CI/CD |

---

## 📁 Project Structure

```
Management-of-software-development-project/
├── frontend/                 # Next.js Frontend Application
│   ├── app/                  # App Router pages
│   │   ├── admin/            # Admin panel pages
│   │   ├── hotel-manager/    # Hotel manager pages
│   │   ├── user/             # User dashboard pages
│   │   ├── booking/          # Booking flow
│   │   ├── payment/          # Payment pages
│   │   ├── tourism/          # Tourism destinations
│   │   └── ...
│   ├── components/           # Reusable components
│   ├── lib/                  # Utilities & API services
│   └── types/                # TypeScript types
│
├── backend/                  # Express.js Backend API
│   ├── modules/              # Feature modules
│   │   ├── auth/             # Authentication
│   │   ├── booking-engine/   # Booking management
│   │   ├── hotel-profile/    # Hotel management
│   │   ├── payment-gateway/  # Payment processing
│   │   ├── pricing-engine/   # Dynamic pricing
│   │   ├── room-inventory/   # Room management
│   │   ├── super-admin/      # Admin functions
│   │   ├── tourism-cms/      # Destinations CMS
│   │   ├── user-profile/     # User management
│   │   └── notification/     # Email notifications
│   ├── models/               # Sequelize models
│   ├── migrations/           # Database migrations
│   └── configs/              # Configuration files
│
├── AI/                       # AI Microservices
│   ├── src/
│   │   ├── application/      # Service layer
│   │   │   ├── cv-service/   # CV processing
│   │   │   ├── ml-service/   # ML recommendations
│   │   │   └── llm-service/  # LLM chatbot
│   │   ├── infrastructure/   # Infrastructure layer
│   │   └── flow/             # Prefect workflows
│   ├── deployments/          # Docker configurations
│   └── docs/                 # AI documentation
│
└── README.md                 # This file
```

---

## ✨ Features

### 🏠 Customer Features
- [x] Hotel search with filters (location, price, stars, amenities)
- [x] Room browsing and availability check
- [x] Booking creation with price calculation
- [x] VNPay payment integration
- [x] Booking history and management
- [x] Hotel and destination reviews
- [x] User profile management
- [x] Notifications center

### 🏨 Hotel Manager Features
- [x] Hotel profile management
- [x] Room type and inventory management
- [x] Dynamic pricing configuration
- [x] Facility management
- [x] Image gallery management
- [x] Booking management (check-in/check-out)
- [x] Review management and responses
- [x] Analytics dashboard

### 👨‍💼 Admin Features
- [x] System dashboard with KPIs
- [x] User management (CRUD, roles)
- [x] Hotel approval/rejection
- [x] Destination management
- [x] Revenue analytics
- [x] System settings

### 🤖 AI Features
- [x] CV processing and parsing
- [x] ML-based recommendations
- [x] LLM-powered chatbot
- [x] RAG (Retrieval-Augmented Generation)
- [x] Workflow orchestration with Prefect

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- Python 3.11 or higher
- PostgreSQL 15.x
- Docker & Docker Compose (optional)
- MinIO (for file storage)

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Run database migrations
npx sequelize-cli db:migrate

# Start development server
npm run dev
```

The backend API will be available at `http://localhost:4000`

### AI Services Setup

```bash
# Navigate to AI directory
cd AI

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start services with Docker Compose
docker-compose up -d
```

### Using Docker Compose (Full Stack)

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

---

## 📚 API Documentation

### Backend API Endpoints

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/register` | User registration |
| POST | `/auth/logout` | User logout |
| POST | `/auth/refresh-tokens` | Refresh access token |
| POST | `/auth/reset-password` | Reset password |

#### Hotels
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/hotel-profile/all-hotels` | Get all hotels |
| GET | `/hotel-profile/view-hotel/:id` | Get hotel details |
| POST | `/hotel-profile/add-hotel` | Create new hotel |
| PUT | `/hotel-profile/update-hotel/:id` | Update hotel |
| DELETE | `/hotel-profile/delete-hotel/:id` | Delete hotel |

#### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bookings` | Get all bookings |
| GET | `/bookings/:id` | Get booking details |
| POST | `/bookings` | Create booking |
| POST | `/bookings/:id/cancel` | Cancel booking |
| POST | `/bookings/:id/checkin` | Check-in |
| POST | `/bookings/:id/checkout` | Check-out |

#### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/create` | Create payment |
| GET | `/payments/vnpay-return` | VNPay callback |
| POST | `/payments/:id/refund` | Refund payment |

For complete API documentation, see [Backend README](./backend/README.md).

---

## 📸 Screenshots

### Homepage
The main landing page with hotel search functionality.

### Hotel Search
Filter hotels by location, price range, star rating, and amenities.

### Booking Flow
Step-by-step booking process with room selection and payment.

### Hotel Manager Dashboard
Comprehensive dashboard for hotel managers to manage their properties.

### Admin Panel
System administration with user management and analytics.

---

## 📄 License

This project is developed for educational purposes as part of the **Management of Software Development** course at **Hanoi University of Science and Technology (HUST)**.

---

## 🙏 Acknowledgments

- **Course Instructor**: For guidance throughout the project
- **Hanoi University of Science and Technology**: For providing the learning environment
- **Open Source Community**: For the amazing tools and libraries used in this project

---

<p align="center">
  Made with ❤️ by <strong>Group 10</strong> - HUST 
</p>
