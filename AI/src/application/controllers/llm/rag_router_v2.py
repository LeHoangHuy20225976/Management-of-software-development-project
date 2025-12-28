"""
RAG Router - Upload PDF và Search với PGVector
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from src.application.dtos.llm.rag_upload_dto import (
    RAGUploadResponse,
    RAGSearchRequest, 
    RAGSearchResponse,
    RAGSearchResult
)
from src.infrastructure.config import get_settings
from typing import Optional
import asyncio

router = APIRouter()
settings = get_settings()


@router.post('/upload', response_model=RAGUploadResponse)
async def upload_and_index_pdf(
    file: UploadFile = File(..., description="PDF file to upload and index"),
    table_name: Optional[str] = "rag_embeddings"
):
    """
    Upload PDF file và index vào PGVector
    
    Flow:
    1. Nhận file PDF upload
    2. Gọi Prefect flow để:
       - Save file tạm
       - Load PDF
       - Chunk documents
       - Create embeddings
       - Index vào PGVector
    3. Trả về kết quả
    
    Args:
        file: PDF file upload
        table_name: Tên table trong PGVector (default: rag_embeddings)
        
    Returns:
        RAGUploadResponse: Kết quả upload và indexing
    """
    
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )
    
    try:
        print(f"[RAG Upload] Receiving file: {file.filename}")
        
        # Read file content
        file_content = await file.read()
        
        if len(file_content) == 0:
            raise HTTPException(
                status_code=400,
                detail="Empty file"
            )
        
        print(f"[RAG Upload] File size: {len(file_content)} bytes")
        
        # Call Prefect flow
        from src.flow.rag_flow import run_rag_indexing
        
        print(f"[RAG Upload] Starting Prefect flow...")
        
        # Run flow trong thread pool để không block
        result = await asyncio.to_thread(
            run_rag_indexing,
            file_content=file_content,
            filename=file.filename,
            connection_string=settings.postgres_chat_url
        )
        
        print(f"[RAG Upload] ✅ Flow completed: {result}")
        
        return RAGUploadResponse(
            status="success",
            message=f"File '{file.filename}' indexed successfully",
            filename=file.filename,
            total_chunks=result['total_chunks'],
            table_name=result['table_name']
        )
        
    except Exception as e:
        print(f"[RAG Upload] ❌ Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error processing file: {str(e)}"
        )


@router.post('/search', response_model=RAGSearchResponse)
async def search_documents(request: RAGSearchRequest):
    """
    Search trong PGVector để tìm relevant documents
    
    Args:
        request: RAGSearchRequest với query, top_k, table_name
        
    Returns:
        RAGSearchResponse: Danh sách documents relevant
    """
    
    try:
        print(f"[RAG Search] Query: {request.query}")
        print(f"[RAG Search] Top K: {request.top_k}")
        print(f"[RAG Search] Table: {request.table_name}")
        
        from src.application.services.llm.rag import RAGIndexer
        
        # Initialize indexer
        indexer = RAGIndexer(
            connection_string=settings.postgres_chat_url,
            table_name=request.table_name,
            embed_dim=384
        )
        
        # Load index
        print(f"[RAG Search] Loading index from PGVector...")
        indexer.load_index()
        
        # Get query engine
        query_engine = indexer.get_query_engine(
            similarity_top_k=request.top_k,
            response_mode="compact"
        )
        
        # Search (không dùng LLM, chỉ retrieve)
        print(f"[RAG Search] Searching...")
        response = query_engine.query(request.query)
        
        # Format results
        results = []
        if hasattr(response, 'source_nodes'):
            for node in response.source_nodes:
                results.append(RAGSearchResult(
                    text=node.text,
                    score=node.score if hasattr(node, 'score') else 0.0,
                    metadata=node.metadata if hasattr(node, 'metadata') else {}
                ))
        
        print(f"[RAG Search] ✅ Found {len(results)} results")
        
        return RAGSearchResponse(
            query=request.query,
            results=results,
            total_results=len(results)
        )
        
    except Exception as e:
        print(f"[RAG Search] ❌ Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error searching: {str(e)}"
        )


@router.get('/tables')
async def list_tables():
    """
    List tất cả RAG tables trong PostgreSQL
    """
    try:
        from sqlalchemy import create_engine, text
        
        engine = create_engine(settings.postgres_chat_url)
        
        with engine.connect() as conn:
            # Query để list tables có prefix 'rag_'
            result = conn.execute(text(
                """
                SELECT tablename 
                FROM pg_tables 
                WHERE schemaname = 'public' 
                AND tablename LIKE 'rag_%'
                ORDER BY tablename;
                """
            ))
            
            tables = [row[0] for row in result]
        
        return {
            "tables": tables,
            "total": len(tables)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error listing tables: {str(e)}"
        )


@router.get('/health')
async def rag_health():
    """Health check for RAG service"""
    try:
        # Check PostgreSQL connection
        from sqlalchemy import create_engine, text
        engine = create_engine(settings.postgres_chat_url)
        
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        return {
            'status': 'healthy',
            'service': 'rag',
            'vector_store': 'pgvector',
            'database': 'connected'
        }
    except Exception as e:
        return {
            'status': 'unhealthy',
            'service': 'rag',
            'error': str(e)
        }
