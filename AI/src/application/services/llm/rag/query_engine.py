"""
Query Engine for RAG System
"""
from llama_index.core import PromptTemplate
from typing import Optional
from pathlib import Path

# Load system prompt từ file
def load_system_prompt() -> str:
    """Load system prompt từ file system_prompt.txt"""
    prompt_file = Path(__file__).parent.parent / "system_prompt.txt"
    if prompt_file.exists():
        return prompt_file.read_text(encoding='utf-8')
    return "You are a helpful hotel AI assistant."

SYSTEM_PROMPT = load_system_prompt()

# RAG prompt template với system prompt
RAG_QA_TEMPLATE = f"""
{SYSTEM_PROMPT}

THÔNG TIN TỪ TÀI LIỆU:
{{context_str}}

CÂU HỎI:
{{query_str}}

HƯỚNG DẪN TRẢ LỜI:
- Sử dụng thông tin từ tài liệu ở trên để trả lời
- Nếu không tìm thấy thông tin trong tài liệu, hãy nói rõ "Hiện tại tôi chưa có thông tin chính xác về vấn đề này"
- Trả lời ngắn gọn, chính xác và lịch sự

TRẢ LỜI:
"""


class PDFQueryEngine:
    """Query engine wrapper với custom prompts"""
    
    def __init__(self, indexer):
        """
        Args:
            indexer: RAGIndexer instance đã load/create index
        """
        self.indexer = indexer
        self.query_engine = None
        
    def setup(self, similarity_top_k: int = 5, custom_prompt: Optional[str] = None):
        """
        Setup query engine với custom settings
        
        Args:
            similarity_top_k: Số chunks để retrieve
            custom_prompt: Custom prompt template (optional)
        """
        self.query_engine = self.indexer.get_query_engine(
            similarity_top_k=similarity_top_k,
            response_mode="compact"
        )
        
        # Sử dụng RAG prompt template với system prompt
        prompt_to_use = custom_prompt if custom_prompt else RAG_QA_TEMPLATE
        qa_prompt = PromptTemplate(prompt_to_use)
        self.query_engine.update_prompts(
            {"response_synthesizer:text_qa_template": qa_prompt}
        )
    
    def query(self, question: str) -> str:
        """
        Query PDF documents
        
        Args:
            question: Câu hỏi từ user
            
        Returns:
            str: Câu trả lời
        """
        if self.query_engine is None:
            self.setup()
        
        response = self.query_engine.query(question)
        return str(response)
    
    def query_with_sources(self, question: str) -> dict:
        """
        Query và trả về cả source documents
        
        Args:
            question: Câu hỏi từ user
            
        Returns:
            dict: {"answer": str, "sources": list}
        """
        if self.query_engine is None:
            self.setup()
        
        response = self.query_engine.query(question)
        
        # Lấy source nodes
        sources = []
        if hasattr(response, 'source_nodes'):
            for node in response.source_nodes:
                sources.append({
                    "text": node.text[:200] + "...",  # Preview
                    "score": node.score,
                    "metadata": node.metadata
                })
        
        return {
            "answer": str(response),
            "sources": sources
        }
