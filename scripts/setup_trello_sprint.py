#!/usr/bin/env python3
"""
Script to setup Trello board for Hotel Management System Sprint
Sprint: 1 month
Team: 13 members (5 FE, 4 BE, 4 AI)
"""

import requests
import json
from datetime import datetime, timedelta

# Trello credentials
API_KEY = "5c64f454d0743302a83bb36d4817ebe7"
TOKEN = "ATTA7ca8426da8683bbc15e164b8a2463cfa4345dde033a1a4dee7cdec66e1e0d3150811909A"

BASE_URL = "https://api.trello.com/1"

# Team members
TEAM_MEMBERS = [
    {"name": "Tran Gia Khanh", "id": "20226048", "role": "FE"},
    {"name": "Phan Gia Do", "id": "20226026", "role": "FE"},
    {"name": "Nguyen Cong Dat", "id": "20226022", "role": "FE"},
    {"name": "Le Hoang Huy", "id": "20225976", "role": "FE"},
    {"name": "Le Van Hau", "id": "20226038", "role": "FE"},
    {"name": "Nguyen Trung Hieu", "id": "20225971", "role": "Backend"},
    {"name": "Nguyen Cong Minh", "id": "20226056", "role": "Backend"},
    {"name": "Phung Duc Dat", "id": "20226025", "role": "Backend"},
    {"name": "Ha Minh Duc", "id": "20226027", "role": "Backend"},
    {"name": "Nguyen Trung Kien", "id": "20226052", "role": "AI"},
    {"name": "Vu Hai Dang", "id": "20226021", "role": "AI"},
    {"name": "Pham Duy Hoang", "id": "20226042", "role": "AI"},
    {"name": "Bui Nguyen Minh", "id": "20226055", "role": "AI + FE"},  # Lead
]

# Sprint dates
sprint_start = datetime.now()
sprint_end = sprint_start + timedelta(days=30)

def create_board(name, desc):
    """Create a new Trello board"""
    url = f"{BASE_URL}/boards/"
    query = {
        'key': API_KEY,
        'token': TOKEN,
        'name': name,
        'desc': desc,
        'defaultLists': 'false'  # We'll create custom lists
    }

    response = requests.post(url, params=query)
    if response.status_code == 200:
        board = response.json()
        print(f"✅ Created board: {board['name']} (ID: {board['id']})")
        return board
    else:
        print(f"❌ Failed to create board: {response.text}")
        return None

def create_list(board_id, name, pos='bottom'):
    """Create a list on the board"""
    url = f"{BASE_URL}/lists"
    query = {
        'key': API_KEY,
        'token': TOKEN,
        'name': name,
        'idBoard': board_id,
        'pos': pos
    }

    response = requests.post(url, params=query)
    if response.status_code == 200:
        list_obj = response.json()
        print(f"  ✅ Created list: {list_obj['name']}")
        return list_obj
    else:
        print(f"  ❌ Failed to create list: {response.text}")
        return None

def create_card(list_id, name, desc='', labels=None, due_date=None):
    """Create a card in a list"""
    url = f"{BASE_URL}/cards"
    query = {
        'key': API_KEY,
        'token': TOKEN,
        'idList': list_id,
        'name': name,
        'desc': desc
    }

    if due_date:
        query['due'] = due_date

    response = requests.post(url, params=query)
    if response.status_code == 200:
        card = response.json()
        print(f"    ✅ Created card: {card['name'][:50]}")
        return card
    else:
        print(f"    ❌ Failed to create card: {response.text}")
        return None

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
    if response.status_code == 200:
        label = response.json()
        print(f"  ✅ Created label: {label['name']} ({label['color']})")
        return label
    else:
        print(f"  ❌ Failed to create label: {response.text}")
        return None

def add_checklist_to_card(card_id, name, items):
    """Add checklist to card"""
    # Create checklist
    url = f"{BASE_URL}/checklists"
    query = {
        'key': API_KEY,
        'token': TOKEN,
        'idCard': card_id,
        'name': name
    }

    response = requests.post(url, params=query)
    if response.status_code == 200:
        checklist = response.json()

        # Add items
        for item in items:
            item_url = f"{BASE_URL}/checklists/{checklist['id']}/checkItems"
            item_query = {
                'key': API_KEY,
                'token': TOKEN,
                'name': item
            }
            requests.post(item_url, params=item_query)

        return checklist
    return None

