"""
Simple script to index TXT into ChromaDB (no Prefect)
Run inside Docker container
"""
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, '/app')

from llama_index.core import Document, VectorStoreIndex
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.vector_stores.chroma import ChromaVectorStore
import chromadb

def index_txt_to_chroma(
    txt_file: str = "/app/test.txt",
    chroma_dir: str = "/app/chroma_db",
    collection_name: str = "hotel_knowledge"
):
    """Index TXT file to ChromaDB"""
    print("="*80)
    print("🚀 INDEX TXT TO CHROMADB")
    print("="*80 + "\n")
    
    # 1. Read file
    print("📖 Reading file...")
    content = Path(txt_file).read_text(encoding='utf-8')
    print(f"✅ Loaded {len(content)} characters\n")
    
    # 2. Create document
    print("📄 Creating document...")
    doc = Document(
        text=content,
        metadata={"filename": Path(txt_file).name, "type": "hotel_kb"}
    )
    print("✅ Document created\n")
    
    # 3. Chunk
    print("✂️  Chunking...")
    splitter = SentenceSplitter(chunk_size=512, chunk_overlap=50)
    nodes = splitter.get_nodes_from_documents([doc])
    print(f"✅ Created {len(nodes)} chunks\n")
    
    # 4. Setup ChromaDB
    print("💾 Setting up ChromaDB...")
    Path(chroma_dir).mkdir(parents=True, exist_ok=True)
    client = chromadb.PersistentClient(path=chroma_dir)
    
    try:
        client.delete_collection(collection_name)
        print(f"   Deleted old collection")
    except:
        pass
    
    collection = client.create_collection(collection_name)
    vector_store = ChromaVectorStore(chroma_collection=collection)
    print("✅ ChromaDB ready\n")
    
    # 5. Create embeddings
    print("🔢 Creating embeddings...")
    embed_model = HuggingFaceEmbedding(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    
    index = VectorStoreIndex.from_documents(
        [doc],
        vector_store=vector_store,
        embed_model=embed_model,
        show_progress=True
    )
    print("✅ Indexed!\n")
    
    # 6. Test
    print("🧪 Testing query...")
    qe = index.as_query_engine(similarity_top_k=3)
    response = qe.query("Giờ check-in là mấy giờ?")
    print(f"Answer: {response}\n")
    
    print("="*80)
    print("✅ SUCCESS!")
    print("="*80)
    print(f"Chunks: {len(nodes)}")
    print(f"Collection: {collection_name}")
    print(f"Location: {chroma_dir}")

if __name__ == "__main__":
    index_txt_to_chroma()
