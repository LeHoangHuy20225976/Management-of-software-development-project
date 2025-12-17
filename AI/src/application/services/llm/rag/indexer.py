from llama_index.core import VectorStoreIndex, StorageContext
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core.settings import Settings
import chromadb
from pathlib import Path

class RAGIndexer:
    def __init__(self, 
                persist_dir: str = "./chroma_db",
                collection_name: str = "pdf_documents"):
        """
        Initialize RAG Indexer với ChromaDB
        
        Args:
            persist_dir: Thư mục lưu ChromaDB (persistent storage)
            collection_name: Tên collection trong ChromaDB
        """
        # Tạo thư mục nếu chưa có
        self.persist_dir = Path(persist_dir)
        self.persist_dir.mkdir(parents=True, exist_ok=True)
        
        # Khởi tạo ChromaDB client (persistent)
        self.chroma_client = chromadb.PersistentClient(
            path=str(self.persist_dir)
        )
        
        # Tạo/get collection
        self.collection = self.chroma_client.get_or_create_collection(
            name=collection_name
        )
        
        # Setup embedding model - Local HuggingFace (nhẹ, miễn phí)
        self.embed_model = HuggingFaceEmbedding(
            model_name="sentence-transformers/all-MiniLM-L6-v2"  # Model nhẹ nhất (~90MB)
        )
        
        # Set global settings (optional)
        Settings.embed_model = self.embed_model
        Settings.chunk_size = 1024
        Settings.chunk_overlap = 200
        
        self.index = None
        
    def create_index(self, nodes):
        """Tạo vector index từ nodes"""
        vector_store = ChromaVectorStore(chroma_collection=self.collection)
    
        # Tạo storage context
        storage_context = StorageContext.from_defaults(
            vector_store=vector_store
        )
        
        # Tạo index từ nodes
        self.index = VectorStoreIndex(
            nodes=nodes,
            storage_context=storage_context,
            embed_model=self.embed_model,
            show_progress=True  # Hiển thị progress bar
        )
        
        print(f"✅ Created index with {len(nodes)} nodes")
        return self.index
    
    def load_index(self):
        """
        Load index từ ChromaDB đã persist
        
        Returns:
            VectorStoreIndex: Index đã load
        """
        # Tạo ChromaVectorStore từ collection đã có
        vector_store = ChromaVectorStore(chroma_collection=self.collection)
        
        # Load index từ vector store
        self.index = VectorStoreIndex.from_vector_store(
            vector_store=vector_store,
            embed_model=self.embed_model
        )
        
        print(f"✅ Loaded index from ChromaDB")
        return self.index
    
    def get_query_engine(self, similarity_top_k: int = 5, response_mode: str = "compact"):
        """
        Tạo query engine để search documents
        
        Args:
            similarity_top_k: Số lượng chunks relevant trả về
            response_mode: compact, tree_summarize, simple_summarize
            
        Returns:
            QueryEngine: Engine để query
        """
        if self.index is None:
            raise ValueError("Index chưa được tạo. Gọi create_index() hoặc load_index() trước")
        
        query_engine = self.index.as_query_engine(
            similarity_top_k=similarity_top_k,
            response_mode=response_mode
        )
        
        return query_engine
    
    def delete_collection(self):
        """Xóa collection (để re-index từ đầu)"""
        collection_name = self.collection.name
        self.chroma_client.delete_collection(name=collection_name)
        print(f"🗑️ Deleted collection: {collection_name}")
    
    def get_collection_count(self):
        """Đếm số documents trong collection"""
        count = self.collection.count()
        print(f"📊 Collection has {count} documents")
        return count