# Sprint tasks based on implemented features
SPRINT_TASKS = {
    "Done": [
        {
            "name": "✅ Database Schema - Hotel & Image Upload",
            "desc": """Completed database schema for hotel upload system:
- Added image_type column to image table
- Created HotelDocument table with RAG tracking
- Created views: v_hotel_documents, v_hotel_images
- Migration file: 07-hotel-document-upload.sql""",
            "labels": ["Backend", "Database"]
        },
        {
            "name": "✅ Python AI Service - Hotel Upload API",
            "desc": """Implemented FastAPI endpoints for hotel uploads:
- POST /api/hotel/{hotel_id}/images/upload - Upload with CLIP embeddings
- POST /api/hotel/{hotel_id}/documents/upload - Upload for RAG indexing
- GET /api/hotel/{hotel_id}/images - List images
- GET /api/hotel/{hotel_id}/documents - List documents
- DELETE endpoints for images & documents
- GET /api/hotel/{hotel_id}/upload-stats - Statistics

Files:
- AI/src/application/controllers/hotel/upload_controller.py
- AI/src/application/dtos/hotel/upload_dto.py""",
            "labels": ["AI", "Backend"]
        },
        {
            "name": "✅ Node.js Backend - Hotel Upload Proxy",
            "desc": """Implemented proxy endpoints in Express:
- Created hotelUploadService.js - Proxy to AI service
- Created hotelUploadController.js - Request handling
- Created hotelUploadRoutes.js - Route definitions
- Integrated with multer for file uploads
- Authentication middleware integration

Endpoints: POST/GET/DELETE /api/v1/hotel/:hotel_id/images|documents/*""",
            "labels": ["Backend"]
        },
        {
            "name": "✅ Frontend - Hotel Upload Components",
            "desc": """Created React components for uploads:
- HotelImageUpload.tsx - Multi-image upload with preview
- HotelDocumentUpload.tsx - Document upload with RAG status
- Image type selection (exterior, interior, facility, food)
- Document type selection (brochure, policy, menu, guide)
- Real-time preview and validation""",
            "labels": ["Frontend"]
        },
        {
            "name": "✅ Frontend API Integration - Upload Services",
            "desc": """Added API methods to aiApi:
- uploadHotelImages()
- uploadHotelDocument()
- listHotelImages()
- listHotelDocuments()
- deleteHotelImage()
- deleteHotelDocument()
- getHotelUploadStats()

Files:
- frontend/lib/api/services.ts
- frontend/lib/api/config.ts""",
            "labels": ["Frontend"]
        },
        {
            "name": "✅ Hotel Registration - 3-Step Flow with Media",
            "desc": """Enhanced hotel registration page:
- Step 1: Hotel Information
- Step 2: Images & Documents (NEW) - Optional upload during registration
- Step 3: Manager Information

Features:
- Upload multiple images with type selection
- Upload documents for RAG
- Preview before submit
- Auto-upload after hotel creation

File: frontend/app/hotel-manager/register/page.tsx""",
            "labels": ["Frontend"]
        },
        {
            "name": "✅ AI Chatbot - RAG + Image Search Integration",
            "desc": """LangGraph agent with multimodal capabilities:
- RAG retrieval from hotel documents
- CLIP-based image search
- Database tools (bookings, hotels, user info)
- Multilingual support (Vietnamese)
- User context awareness

Models:
- LLM: openai/gpt-oss-120b (via NVIDIA API)
- Embeddings: paraphrase-multilingual-MiniLM-L12-v2
- Image: CLIP ViT-B/32""",
            "labels": ["AI"]
        },
        {
            "name": "✅ Frontend - AI Chatbot Component",
            "desc": """Interactive chatbot UI:
- Real-time chat with streaming support
- Image display in responses
- Markdown rendering with syntax highlighting
- Conversation history
- Auto-scroll and user context

File: frontend/components/chatbot/HotelChatbot.tsx""",
            "labels": ["Frontend", "AI"]
        }
    ],
    "In Progress": [
        {
            "name": "🔄 RAG Indexing Background Worker",
            "desc": """Implement background task for document indexing:
- Parse PDF/DOCX files
- Chunk text with LlamaIndex
- Generate embeddings
- Store in PGVector
- Update rag_status in database

Status: TODO marked in upload_controller.py line 354-355""",
            "labels": ["AI", "Backend"]
        },
        {
            "name": "🔄 MinIO File Deletion Integration",
            "desc": """Implement actual file deletion from MinIO:
- Delete from MinIO when deleting image/document
- Handle errors gracefully
- Clean up orphaned files

Status: TODO marked in upload_controller.py line 261""",
            "labels": ["Backend"]
        }
    ],
    "To Do": [
        {
            "name": "📋 Hotel Dashboard - Media Management",
            "desc": """Create dedicated page for managing uploaded media:
- List all uploaded images with filters
- List all uploaded documents
- View upload statistics
- Bulk operations (delete, reorder)
- RAG indexing status monitoring

Route: /hotel-manager/media or /hotel-manager/dashboard (section)""",
            "labels": ["Frontend"]
        },
        {
            "name": "📋 Image Gallery Component",
            "desc": """Create reusable image gallery:
- Grid/list view toggle
- Lightbox for full-size view
- Lazy loading
- Image metadata display
- Filter by type

Usage: Hotel detail pages, dashboard""",
            "labels": ["Frontend"]
        },
        {
            "name": "📋 Document Viewer Component",
            "desc": """Create PDF viewer component:
- Inline PDF preview
- Download option
- RAG chunk visualization
- Document metadata

Libraries: react-pdf or pdf.js""",
            "labels": ["Frontend"]
        },
        {
            "name": "📋 Upload Progress Indicator",
            "desc": """Enhance upload UX:
- Progress bar for each file
- Upload speed indicator
- Concurrent upload support
- Retry failed uploads
- Cancel upload feature""",
            "labels": ["Frontend"]
        },
        {
            "name": "📋 Image Optimization",
            "desc": """Optimize image processing:
- Resize large images on upload
- Generate thumbnails
- WebP conversion
- Progressive loading

Backend: Sharp.js or Pillow
Frontend: Next.js Image optimization""",
            "labels": ["Backend", "Frontend"]
        },
        {
            "name": "📋 RAG Query Analytics",
            "desc": """Track RAG usage:
- Log queries and responses
- Track most queried documents
- Identify knowledge gaps
- Analytics dashboard

Tables: rag_query_log, document_usage_stats""",
            "labels": ["AI", "Backend"]
        },
        {
            "name": "📋 Enhanced CLIP Search",
            "desc": """Improve image search:
- Multi-modal queries (text + image)
- Filter by image attributes
- Relevance feedback
- Search history

API: Hybrid search endpoint""",
            "labels": ["AI"]
        },
        {
            "name": "📋 Unit Tests - Upload System",
            "desc": """Write comprehensive tests:
- Backend upload endpoints
- Python AI service
- Frontend components
- Integration tests

Tools: Jest, Pytest, React Testing Library""",
            "labels": ["Backend", "Frontend", "AI"]
        },
        {
            "name": "📋 API Documentation",
            "desc": """Document all APIs:
- OpenAPI/Swagger for FastAPI
- Postman collection
- API usage examples
- Error codes reference

Tools: FastAPI auto-docs, Swagger UI""",
            "labels": ["Backend"]
        },
        {
            "name": "📋 Attendance System Integration",
            "desc": """Integrate staff attendance:
- Face recognition for clock-in/out
- Attendance logs
- Reports and analytics
- Export to Excel

Status: Partially implemented""",
            "labels": ["AI", "Backend", "Frontend"]
        }
    ],
    "Backlog": [
        {
            "name": "💡 Multi-language Support",
            "desc": """Add internationalization:
- Vietnamese
- English
- Support for other languages

Library: next-i18next or react-intl""",
            "labels": ["Frontend"]
        },
        {
            "name": "💡 Advanced Analytics Dashboard",
            "desc": """Hotel manager analytics:
- Revenue trends
- Booking patterns
- Customer insights
- AI-powered predictions

Charts: Recharts or Chart.js""",
            "labels": ["Frontend", "AI"]
        },
        {
            "name": "💡 Mobile App",
            "desc": """React Native mobile app:
- Guest booking
- Hotel manager dashboard
- Push notifications
- Offline support""",
            "labels": ["Frontend"]
        },
        {
            "name": "💡 Payment Gateway Integration",
            "desc": """Payment processing:
- VNPay
- Momo
- International cards

Webhook handling for payment status""",
            "labels": ["Backend"]
        },
        {
            "name": "💡 Email Notifications",
            "desc": """Automated emails:
- Booking confirmations
- Check-in reminders
- Promotional emails
- Password reset

Service: SendGrid or AWS SES""",
            "labels": ["Backend"]
        }
    ]
}

