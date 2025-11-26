"""
LLM API Client (NVIDIA API với OpenAI SDK)
Kết nối với NVIDIA API sử dụng OpenAI client
"""
from openai import OpenAI
from src.infrastructure.config import get_settings

settings = get_settings()

class GPTClient:
    """Client để tương tác với LLM API (NVIDIA)"""
    
    def __init__(self):
        """Khởi tạo LLM client"""
        # Khởi tạo OpenAI client với NVIDIA base URL
        self.client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=settings.nvidia_api_key
        )
        # Model name
        self.model_name = settings.llm_model
    
    def generate(self, prompt: str) -> str:
        """
        Generate text từ prompt
        
        Args:
            prompt: Câu hỏi hoặc prompt
            
        Returns:
            str: Response từ LLM
        """
        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=1024
            )
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"LLM API error: {str(e)}")
    
    def chat(self, message: str, history: list = None) -> str:
        """
        Chat với LLM (có history)
        
        Args:
            message: Tin nhắn hiện tại
            history: Lịch sử chat - list of {"role": "user/assistant", "content": "..."}
            
        Returns:
            str: Response từ LLM
        """
        try:
            # Tạo messages từ history
            messages = history.copy() if history else []
            messages.append({"role": "user", "content": message})
            
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                temperature=0.7,
                max_tokens=1024
            )
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"LLM chat error: {str(e)}")


# Singleton instance
_gpt_client = None

def get_gpt_client() -> GPTClient:
    """Lấy LLM client instance (singleton)"""
    global _gpt_client
    if _gpt_client is None:
        _gpt_client = GPTClient()
    return _gpt_client