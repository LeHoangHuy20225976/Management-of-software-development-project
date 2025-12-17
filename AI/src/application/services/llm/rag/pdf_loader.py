from pathlib import Path
from llama_index.core import SimpleDirectoryReader
from llama_index.core.node_parser import SentenceSplitter

class PDFLoader:
    def __init__(self, pdf_directory: str):
        # pdf_directory = "AI/folder_pdf"
        self.pdf_dir = Path(pdf_directory)
    
    def load_documents(self):
        """Load tất cả PDF files"""
        #Sử dụng SimpleDirectoryReader của LlamaIndex
        reader = SimpleDirectoryReader(
            input_dir=str(self.pdf_dir),
            required_exts=[".pdf"]
        )
        documents = reader.load_data()
        return documents
    
    def chunk_documents(self, documents):
        """Chia documents thành chunks nhỏ"""
        # Sử dụng SentenceSplitter
        splitter = SentenceSplitter(
            chunk_size=1024,
            chunk_overlap=200
        )
        nodes = splitter.get_nodes_from_documents(documents)
        return nodes