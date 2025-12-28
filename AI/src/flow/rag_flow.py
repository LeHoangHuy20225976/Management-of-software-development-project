"""
Prefect Flow để xử lý RAG: Upload, Chunk, và Index PDF files
"""
from prefect import flow, task
from pathlib import Path
import tempfile
import shutil
from typing import List
import os


@task(name="save_uploaded_file", retries=2)
def save_uploaded_file(file_content: bytes, filename: str, upload_dir: str) -> str:
    """
    Lưu file upload vào thư mục tạm
    
    Args:
        file_content: Nội dung file (bytes)
        filename: Tên file
        upload_dir: Thư mục lưu file
        
    Returns:
        str: Đường dẫn file đã lưu
    """
    # Tạo thư mục nếu chưa có
    Path(upload_dir).mkdir(parents=True, exist_ok=True)
    
    # Lưu file
    file_path = Path(upload_dir) / filename
    with open(file_path, 'wb') as f:
        f.write(file_content)
    
    print(f"✅ Saved file: {file_path} ({len(file_content)} bytes)")
    return str(file_path)


@task(name="load_pdf_document", retries=2)
def load_pdf_document(file_path: str):
    """
    Load PDF document bằng LlamaIndex
    
    Args:
        file_path: Đường dẫn đến PDF file
        
    Returns:
        Document: LlamaIndex document object
    """
    from llama_index.core import SimpleDirectoryReader
    
    print(f"📄 Loading PDF: {file_path}")
    
    # Load single file
    reader = SimpleDirectoryReader(
        input_files=[file_path],
        required_exts=[".pdf"]
    )
    documents = reader.load_data()
    
    print(f"✅ Loaded {len(documents)} document(s)")
    return documents


@task(name="chunk_documents", retries=2)
def chunk_documents(documents, chunk_size: int = 1024, chunk_overlap: int = 200):
    """
    Chia documents thành chunks nhỏ
    
    Args:
        documents: List of LlamaIndex documents
        chunk_size: Kích thước mỗi chunk (tokens)
        chunk_overlap: Overlap giữa các chunks
        
    Returns:
        List: List of nodes (chunks)
    """
    from llama_index.core.node_parser import SentenceSplitter
    
    print(f"✂️  Chunking documents (size={chunk_size}, overlap={chunk_overlap})...")
    
    splitter = SentenceSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )
    nodes = splitter.get_nodes_from_documents(documents)
    
    print(f"✅ Created {len(nodes)} chunks")
    return nodes


@task(name="create_embeddings_and_index", retries=2)
def create_embeddings_and_index(nodes, connection_string: str, table_name: str = "rag_embeddings"):
    """
    Tạo embeddings và index vào PGVector
    
    Args:
        nodes: List of nodes (chunks)
        connection_string: PostgreSQL connection string
        table_name: Tên table trong PGVector
        
    Returns:
        dict: Kết quả indexing
    """
    from src.application.services.llm.rag import RAGIndexer
    
    print(f"🔢 Creating embeddings and indexing into PGVector...")
    print(f"   Table: {table_name}")
    print(f"   Total chunks: {len(nodes)}")
    
    # Initialize indexer
    indexer = RAGIndexer(
        connection_string=connection_string,
        table_name=table_name,
        embed_dim=384  # all-MiniLM-L6-v2 dimension
    )
    
    # Create index (tự động tạo embeddings và insert vào PGVector)
    indexer.create_index(nodes)
    
    print(f"✅ Indexed {len(nodes)} chunks into PGVector")
    
    return {
        "status": "success",
        "total_chunks": len(nodes),
        "table_name": table_name
    }


@task(name="cleanup_temp_file")
def cleanup_temp_file(file_path: str):
    """Xóa file tạm sau khi xử lý xong"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"🗑️  Cleaned up temp file: {file_path}")
    except Exception as e:
        print(f"⚠️  Could not delete temp file: {e}")


@flow(name="rag_upload_and_index_flow", log_prints=True)
def rag_upload_and_index_flow(
    file_content: bytes,
    filename: str,
    connection_string: str,
    upload_dir: str = "/tmp/rag_uploads",
    table_name: str = "rag_embeddings",
    chunk_size: int = 1024,
    chunk_overlap: int = 200,
    cleanup: bool = True
):
    """
    Main flow: Upload PDF → Load → Chunk → Create Embeddings → Index to PGVector
    
    Args:
        file_content: Nội dung file PDF (bytes)
        filename: Tên file
        connection_string: PostgreSQL connection string
        upload_dir: Thư mục lưu file tạm
        table_name: Tên table trong PGVector
        chunk_size: Kích thước chunk
        chunk_overlap: Overlap giữa chunks
        cleanup: Xóa file tạm sau khi xong
        
    Returns:
        dict: Kết quả processing
    """
    print("=" * 60)
    print("🚀 RAG UPLOAD AND INDEX FLOW")
    print("=" * 60)
    print(f"File: {filename}")
    print(f"Size: {len(file_content)} bytes")
    print(f"Table: {table_name}")
    print()
    
    # Step 1: Save file
    file_path = save_uploaded_file(file_content, filename, upload_dir)
    
    # Step 2: Load PDF
    documents = load_pdf_document(file_path)
    
    # Step 3: Chunk documents
    nodes = chunk_documents(documents, chunk_size, chunk_overlap)
    
    # Step 4: Create embeddings and index
    result = create_embeddings_and_index(nodes, connection_string, table_name)
    
    # Step 5: Cleanup
    if cleanup:
        cleanup_temp_file(file_path)
    
    print()
    print("=" * 60)
    print("✅ FLOW COMPLETED SUCCESSFULLY")
    print("=" * 60)
    print(f"File processed: {filename}")
    print(f"Total chunks indexed: {result['total_chunks']}")
    print(f"PGVector table: {result['table_name']}")
    
    return {
        **result,
        "filename": filename,
        "file_size": len(file_content)
    }


# Convenience function để call từ API
def run_rag_indexing(file_content: bytes, filename: str, connection_string: str) -> dict:
    """
    Wrapper function để chạy flow từ API endpoint
    
    Args:
        file_content: Nội dung file PDF
        filename: Tên file
        connection_string: PostgreSQL connection string
        
    Returns:
        dict: Kết quả processing
    """
    return rag_upload_and_index_flow(
        file_content=file_content,
        filename=filename,
        connection_string=connection_string
    )
