"""
RAG (Retrieval-Augmented Generation) API Router
Query PDF documents để trả lời câu hỏi
"""

from fastapi import APIRouter, HTTPException
from src.application.dtos.llm.rag_dto import RAGChatRequest, RAGChatResponse, RAGSource
import uuid
from pathlib import Path

router = APIRouter()

# Global RAG components (lazy load)
_rag_indexer = None
_rag_query_engine = None
_rag_initialized = False


def initialize_rag():
    """
    Initialize RAG components (lazy load)
    Chỉ load khi cần thiết để tiết kiệm memory
    """
    global _rag_indexer, _rag_query_engine, _rag_initialized
    
    if _rag_initialized:
        return
    
    try:
        from src.application.services.llm.rag import RAGIndexer, PDFQueryEngine
        from src.application.services.llm.rag.pdf_loader import PDFLoader
        import os


        # Get project root
        project_root = Path(__file__).parent.parent.parent.parent.parent
        pdf_folder = project_root / "folder_pdf"
        chroma_dir = project_root / "chroma_db"
        
        print(f"[RAG] Initializing RAG system...")
        print(f"[RAG] PDF folder: {pdf_folder}")
        print(f"[RAG] ChromaDB dir: {chroma_dir}")
        
        # Check if index exists
        if not chroma_dir.exists() or not any(chroma_dir.iterdir()):
            print(f"[RAG] ChromaDB not found. Creating index from PDFs...")
            
            # Check PDF folder
            if not pdf_folder.exists():
                raise FileNotFoundError(f"PDF folder not found: {pdf_folder}")
            
            # Load and index PDFs
            loader = PDFLoader(pdf_directory=str(pdf_folder))
            print(f"[RAG] Loading PDF documents...")
            documents = loader.load_documents()
            print(f"[RAG] Loaded {len(documents)} documents")
            
            print(f"[RAG] Chunking documents...")
            nodes = loader.chunk_documents(documents)
            print(f"[RAG] Created {len(nodes)} nodes")
            
            # Create index
            print(f"[RAG] Creating vector index (this may take a while)...")
            _rag_indexer = RAGIndexer(
                persist_dir=str(chroma_dir),
                collection_name="android_pdf_docs"
            )
            _rag_indexer.create_index(nodes)
            print(f"[RAG] Index created successfully!")
        else:
            # Load existing index
            print(f"[RAG] Loading existing index from ChromaDB...")
            _rag_indexer = RAGIndexer(
                persist_dir=str(chroma_dir),
                collection_name="android_pdf_docs"
            )
            _rag_indexer.load_index()
            print(f"[RAG] Index loaded successfully!")
        
        # Create query engine
        _rag_query_engine = PDFQueryEngine(_rag_indexer)
        
        _rag_initialized = True
        print(f"[RAG] ✅ RAG system initialized successfully!")
        
    except Exception as e:
        print(f"[RAG] ❌ Failed to initialize RAG: {e}")
        import traceback
        traceback.print_exc()
        raise


@router.get('/health')
async def rag_health():
    """Health check for RAG service"""
    return {
        'status': 'ok',
        'service': 'rag',
        'initialized': _rag_initialized
    }


@router.post('/chat_rag', response_model=RAGChatResponse)
async def chat_rag(request: RAGChatRequest):
    """
    Chat với AI sử dụng RAG (PDF documents làm context)
    
    - **message**: Câu hỏi từ user
    - **conversation_id**: ID của conversation (tự tạo nếu không có)
    - **top_k**: Số lượng chunks relevant để retrieve (default: 3)
    
    System sẽ:
    1. Search trong PDF documents để tìm thông tin liên quan
    2. Sử dụng context từ PDFs để trả lời câu hỏi
    3. Trả về answer kèm sources
    """
    
    try:
        # Initialize RAG if not already done
        if not _rag_initialized:
            initialize_rag()
        
        conversation_id = request.conversation_id or f"rag-{uuid.uuid4()}"
        
        # Setup query engine với top_k
        _rag_query_engine.setup(similarity_top_k=request.top_k or 3)
        
        # Query RAG system
        print(f"[RAG API] Query: {request.message}")
        result = _rag_query_engine.query_with_sources(request.message)
        
        # Format sources
        sources = []
        for src in result.get("sources", []):
            sources.append(RAGSource(
                text=src.get("text", "")[:200] + "...",  # Preview
                score=src.get("score", 0.0),
                file_name=src.get("metadata", {}).get("file_name"),
                page=src.get("metadata", {}).get("page_label")
            ))
        
        print(f"[RAG API] Answer generated with {len(sources)} sources")
        
        return RAGChatResponse(
            response=result["answer"],
            conversation_id=conversation_id,
            sources=sources
        )
        
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=404,
            detail=f"PDF folder or ChromaDB not found: {str(e)}"
        )
    except Exception as e:
        print(f"[RAG API] Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"RAG error: {str(e)}"
        )


@router.get('/rag/stats')
async def rag_stats():
    """
    Lấy thống kê về RAG system
    """
    try:
        if not _rag_initialized:
            return {
                "initialized": False,
                "message": "RAG system chưa được khởi tạo"
            }
        
        count = _rag_indexer.get_collection_count()
        
        return {
            "initialized": True,
            "total_chunks": count,
            "collection_name": "android_pdf_docs",
            "embedding_model": "sentence-transformers/all-MiniLM-L6-v2"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting RAG stats: {str(e)}"
        )
