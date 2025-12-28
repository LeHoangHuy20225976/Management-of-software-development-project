"""
Script để load file TXT vào RAG system (không cần Prefect)
"""
from pathlib import Path
from llama_index.core import Document, VectorStoreIndex
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.vector_stores.chroma import ChromaVectorStore
import chromadb

def load_txt_to_rag(
    txt_file_path: str,
    collection_name: str = "hotel_knowledge",
    chroma_dir: str = "./chroma_db",
    chunk_size: int = 512,
    chunk_overlap: int = 50
):
    """
    Load file TXT vào RAG system
    
    Args:
        txt_file_path: Đường dẫn file .txt
        collection_name: Tên collection trong ChromaDB
        chroma_dir: Thư mục lưu ChromaDB
        chunk_size: Kích thước mỗi chunk
        chunk_overlap: Overlap giữa các chunks
    """
    print("="*80)
    print("🚀 LOAD TXT FILE TO RAG SYSTEM")
    print("="*80 + "\n")
    
    # 1. Đọc file txt
    print(f"📖 Step 1: Reading file...")
    txt_path = Path(txt_file_path)
    if not txt_path.exists():
        raise FileNotFoundError(f"File not found: {txt_file_path}")
    
    content = txt_path.read_text(encoding='utf-8')
    print(f"✅ Loaded file: {txt_path.name}")
    print(f"   Size: {len(content)} characters\n")
    
    # 2. Tạo Document
    print(f"📄 Step 2: Creating document...")
    document = Document(
        text=content,
        metadata={
            "filename": txt_path.name,
            "source": str(txt_path),
            "type": "hotel_knowledge_base"
        }
    )
    print(f"✅ Document created\n")
    
    # 3. Chia thành chunks
    print(f"✂️  Step 3: Chunking document...")
    splitter = SentenceSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )
    nodes = splitter.get_nodes_from_documents([document])
    print(f"✅ Created {len(nodes)} chunks\n")
    
    # 4. Setup embedding model
    print(f"🔢 Step 4: Setting up embedding model...")
    embed_model = HuggingFaceEmbedding(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    print(f"✅ Embedding model loaded\n")
    
    # 5. Setup ChromaDB
    print(f"💾 Step 5: Setting up ChromaDB...")
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
    print(f"✅ ChromaDB ready: {chroma_dir}\n")
    
    # 6. Create index and store
    print(f"🔍 Step 6: Creating index and storing embeddings...")
    index = VectorStoreIndex.from_documents(
        [document],
        vector_store=vector_store,
        embed_model=embed_model,
        show_progress=True
    )
    print(f"✅ Index created and stored\n")
    
    # 7. Test query
    print(f"🧪 Step 7: Testing query...")
    query_engine = index.as_query_engine(similarity_top_k=3)
    test_query = "Giờ check-in là mấy giờ?"
    response = query_engine.query(test_query)
    print(f"   Query: {test_query}")
    print(f"   Answer: {response}\n")
    
    print("="*80)
    print("✅ SUCCESSFULLY LOADED TXT TO RAG SYSTEM")
    print("="*80)
    print(f"\n📊 Summary:")
    print(f"   - File: {txt_path.name}")
    print(f"   - Total chunks: {len(nodes)}")
    print(f"   - Collection: {collection_name}")
    print(f"   - ChromaDB: {chroma_dir}")
    print(f"\n💡 Next steps:")
    print(f"   1. Test more queries with the query engine")
    print(f"   2. Integrate with your LLM service")
    print(f"   3. Add more documents to the collection")

if __name__ == "__main__":
    # Load file test.txt từ rag_demo
    txt_file = r"d:\Management_Software\Management-of-software-development-project\AI\rag_demo\test.txt"
    
    load_txt_to_rag(
        txt_file_path=txt_file,
        collection_name="hotel_knowledge",
        chroma_dir="./chroma_db",
        chunk_size=512,
        chunk_overlap=50
    )
