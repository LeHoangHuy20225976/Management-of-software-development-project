"""
Simple script to upload TXT file to RAG system via API
"""
import requests
from pathlib import Path

def upload_txt_to_rag(txt_file_path: str, api_url: str = "http://localhost:8003"):
    """
    Upload TXT file to RAG system qua API
    
    Args:
        txt_file_path: Đường dẫn file TXT
        api_url: URL của LLM service API
    """
    print("="*80)
    print("🚀 UPLOAD TXT FILE TO RAG SYSTEM")
    print("="*80 + "\n")
    
    # 1. Đọc file
    print(f"📖 Step 1: Reading file...")
    txt_path = Path(txt_file_path)
    if not txt_path.exists():
        raise FileNotFoundError(f"File not found: {txt_file_path}")
    
    content = txt_path.read_text(encoding='utf-8')
    print(f"✅ Loaded: {txt_path.name} ({len(content)} characters)\n")
    
    # 2. Chia thành chunks (đơn giản)
    print(f"✂️  Step 2: Chunking content...")
    chunk_size = 500  # characters
    chunks = []
    for i in range(0, len(content), chunk_size):
        chunk = content[i:i+chunk_size]
        if chunk.strip():
            chunks.append(chunk)
    print(f"✅ Created {len(chunks)} chunks\n")
    
    # 3. Test với RAG chat (nếu đã có documents indexed)
    print(f"🧪 Step 3: Testing RAG chat...")
    test_queries = [
        "Giờ check-in của khách sạn là mấy giờ?",
        "Cho tôi biết về phòng Deluxe",
        "Khách sạn có những dịch vụ gì?"
    ]
    
    for query in test_queries:
        print(f"\n   Query: {query}")
        try:
            response = requests.post(
                f"{api_url}/api/llm/chat",
                json={"message": query},
                timeout=30
            )
            if response.status_code == 200:
                data = response.json()
                answer = data.get('response', 'N/A')
                print(f"   ✅ Answer: {answer[:150]}...")
            else:
                print(f"   ❌ Error: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Exception: {e}")
    
    print("\n" + "="*80)
    print("📊 SUMMARY")
    print("="*80)
    print(f"File: {txt_path.name}")
    print(f"Chunks: {len(chunks)}")
    print(f"\n⚠️  NOTE:")
    print(f"   - File content đã được chunked thành {len(chunks)} chunks")
    print(f"   - Để index vào RAG, cần sử dụng Prefect flow hoặc Docker container")
    print(f"   - Hiện tại test với documents đã có sẵn trong RAG system")
    print(f"\n💡 NEXT STEPS:")
    print(f"   1. Chạy Prefect flow để index: python src/flow/load_txt_rag_flow.py")
    print(f"   2. Hoặc exec vào container: docker exec -it hotel-llm-service python /app/load_txt_to_rag.py")
    
    # Hiển thị sample chunks
    print(f"\n📄 Sample chunks:")
    for i, chunk in enumerate(chunks[:3], 1):
        print(f"\n   Chunk {i}:")
        print(f"   {chunk[:100]}...")

if __name__ == "__main__":
    txt_file = r"d:\Management_Software\Management-of-software-development-project\AI\rag_demo\test.txt"
    upload_txt_to_rag(txt_file)
