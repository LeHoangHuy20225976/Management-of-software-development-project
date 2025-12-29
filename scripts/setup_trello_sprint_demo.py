#!/usr/bin/env python3
"""
Trello Sprint Board for Hotel Management System - DEMO VERSION
Tasks from project inception to current state
For presentation/demo purposes
"""

import requests
from datetime import datetime, timedelta

# Trello credentials
API_KEY = "5c64f454d0743302a83bb36d4817ebe7"
TOKEN = "ATTA7ca8426da8683bbc15e164b8a2463cfa4345dde033a1a4dee7cdec66e1e0d3150811909A"

BASE_URL = "https://api.trello.com/1"

# Sprint dates
sprint_start = datetime.now()
sprint_end = sprint_start + timedelta(days=30)

# Demo Tasks - From Project Start to Current State
DEMO_TASKS = {
    "Done": [
        # Week 1-2: Project Setup & Infrastructure
        {
            "name": "✅ [Week 1] Project Setup & Architecture",
            "desc": """✅ Completed

**What was done:**
- Initialized Next.js frontend project
- Set up Node.js/Express backend
- Created Python FastAPI AI service
- Docker Compose configuration
- Git repository structure

**Team:** All
**Duration:** 3 days
**Files:** docker-compose.yml, package.json, requirements.txt""",
            "labels": ["Backend", "Frontend", "AI"]
        },
        {
            "name": "✅ [Week 1] Database Schema Design",
            "desc": """✅ Completed

**What was done:**
- PostgreSQL database design
- Tables: User, Hotel, Room, Booking, Payment, Review
- Relationships and foreign keys
- pgVector extension for AI features
- Database migrations

**Team:** Backend
**Duration:** 2 days
**Files:** MOS_creation_script.sql, init-db.sql""",
            "labels": ["Backend", "Database"]
        },
        {
            "name": "✅ [Week 2] Authentication System",
            "desc": """✅ Completed

**Features:**
- User registration & login
- Hotel manager registration
- Admin login
- JWT authentication
- Role-based access control (User, Hotel Manager, Admin)
- Session management with cookies

**Team:** Backend (2), Frontend (1)
**Duration:** 4 days
**Endpoints:** /api/v1/auth/login, /register, /logout""",
            "labels": ["Backend", "Frontend"]
        },

        # Week 3-4: Core Features
        {
            "name": "✅ [Week 3] Hotel Profile Management",
            "desc": """✅ Completed

**Features:**
- Hotel registration by managers
- Hotel information CRUD
- Add/edit hotel facilities
- Room types management
- Room inventory management

**Team:** Backend (2), Frontend (2)
**Duration:** 5 days
**Module:** backend/modules/hotel-profile/""",
            "labels": ["Backend", "Frontend"]
        },
        {
            "name": "✅ [Week 3] Booking Engine - Basic",
            "desc": """✅ Completed

**Features:**
- Room availability check
- Create booking
- View bookings
- Cancel booking
- Booking history

**Team:** Backend (2), Frontend (1)
**Duration:** 4 days
**Module:** backend/modules/booking-engine/""",
            "labels": ["Backend", "Frontend"]
        },
        {
            "name": "✅ [Week 4] Payment Gateway Integration",
            "desc": """✅ Completed

**Features:**
- VNPay integration
- Payment webhook handling
- Transaction logging
- Payment status tracking
- Refund support

**Team:** Backend (2)
**Duration:** 3 days
**Module:** backend/modules/payment-gateway/""",
            "labels": ["Backend"]
        },
        {
            "name": "✅ [Week 4] Frontend - Home Page & Search",
            "desc": """✅ Completed

**Features:**
- Landing page with hero section
- Hotel search with filters
- Search results page
- Hotel detail page
- Responsive design

**Team:** Frontend (3)
**Duration:** 5 days
**Pages:** app/page.tsx, app/search/, app/hotel/[id]/""",
            "labels": ["Frontend"]
        },

        # Week 5-6: AI Features
        {
            "name": "✅ [Week 5] AI - Image Search with CLIP",
            "desc": """✅ Completed

**Features:**
- CLIP model integration (ViT-B/32)
- Text-to-image search
- Image embeddings storage in pgVector
- Similar image search
- Hotel image indexing

**Team:** AI (2)
**Duration:** 4 days
**Module:** AI/src/application/services/cv/image_search.py""",
            "labels": ["AI", "Database"]
        },
        {
            "name": "✅ [Week 5] AI - RAG System with LlamaIndex",
            "desc": """✅ Completed

**Features:**
- Document upload (PDF, DOCX)
- Text chunking with LlamaIndex
- Embeddings with multilingual model
- Vector storage in pgVector
- Query engine for document Q&A

**Team:** AI (2)
**Duration:** 5 days
**Module:** AI/src/application/services/llm/rag/""",
            "labels": ["AI"]
        },
        {
            "name": "✅ [Week 6] AI Chatbot - LangGraph Agent",
            "desc": """✅ Completed

**Features:**
- LLM integration (GPT via NVIDIA API)
- Multi-agent with LangGraph
- Database tools (bookings, hotels, users)
- RAG integration
- Image search integration
- Vietnamese language support

**Team:** AI (3), Backend (1)
**Duration:** 6 days
**Files:** AI/src/application/services/llm/graph_with_tools_sync.py""",
            "labels": ["AI", "Backend"]
        },
        {
            "name": "✅ [Week 6] Frontend - AI Chatbot UI",
            "desc": """✅ Completed

**Features:**
- Chat interface with message history
- Markdown rendering
- Image display in responses
- Real-time streaming (optional)
- User context integration

**Team:** Frontend (2), AI (1)
**Duration:** 3 days
**Component:** components/chatbot/HotelChatbot.tsx""",
            "labels": ["Frontend", "AI"]
        },

        # Week 7-8: Advanced Features
        {
            "name": "✅ [Week 7] Hotel Media Upload System",
            "desc": """✅ Completed (THIS SPRINT)

**Features:**
- Multi-image upload
- Document upload for RAG
- MinIO storage integration
- CLIP embeddings for images
- 3-step hotel registration with media

**Team:** AI (2), Backend (2), Frontend (2)
**Duration:** 4 days
**Module:** AI/src/application/controllers/hotel/upload_controller.py""",
            "labels": ["AI", "Backend", "Frontend"]
        },
        {
            "name": "✅ [Week 7] Face Recognition - Attendance",
            "desc": """✅ Completed

**Features:**
- Face detection and recognition
- Staff attendance clock-in/out
- Face embeddings storage
- Attendance logs
- Basic analytics

**Team:** AI (2), Backend (1), Frontend (1)
**Duration:** 5 days
**Module:** AI/src/application/services/cv/face_recognition.py""",
            "labels": ["AI", "Backend", "Frontend"]
        },
        {
            "name": "✅ [Week 8] Admin Dashboard - Basic",
            "desc": """✅ Completed

**Features:**
- User management
- Hotel approval system
- Booking overview
- Revenue statistics
- System logs

**Team:** Frontend (2), Backend (1)
**Duration:** 4 days
**Pages:** app/admin/dashboard/""",
            "labels": ["Frontend", "Backend"]
        },
        {
            "name": "✅ [Week 8] Notification System",
            "desc": """✅ Completed

**Features:**
- In-app notifications
- Notification badge
- Mark as read/unread
- Notification types (booking, payment, system)

**Team:** Backend (1), Frontend (1)
**Duration:** 2 days
**Module:** backend/modules/notification/""",
            "labels": ["Backend", "Frontend"]
        }
    ],

    "In Progress": [
        {
            "name": "🔄 [Week 8] Tourism CMS - Destinations",
            "desc": """🔄 In Progress

**Features:**
- Destination management
- Destination detail pages
- Related hotels
- Tourist attractions
- Reviews for destinations

**Team:** Backend (1), Frontend (2)
**Estimated:** 3 days
**Module:** backend/modules/tourism-cms/""",
            "labels": ["Backend", "Frontend"]
        },
        {
            "name": "🔄 [Week 8] Dynamic Pricing Engine",
            "desc": """🔄 In Progress

**Features:**
- Base pricing logic
- Seasonal pricing
- Demand-based pricing
- Promo codes support
- Price history

**Team:** Backend (2)
**Estimated:** 4 days
**Module:** backend/modules/pricing-engine/""",
            "labels": ["Backend"]
        },
        {
            "name": "🔄 [Week 8] Email Notification Service",
            "desc": """🔄 In Progress

**Features:**
- Booking confirmation emails
- Password reset emails
- Email templates
- Queue with Bull/Redis

**Team:** Backend (1)
**Estimated:** 2 days
**File:** backend/modules/notification/EMAIL_NOTIFICATION_GUIDE.md""",
            "labels": ["Backend"]
        }
    ],

    "To Do": [
        # Next Sprint Tasks
        {
            "name": "📋 User Profile - Enhanced",
            "desc": """**Features to add:**
- Edit profile with avatar upload
- Booking history with filters
- Saved hotels/favorites
- Review management
- Preferences settings

**Team:** Frontend (2), Backend (1)
**Estimated:** 3 days""",
            "labels": ["Frontend", "Backend"]
        },
        {
            "name": "📋 Hotel Manager Dashboard - Analytics",
            "desc": """**Features to add:**
- Revenue charts
- Booking trends
- Occupancy rates
- Customer insights
- Export reports

**Team:** Frontend (2), Backend (1)
**Estimated:** 4 days""",
            "labels": ["Frontend", "Backend"]
        },
        {
            "name": "📋 Review & Rating System",
            "desc": """**Features to add:**
- Submit reviews with photos
- Rating breakdown
- Verified bookings only
- Helpful votes
- Report inappropriate reviews

**Team:** Frontend (1), Backend (1)
**Estimated:** 3 days""",
            "labels": ["Frontend", "Backend"]
        },
        {
            "name": "📋 Advanced Hotel Search",
            "desc": """**Features to add:**
- Map view with markers
- Geo-location search
- Multiple filters (price, rating, amenities)
- Sort options
- Save search preferences

**Team:** Frontend (2), Backend (1)
**Estimated:** 4 days""",
            "labels": ["Frontend", "Backend"]
        },
        {
            "name": "📋 Mobile Responsive - Optimization",
            "desc": """**Tasks:**
- Mobile-first design improvements
- Touch-friendly UI
- Performance optimization
- Progressive Web App (PWA)

**Team:** Frontend (3)
**Estimated:** 3 days""",
            "labels": ["Frontend"]
        },
        {
            "name": "📋 API Documentation - Swagger",
            "desc": """**Tasks:**
- OpenAPI/Swagger setup
- Document all endpoints
- API examples
- Postman collection

**Team:** Backend (1)
**Estimated:** 2 days""",
            "labels": ["Backend", "Documentation"]
        },
        {
            "name": "📋 Testing - Unit & Integration",
            "desc": """**Tasks:**
- Backend: Jest tests for APIs
- Frontend: React Testing Library
- AI: Pytest for services
- Integration tests
- CI/CD pipeline

**Team:** All
**Estimated:** 5 days""",
            "labels": ["Backend", "Frontend", "AI", "Testing"]
        },
        {
            "name": "📋 Performance Optimization",
            "desc": """**Tasks:**
- Database indexing
- Redis caching
- Image optimization
- Code splitting
- Lazy loading

**Team:** Backend (2), Frontend (1)
**Estimated:** 3 days""",
            "labels": ["Backend", "Frontend"]
        },
        {
            "name": "📋 Security Enhancements",
            "desc": """**Tasks:**
- Rate limiting
- CORS configuration
- Input validation
- SQL injection prevention
- XSS protection

**Team:** Backend (2)
**Estimated:** 2 days""",
            "labels": ["Backend"]
        },
        {
            "name": "📋 AI - ML Models Enhancement",
            "desc": """**Tasks:**
- Hotel recommendation system
- Price prediction
- Customer Lifetime Value (CLV)
- Churn prediction
- Model monitoring

**Team:** AI (2)
**Estimated:** 5 days""",
            "labels": ["AI"]
        }
    ],

    "Backlog": [
        {
            "name": "💡 Real-time Chat - WebSocket",
            "desc": """Future feature: Real-time messaging between guests and hotels""",
            "labels": ["Backend", "Frontend"]
        },
        {
            "name": "💡 Multi-language Support (i18n)",
            "desc": """Future feature: Support English, Vietnamese, and other languages""",
            "labels": ["Frontend"]
        },
        {
            "name": "💡 Mobile App - React Native",
            "desc": """Future feature: Native mobile apps for iOS and Android""",
            "labels": ["Frontend"]
        },
        {
            "name": "💡 Loyalty Program",
            "desc": """Future feature: Points, rewards, and member tiers""",
            "labels": ["Backend", "Frontend"]
        },
        {
            "name": "💡 Social Login (Google, Facebook)",
            "desc": """Future feature: OAuth2 integration""",
            "labels": ["Backend", "Frontend"]
        },
        {
            "name": "💡 Advanced Analytics Dashboard",
            "desc": """Future feature: Business intelligence and predictive analytics""",
            "labels": ["AI", "Frontend"]
        },
        {
            "name": "💡 Voice Assistant Integration",
            "desc": """Future feature: Voice booking with AI""",
            "labels": ["AI"]
        }
    ]
}

