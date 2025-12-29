"""
Populate RAG with hotel knowledge from database
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src.infrastructure.config import get_settings
import psycopg2
from llama_index.core import Document
from src.application.services.llm.rag import RAGIndexer

settings = get_settings()

def get_db_connection():
    """Get PostgreSQL connection"""
    host = 'localhost' if settings.postgres_host == 'postgres' else settings.postgres_host
    port = 5433 if settings.postgres_host == 'postgres' else settings.postgres_port

    return psycopg2.connect(
        host=host,
        port=port,
        dbname=settings.postgres_db,
        user=settings.postgres_user,
        password=settings.postgres_password
    )

def fetch_hotel_data():
    """Fetch hotel data from database"""
    conn = get_db_connection()
    cur = conn.cursor()

    # Get hotel details with facilities
    cur.execute("""
        SELECT
            h.hotel_id,
            h.name,
            h.address,
            h.rating,
            h.description,
            h.contact_phone,
            STRING_AGG(DISTINCT hf.name, ', ') as facilities
        FROM Hotel h
        LEFT JOIN FacilitiesPossessing fp ON h.hotel_id = fp.hotel_id
        LEFT JOIN HotelFacilities hf ON fp.facility_id = hf.facility_id
        GROUP BY h.hotel_id, h.name, h.address, h.rating, h.description, h.contact_phone
        ORDER BY h.hotel_id
    """)

    hotels = cur.fetchall()
    cur.close()
    conn.close()

    return hotels

def create_hotel_documents(hotels):
    """Create LlamaIndex documents from hotel data"""
    documents = []

    # Enhanced descriptions for specific hotels
    enhanced_info = {
        2: """
Tiện nghi nổi bật:
- Hồ bơi vô cực hướng biển (Infinity pool with ocean view) - hồ bơi view biển tuyệt đẹp
- Private beach access - bãi biển riêng
- Free Wi-Fi tốc độ cao
- Beach bar phục vụ cocktail
- Spa và massage view biển

Dịch vụ đặc biệt:
- Water sports: lướt ván, kayaking
- Beach volleyball
- Diving tours và island hopping
""",
        1: """
Tiện nghi nổi bật:
- Hồ bơi trên sân thượng với view toàn cảnh thành phố Hà Nội
- Nhà hàng cao cấp phục vụ ẩm thực Việt Nam và quốc tế
- Spa với các liệu trình massage cao cấp
- Phòng gym hiện đại

Dịch vụ đặc biệt:
- Business center
- Meeting rooms
"""
    }

    for hotel in hotels:
        hotel_id, name, address, rating, description, phone, facilities = hotel

        # Get enhanced info if available
        extra_info = enhanced_info.get(hotel_id, f"""
Tiện nghi:
{facilities if facilities else 'Đang cập nhật'}
""")

        # Create detailed text for each hotel
        text = f"""
Khách sạn: {name}

Thông tin cơ bản:
- ID: {hotel_id}
- Tên: {name}
- Địa chỉ: {address}
- Điện thoại: {phone}
- Rating: {rating}/5 sao
- Mô tả: {description}

{extra_info}

Chính sách:
- Giờ check-in: 14:00
- Giờ check-out: 12:00
- Hủy phòng miễn phí trước 24-48 giờ check-in
- Trẻ em dưới 6 tuổi ở chung giường miễn phí

Dịch vụ cơ bản:
- Room service 24/7
- Dịch vụ giặt là
- Concierge
- Đưa đón sân bay (phí: 250,000 - 300,000 VND)

Thanh toán:
- Chấp nhận: Tiền mặt, thẻ tín dụng, chuyển khoản
- Đặt cọc: 30% tổng giá trị

Liên hệ đặt phòng: {phone}
        """

        doc = Document(
            text=text.strip(),
            metadata={
                "hotel_id": hotel_id,
                "hotel_name": name,
                "address": address,
                "rating": float(rating) if rating else 0.0,
                "source": "database",
                "type": "hotel_info"
            }
        )

        documents.append(doc)
        print(f"✅ Created document for: {name}")

    return documents

def index_to_rag(documents):
    """Index documents to RAG system"""
    print(f"\n📊 Indexing {len(documents)} documents to RAG...")

    # Override connection string for localhost
    conn_str = f"postgresql://{settings.postgres_user}:{settings.postgres_password}@localhost:5433/{settings.postgres_db}"

    # Initialize RAG indexer
    indexer = RAGIndexer(
        connection_string=conn_str,
        table_name="rag_embeddings",
        embed_dim=384  # all-MiniLM-L6-v2 dimension
    )

    # Create and store index
    indexer.create_index(documents)

    print("✅ Documents indexed successfully!")
    return indexer

def main():
    print("🏨 Populating RAG with hotel knowledge...\n")

    # 1. Fetch hotel data
    print("1️⃣ Fetching hotel data from database...")
    hotels = fetch_hotel_data()
    print(f"   Found {len(hotels)} hotels\n")

    # 2. Create documents
    print("2️⃣ Creating documents...")
    documents = create_hotel_documents(hotels)
    print(f"   Created {len(documents)} documents\n")

    # 3. Index to RAG
    print("3️⃣ Indexing to RAG (PGVector)...")
    indexer = index_to_rag(documents)

    # 4. Test query
    print("\n4️⃣ Testing RAG query...")
    query_engine = indexer.get_query_engine(similarity_top_k=3)
    response = query_engine.query("Cho tôi biết về khách sạn ở Hà Nội")
    print(f"\n📝 Test query response:\n{response}\n")

    print("="*80)
    print("🎉 RAG population completed!")
    print("="*80)

if __name__ == '__main__':
    main()
