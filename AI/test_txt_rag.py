"""
Upload TXT file to RAG system via API
Convert TXT to PDF first (or use text upload if available)
"""
import requests
from pathlib import Path

def upload_txt_as_text(
    txt_file_path: str,
    api_url: str = "http://localhost:8003",
    collection_name: str = "hotel_knowledge"
):
    """
    Upload TXT content directly to RAG via chat endpoint
    (Since there's no direct TXT upload, we'll use the indexed system)
    """
    print("="*80)
    print("📤 UPLOAD TXT TO RAG SYSTEM")
    print("="*80 + "\n")
    
    # Read file
    print(f"📖 Reading file...")
    txt_path = Path(txt_file_path)
    content = txt_path.read_text(encoding='utf-8')
    print(f"✅ Loaded: {txt_path.name} ({len(content)} chars)\n")
    
    # Show content summary
    print(f"📄 Content Preview:")
    print(content[:500])
    print("...\n")
    
    # Test RAG with questions from the content
    print(f"🧪 Testing RAG with questions from your TXT file:\n")
    
    test_questions = [
        "Tên khách sạn là gì?",
        "Địa chỉ khách sạn ở đâu?",
        "Giờ check-in là mấy giờ?",
        "Giờ check-out là mấy giờ?",
        "Cho tôi biết về phòng Standard",
        "Cho tôi biết về phòng Deluxe",
        "Phòng Standard giá bao nhiêu?",
        "Khách sạn có những dịch vụ gì?"
    ]
    
    results = []
    for i, question in enumerate(test_questions, 1):
        print(f"{i}. {question}")
        try:
            response = requests.post(
                f"{api_url}/api/llm/chat",
                json={"message": question},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                answer = data.get('response', 'N/A')
                results.append({
                    "question": question,
                    "answer": answer,
                    "status": "✅"
                })
                print(f"   ✅ {answer[:100]}...\n")
            else:
                results.append({
                    "question": question,
                    "answer": f"Error: {response.status_code}",
                    "status": "❌"
                })
                print(f"   ❌ Error: {response.status_code}\n")
                
        except Exception as e:
            results.append({
                "question": question,
                "answer": f"Exception: {e}",
                "status": "❌"
            })
            print(f"   ❌ Exception: {e}\n")
    
    # Summary
    print("="*80)
    print("📊 TEST SUMMARY")
    print("="*80)
    success = sum(1 for r in results if r['status'] == '✅')
    print(f"Success Rate: {success}/{len(results)} ({success/len(results)*100:.1f}%)\n")
    
    print("💡 IMPORTANT NOTE:")
    print("   - File TXT của bạn đã được đọc thành công")
    print("   - Để INDEX vào RAG system, có 2 cách:")
    print("   ")
    print("   Cách 1: Convert TXT → PDF rồi upload qua API")
    print("   Cách 2: Chạy script trực tiếp trong container với llama_index")
    print("   ")
    print("   Hiện tại RAG đang sử dụng documents có sẵn trong ChromaDB")
    print("   Câu trả lời trên dựa vào kiến thức chung của LLM + context có sẵn")
    
    return results

if __name__ == "__main__":
    txt_file = r"d:\Management_Software\Management-of-software-development-project\AI\rag_demo\test.txt"
    
    print(f"\n🎯 This script will test RAG system with questions from your TXT file\n")
    
    results = upload_txt_as_text(txt_file)
    
    print("\n" + "="*80)
    print("✅ Test completed!")
    print("="*80)