def create_board(name, desc):
    """Create a new Trello board"""
    url = f"{BASE_URL}/boards/"
    query = {
        'key': API_KEY,
        'token': TOKEN,
        'name': name,
        'desc': desc,
        'defaultLists': 'false'
    }
    response = requests.post(url, params=query)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"❌ Failed to create board: {response.text}")
        return None

def create_list(board_id, name):
    """Create a list on the board"""
    url = f"{BASE_URL}/lists"
    query = {
        'key': API_KEY,
        'token': TOKEN,
        'name': name,
        'idBoard': board_id
    }
    response = requests.post(url, params=query)
    return response.json() if response.status_code == 200 else None

def create_label(board_id, name, color):
    """Create a label on the board"""
    url = f"{BASE_URL}/labels"
    query = {
        'key': API_KEY,
        'token': TOKEN,
        'name': name,
        'color': color,
        'idBoard': board_id
    }
    response = requests.post(url, params=query)
    return response.json() if response.status_code == 200 else None

def create_card(list_id, name, desc=''):
    """Create a card in a list"""
    url = f"{BASE_URL}/cards"
    query = {
        'key': API_KEY,
        'token': TOKEN,
        'idList': list_id,
        'name': name,
        'desc': desc
    }
    response = requests.post(url, params=query)
    return response.json() if response.status_code == 200 else None

