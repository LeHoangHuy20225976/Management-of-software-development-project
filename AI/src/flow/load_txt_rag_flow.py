"""
Prefect Flow để load TXT file vào RAG system
"""
from prefect import flow, task
from pathlib import Path
from llama_index.core import Document, VectorStoreIndex
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.vector_stores.chroma import ChromaVectorStore
import chromadb


@task(name="read_txt_file", retries=2)
def read_txt_file(file_path: str) -> tuple:
    """Đọc file TXT"""
    print(f"📖 Reading file: {file_path}")
    txt_path = Path(file_path)
    
    if not txt_path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")
    
    content = txt_path.read_text(encoding='utf-8')
    print(f"✅ Loaded {len(content)} characters")
    
    return content, txt_path.name


@task(name="create_document", retries=2)
def create_document(content: str, filename: str) -> Document:
    """Tạo LlamaIndex Document"""
    print(f"📄 Creating document from {filename}")
    
    document = Document(
        text=content,
        metadata={
            "filename": filename,
            "type": "hotel_knowledge_base"
        }
    )
    print(f"✅ Document created")
    return document


@task(name="chunk_document", retries=2)
def chunk_document(document: Document, chunk_size: int = 512, chunk_overlap: int = 50):
    """Chia document thành chunks"""
    print(f"✂️  Chunking document (size={chunk_size}, overlap={chunk_overlap})")
    
    splitter = SentenceSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )
    nodes = splitter.get_nodes_from_documents([document])
    
    print(f"✅ Created {len(nodes)} chunks")
    return nodes


@task(name="setup_vector_store", retries=2)
def setup_vector_store(collection_name: str, chroma_dir: str):
    """Setup ChromaDB vector store"""
    print(f"💾 Setting up ChromaDB: {chroma_dir}")
    
    chroma_path = Path(chroma_dir)
    chroma_path.mkdir(parents=True, exist_ok=True)
    
    chroma_client = chromadb.PersistentClient(path=str(chroma_path))
    
    # Delete existing collection if exists
    try:
        chroma_client.delete_collection(collection_name)
        print(f"   Deleted existing collection: {collection_name}")
    except:
        pass
    
    chroma_collection = chroma_client.create_collection(collection_name)
    vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
    
    print(f"✅ ChromaDB ready")
    return vector_store


@task(name="create_embeddings", retries=2)
def create_embeddings(document: Document, vector_store, embed_model_name: str):
    """Tạo embeddings và lưu vào vector store"""
    print(f"🔢 Creating embeddings with {embed_model_name}")
    
    embed_model = HuggingFaceEmbedding(model_name=embed_model_name)
    
    print(f"🔍 Creating index...")
    index = VectorStoreIndex.from_documents(
        [document],
        vector_store=vector_store,
        embed_model=embed_model,
        show_progress=True
    )
    
    print(f"✅ Embeddings created and stored")
    return index


@task(name="test_query", retries=2)
def test_query(index, test_question: str):
    """Test query để kiểm tra RAG"""
    print(f"🧪 Testing query: {test_question}")
    
    query_engine = index.as_query_engine(similarity_top_k=3)
    response = query_engine.query(test_question)
    
    print(f"✅ Response: {response}")
    return str(response)


@flow(name="load-txt-to-rag-flow", log_prints=True)
def load_txt_to_rag_flow(
    txt_file_path: str,
    collection_name: str = "hotel_knowledge",
    chroma_dir: str = "./chroma_db",
    chunk_size: int = 512,
    chunk_overlap: int = 50,
    embed_model: str = "sentence-transformers/all-MiniLM-L6-v2",
    test_question: str = "Giờ check-in là mấy giờ?"
):
    """
    Prefect Flow để load TXT file vào RAG system
    
    Args:
        txt_file_path: Đường dẫn file TXT
        collection_name: Tên collection trong ChromaDB
        chroma_dir: Thư mục lưu ChromaDB
        chunk_size: Kích thước mỗi chunk
        chunk_overlap: Overlap giữa chunks
        embed_model: Tên embedding model
        test_question: Câu hỏi test
    """
    print("="*80)
    print("🚀 PREFECT FLOW: LOAD TXT TO RAG")
    print("="*80 + "\n")
    
    # 1. Read file
    content, filename = read_txt_file(txt_file_path)
    
    # 2. Create document
    document = create_document(content, filename)
    
    # 3. Chunk document
    nodes = chunk_document(document, chunk_size, chunk_overlap)
    
    # 4. Setup vector store
    vector_store = setup_vector_store(collection_name, chroma_dir)
    
    # 5. Create embeddings
    index = create_embeddings(document, vector_store, embed_model)
    
    # 6. Test query
    response = test_query(index, test_question)
    
    print("\n" + "="*80)
    print("✅ FLOW COMPLETED SUCCESSFULLY")
    print("="*80)
    print(f"\n📊 Summary:")
    print(f"   - File: {filename}")
    print(f"   - Total chunks: {len(nodes)}")
    print(f"   - Collection: {collection_name}")
    print(f"   - ChromaDB: {chroma_dir}")
    print(f"   - Test query: {test_question}")
    print(f"   - Response: {response[:100]}...")
    
    return {
        "filename": filename,
        "total_chunks": len(nodes),
        "collection": collection_name,
        "chroma_dir": chroma_dir,
        "test_response": response
    }


if __name__ == "__main__":
    # Chạy flow locally
    txt_file = r"d:\Management_Software\Management-of-software-development-project\AI\rag_demo\test.txt"
    
    result = load_txt_to_rag_flow(
        txt_file_path=txt_file,
        collection_name="hotel_knowledge",
        chroma_dir="./chroma_db",
        test_question="Cho tôi biết về phòng Deluxe"
    )
    
    print("\n" + "="*80)
    print("🎉 Flow Result:")
    print("="*80)
    for key, value in result.items():
        print(f"   {key}: {value}")
