"""
Test Tool Calling - AI Query Database
Test xem AI có thể tự động gọi database functions không
"""
import requests
import time

BASE_URL = "http://localhost:8003"

def test_tool_calling():
    """Test AI với database tool calling"""
    
    print("="*80)
    print("🔧 TEST AI WITH DATABASE TOOLS")
    print("="*80 + "\n")
    
    # Test queries that should trigger tool calls
    test_cases = [
        {
            "name": "Get User Info",
            "query": "Cho tôi thông tin của user có ID là 1",
            "expected_tool": "get_user_info"
        },
        {
            "name": "Search User by Email",
            "query": "Tìm user có email john@example.com",
            "expected_tool": "search_user_by_email"
        },
        {
            "name": "Get Hotel Info",
            "query": "Thông tin chi tiết của khách sạn ID 1",
            "expected_tool": "get_hotel_info"
        },
        {
            "name": "Search Hotels",
            "query": "Có khách sạn nào ở Quận 1 không?",
            "expected_tool": "search_hotels"
        },
        {
            "name": "Get User Bookings",
            "query": "User 5 có những booking nào?",
            "expected_tool": "get_user_bookings"
        },
        {
            "name": "Search Available Rooms",
            "query": "Tìm phòng available ở khách sạn ID 1 từ ngày 2024-01-01 đến 2024-01-05",
            "expected_tool": "search_available_rooms"
        },
        {
            "name": "Get Hotel Statistics",
            "query": "Thống kê của khách sạn ID 1",
            "expected_tool": "get_hotel_statistics"
        },
        {
            "name": "Complex Query",
            "query": "User ID 3 có booking nào đang pending không? Nếu có thì cho tôi thông tin chi tiết",
            "expected_tool": "get_user_bookings"
        }
    ]
    
    results = []
    
    for i, test in enumerate(test_cases, 1):
        print(f"\n[{i}/{len(test_cases)}] 🧪 {test['name']}")
        print(f"{'='*80}")
        print(f"📝 Query: {test['query']}")
        print(f"🔧 Expected Tool: {test['expected_tool']}")
        print("-" * 80)
        
        try:
            start = time.time()
            response = requests.post(
                f"{BASE_URL}/api/llm/chat_with_tools",
                json={"message": test['query']},
                timeout=60
            )
            elapsed = time.time() - start
            
            if response.status_code == 200:
                data = response.json()
                answer = data.get('response', 'N/A')
                
                print(f"✅ Response ({elapsed:.2f}s):\n")
                print(answer)
                print()
                
                results.append({
                    "test": test['name'],
                    "status": "✅ PASS",
                    "time": f"{elapsed:.2f}s"
                })
            else:
                print(f"❌ Error: {response.status_code}")
                print(f"Details: {response.text}\n")
                results.append({
                    "test": test['name'],
                    "status": "❌ FAIL",
                    "time": "N/A"
                })
                
        except Exception as e:
            print(f"❌ Exception: {e}\n")
            results.append({
                "test": test['name'],
                "status": "❌ ERROR",
                "time": "N/A"
            })
        
        time.sleep(1)  # Avoid rate limiting
    
    # Summary
    print("\n" + "="*80)
    print("📊 TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for r in results if r['status'] == '✅ PASS')
    print(f"\nResults: {passed}/{len(results)} tests passed ({passed/len(results)*100:.1f}%)\n")
    
    for result in results:
        print(f"{result['status']} {result['test']} - {result['time']}")
    
    print("\n" + "="*80)

def list_available_tools():
    """List all tools available to AI"""
    
    print("\n" + "="*80)
    print("🔧 AVAILABLE TOOLS")
    print("="*80 + "\n")
    
    try:
        response = requests.get(f"{BASE_URL}/api/llm/tools")
        
        if response.status_code == 200:
            data = response.json()
            tools = data.get('tools', [])
            
            print(f"Total tools: {data.get('total_tools', 0)}\n")
            
            for i, tool in enumerate(tools, 1):
                print(f"{i}. {tool['name']}")
                print(f"   Description: {tool['description']}")
                print()
        else:
            print(f"❌ Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    print("\n🚀 AI Database Tool Calling Test\n")
    
    # List available tools first
    list_available_tools()
    
    # Run tests
    test_tool_calling()
    
    print("\n✅ Test completed!")
    print("\n💡 Tips:")
    print("   - AI có thể tự động gọi database functions khi cần")
    print("   - Không cần hardcode queries, AI sẽ tự động chọn tool phù hợp")
    print("   - Có thể kết hợp nhiều tool calls trong một query")
