"""
Test LLM Chat Client
File test để thử nghiệm chat với LLM
"""
from src.application.services.llm.gpt_client import get_gpt_client


def test_simple_chat():
    """Test chat đơn giản"""
    print("=== Test Simple Chat ===")
    client = get_gpt_client()
    
    # Test 1: Generate
    print("\n1. Test generate:")
    response = client.generate("Xin chào, bạn là ai?")
    print(f"Response: {response}\n")
    
    # Test 2: Chat without history
    print("2. Test chat (no history):")
    response = client.chat("Tell me a joke")
    print(f"Response: {response}\n")
    
    # Test 3: Chat with history
    print("3. Test chat (with history):")
    history = [
        {"role": "user", "content": "My name is John"},
        {"role": "assistant", "content": "Nice to meet you, John! How can I help you today?"}
    ]
    response = client.chat("What's my name?", history=history)
    print(f"Response: {response}\n")


if __name__ == "__main__":
    test_simple_chat()
    print("✅ All tests completed!")