def main():
    print("🚀 Setting up Trello Sprint Board...\n")

    # Create board
    board_name = f"Hotel Management System - Sprint {sprint_start.strftime('%B %Y')}"
    board_desc = f"""Sprint Duration: {sprint_start.strftime('%Y-%m-%d')} to {sprint_end.strftime('%Y-%m-%d')}
Team: 13 members
- Frontend: 5 members
- Backend: 4 members
- AI: 4 members

Tech Stack:
- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Node.js, Express, PostgreSQL
- AI: Python, FastAPI, LangChain, LlamaIndex, CLIP
- Infrastructure: Docker, MinIO, Redis, RabbitMQ

Repository: https://github.com/LeHoangHuy20225976/Management-of-software-development-project"""

    board = create_board(board_name, board_desc)
    if not board:
        return

    board_id = board['id']

    # Create labels
    print("\n📌 Creating labels...")
    labels = {}
    label_configs = [
        ("Frontend", "green"),
        ("Backend", "blue"),
        ("AI", "purple"),
        ("Database", "orange"),
        ("Bug", "red"),
        ("Enhancement", "yellow"),
        ("Documentation", "sky"),
        ("Testing", "lime")
    ]

    for label_name, color in label_configs:
        label = create_label(board_id, label_name, color)
        if label:
            labels[label_name] = label['id']

    # Create lists
    print("\n📋 Creating lists...")
    lists = {}
    list_names = ["Backlog", "To Do", "In Progress", "In Review", "Done"]

    for list_name in list_names:
        list_obj = create_list(board_id, list_name)
        if list_obj:
            lists[list_name] = list_obj['id']

    # Create cards
    print("\n📝 Creating cards...")
    for list_name, tasks in SPRINT_TASKS.items():
        if list_name not in lists:
            continue

        list_id = lists[list_name]
        print(f"\n  Creating cards for '{list_name}':")

        for task in tasks:
            card = create_card(
                list_id,
                task['name'],
                task['desc'],
                due_date=sprint_end.isoformat() if list_name == "To Do" else None
            )

            # Add labels to card
            if card and 'labels' in task:
                for label_name in task['labels']:
                    if label_name in labels:
                        label_id = labels[label_name]
                        url = f"{BASE_URL}/cards/{card['id']}/idLabels"
                        query = {
                            'key': API_KEY,
                            'token': TOKEN,
                            'value': label_id
                        }
                        requests.post(url, params=query)

    # Print summary
    print("\n" + "="*60)
    print("✅ Sprint Board Created Successfully!")
    print("="*60)
    print(f"Board URL: {board['url']}")
    print(f"\nSprint: {sprint_start.strftime('%Y-%m-%d')} to {sprint_end.strftime('%Y-%m-%d')}")
    print(f"Duration: 30 days")
    print(f"\nTeam Members ({len(TEAM_MEMBERS)}):")
    for member in TEAM_MEMBERS:
        print(f"  - {member['name']} ({member['role']})")

    print(f"\nTasks Created:")
    for list_name, tasks in SPRINT_TASKS.items():
        print(f"  {list_name}: {len(tasks)} tasks")

    print("\n📌 Next Steps:")
    print("1. Share board with team members via email")
    print("2. Assign tasks to specific members")
    print("3. Set up automation rules (Butler)")
    print("4. Schedule daily standups")
    print("5. Create sprint review meeting")

    print("\n🔗 Board URL: " + board['url'])

if __name__ == "__main__":
    main()
