"""
Test System Prompt - Kiểm tra xem system prompt có hoạt động không
"""
import requests
import json

BASE_URL = "http://localhost:8003"

def test_chat_with_system_prompt():
    """Test chat với system prompt mới"""
    print("="*80)
    print("🧪 TEST SYSTEM PROMPT")
    print("="*80 + "\n")
    
    test_cases = [
        {
            "name": "Câu hỏi về khách sạn (có trong context)",
            "message": "Khách sạn có dịch vụ đưa đón sân bay không?"
        },
        {
            "name": "Câu hỏi ngoài phạm vi (không liên quan)",
            "message": "Giá vàng hôm nay bao nhiêu?"
        },
        {
            "name": "Câu hỏi thiếu thông tin",
            "message": "Tôi muốn đặt phòng"
        },
        {
            "name": "Test tiếng Việt",
            "message": "Cho tôi biết về phòng deluxe"
        }
    ]
    
    for i, test in enumerate(test_cases, 1):
        print(f"\n{'='*80}")
        print(f"Test {i}: {test['name']}")
        print(f"{'='*80}")
        print(f"📤 Question: {test['message']}")
        
        try:
            response = requests.post(
                f"{BASE_URL}/api/llm/chat",
                json={"message": test['message']},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                answer = data.get('response', 'N/A')
                print(f"\n✅ Response:")
                print(f"{answer}")
            else:
                print(f"\n❌ Error: {response.status_code}")
                print(f"Details: {response.text}")
                
        except Exception as e:
            print(f"\n❌ Exception: {e}")
        
        print("\n" + "-"*80)
    
    print("\n" + "="*80)
    print("✅ Test completed!")
    print("="*80)

if __name__ == "__main__":
    test_chat_with_system_prompt()