def main():
    print("🚀 Creating Trello Sprint Board for DEMO...\n")

    # Create board
    board_name = f"Hotel Management System - Demo Sprint {sprint_start.strftime('%b %Y')}"
    board_desc = f"""📅 Sprint: {sprint_start.strftime('%Y-%m-%d')} → {sprint_end.strftime('%Y-%m-%d')} (30 days)

👥 Team: 13 members
• Frontend: 5 developers (Tran Gia Khanh, Phan Gia Do, Nguyen Cong Dat, Le Hoang Huy, Le Van Hau)
• Backend: 4 developers (Nguyen Trung Hieu, Nguyen Cong Minh, Phung Duc Dat, Ha Minh Duc)
• AI: 4 developers (Nguyen Trung Kien, Vu Hai Dang, Pham Duy Hoang, Bui Nguyen Minh)

🛠️ Tech Stack:
• Frontend: Next.js, React, TypeScript, Tailwind CSS
• Backend: Node.js, Express, PostgreSQL
• AI: Python, FastAPI, LangChain, LlamaIndex, CLIP
• Infrastructure: Docker, MinIO, Redis

📦 Repository: https://github.com/LeHoangHuy20225976/Management-of-software-development-project

This board shows project progress from inception to current state."""

    board = create_board(board_name, board_desc)
    if not board:
        return

    board_id = board['id']
    print(f"✅ Created board: {board['name']}\n")

    # Create labels
    print("📌 Creating labels...")
    labels = {}
    for label_name, color in [
        ("Frontend", "green"),
        ("Backend", "blue"),
        ("AI", "purple"),
        ("Database", "orange"),
        ("Documentation", "sky"),
        ("Testing", "lime")
    ]:
        label = create_label(board_id, label_name, color)
        if label:
            labels[label_name] = label['id']
            print(f"  ✅ {label_name}")

    # Create lists
    print("\n📋 Creating lists...")
    lists = {}
    for list_name in ["Backlog", "To Do", "In Progress", "Done"]:
        list_obj = create_list(board_id, list_name)
        if list_obj:
            lists[list_name] = list_obj['id']
            print(f"  ✅ {list_name}")

    # Create cards
    print("\n📝 Creating cards...")
    for list_name, tasks in DEMO_TASKS.items():
        if list_name not in lists:
            continue

        print(f"\n  {list_name}:")
        for task in tasks:
            card = create_card(lists[list_name], task['name'], task['desc'])
            if card:
                # Add labels
                if 'labels' in task:
                    for label_name in task['labels']:
                        if label_name in labels:
                            url = f"{BASE_URL}/cards/{card['id']}/idLabels"
                            requests.post(url, params={
                                'key': API_KEY,
                                'token': TOKEN,
                                'value': labels[label_name]
                            })
                print(f"    ✅ {task['name'][:60]}")

    # Summary
    print("\n" + "="*70)
    print("✅ DEMO SPRINT BOARD CREATED SUCCESSFULLY!")
    print("="*70)
    print(f"\n🔗 Board URL: {board['url']}")
    print(f"\n📊 Task Summary:")
    for list_name, tasks in DEMO_TASKS.items():
        print(f"  {list_name}: {len(tasks)} tasks")

    print(f"\n⏱️  Total Development Time Shown: ~8 weeks")
    print(f"  • Week 1-2: Project setup & core infrastructure")
    print(f"  • Week 3-4: Main features (Hotel, Booking, Payment)")
    print(f"  • Week 5-6: AI features (CLIP, RAG, Chatbot)")
    print(f"  • Week 7-8: Advanced features & optimization")

    print(f"\n📌 Next Steps for Demo:")
    print(f"  1. Present board to stakeholders")
    print(f"  2. Show completed features (Done column)")
    print(f"  3. Explain current work (In Progress)")
    print(f"  4. Discuss upcoming features (To Do)")
    print(f"\n🔗 {board['url']}\n")

if __name__ == "__main__":
    main()
