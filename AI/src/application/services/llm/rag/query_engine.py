"""
Query Engine for RAG System
"""
from llama_index.core import PromptTemplate
from typing import Optional


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
        
        # Custom prompt nếu cần
        if custom_prompt:
            qa_prompt = PromptTemplate(custom_prompt)
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
