from llama_index.core import VectorStoreIndex, StorageContext
from llama_index.vector_stores.postgres import PGVectorStore
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core.settings import Settings
from sqlalchemy import make_url
from typing import Optional

class RAGIndexer:
    def __init__(self, 
                connection_string: str,
                table_name: str = "rag_embeddings",
                embed_dim: int = 384):
        """
        Initialize RAG Indexer với PGVector
        
        Args:
            connection_string: PostgreSQL connection string
            table_name: Tên table trong PostgreSQL để lưu embeddings
            embed_dim: Dimension của embedding (384 cho all-MiniLM-L6-v2)
        """
        self.connection_string = connection_string
        self.table_name = table_name
        self.embed_dim = embed_dim
        
        # Setup embedding model - Multilingual model for Vietnamese support
        self.embed_model = HuggingFaceEmbedding(
            model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"  # Multilingual (~420MB), 384 dims
        )
        
        # Set global settings
        Settings.embed_model = self.embed_model
        Settings.chunk_size = 1024
        Settings.chunk_overlap = 200
        
        # Initialize vector store
        self.vector_store = PGVectorStore.from_params(
            database=self._get_db_name(),
            host=self._get_host(),
            password=self._get_password(),
            port=self._get_port(),
            user=self._get_user(),
            table_name=self.table_name,
            embed_dim=self.embed_dim
        )
        
        self.index = None
    
    def _get_db_name(self) -> str:
        """Extract database name from connection string"""
        url = make_url(self.connection_string)
        return url.database
    
    def _get_host(self) -> str:
        """Extract host from connection string"""
        url = make_url(self.connection_string)
        return url.host
    
    def _get_port(self) -> int:
        """Extract port from connection string"""
        url = make_url(self.connection_string)
        return url.port or 5432
    
    def _get_user(self) -> str:
        """Extract user from connection string"""
        url = make_url(self.connection_string)
        return url.username
    
    def _get_password(self) -> str:
        """Extract password from connection string"""
        url = make_url(self.connection_string)
        return url.password
        
    def create_index(self, nodes):
        """Tạo vector index từ nodes và insert vào PGVector"""
        # Tạo storage context
        storage_context = StorageContext.from_defaults(
            vector_store=self.vector_store
        )
        
        # Tạo index từ nodes
        self.index = VectorStoreIndex(
            nodes=nodes,
            storage_context=storage_context,
            embed_model=self.embed_model,
            show_progress=True
        )
        
        print(f"✅ Created index with {len(nodes)} nodes in PGVector table '{self.table_name}'")
        return self.index
    
    def load_index(self):
        """
        Load index từ PGVector table
        
        Returns:
            VectorStoreIndex: Index đã load
        """
        # Load index từ vector store
        self.index = VectorStoreIndex.from_vector_store(
            vector_store=self.vector_store,
            embed_model=self.embed_model
        )
        
        print(f"✅ Loaded index from PGVector table '{self.table_name}'")
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
    
    def delete_table(self):
        """Xóa table (để re-index từ đầu)"""
        # PGVector sẽ tự động drop/recreate table khi cần
        print(f"🗑️ To delete table '{self.table_name}', run: DROP TABLE {self.table_name};")
    
    def get_document_count(self):
        """Đếm số documents trong PGVector"""
        # Query từ vector store
        try:
            # PGVector không có count trực tiếp, phải query
            print(f"📊 Documents stored in PGVector table '{self.table_name}'")
            return "Check via SQL: SELECT COUNT(*) FROM " + self.table_name
        except Exception as e:
            print(f"Error counting documents: {e}")
            return 0