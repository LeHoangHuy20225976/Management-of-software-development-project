# 🚀 TEST RAG API VỚI DOCKER

## Bước 1: Rebuild LLM Service

```powershell
cd AI
.\rebuild_llm_service.ps1
```

Hoặc manual:

```powershell
docker-compose stop llm-service
docker-compose rm -f llm-service
docker-compose build llm-service
docker-compose up -d llm-service
```

## Bước 2: Kiểm tra logs

```powershell
docker-compose logs -f llm-service
```

Chờ xem:
- ✅ `[RAG] Initializing RAG system...`
- ✅ `[RAG] Index created successfully!` (lần đầu)
- ✅ `[RAG] Index loaded successfully!` (lần sau)

## Bước 3: Truy cập Swagger UI

Mở browser: **http://localhost:8003/docs**

## Bước 4: Test RAG endpoint

### Endpoint: `POST /api/llm/chat_rag`

### Request body mẫu:

```json
{
  "message": "What is Android?",
  "conversation_id": "test-rag-001",
  "top_k": 3
}
```

### Expected Response:

```json
{
  "response": "Android is a mobile operating system based on...",
  "conversation_id": "test-rag-001",
  "sources": [
    {
      "text": "Android is a mobile operating system...",
      "score": 0.8234,
      "file_name": "Lesson 1.2 - Android Introduction.pdf",
      "page": 1
    }
  ]
}
```

## 🧪 Test Cases

### 1. Android basics
```json
{"message": "What is Android?", "top_k": 3}
```

### 2. Kotlin
```json
{"message": "What are Kotlin data types?", "top_k": 5}
```

### 3. RecyclerView
```json
{"message": "How to create a RecyclerView?", "top_k": 3}
```

### 4. Activity Lifecycle
```json
{"message": "Explain Android Activity lifecycle", "top_k": 5}
```

## 📊 Check RAG Stats

### Endpoint: `GET /api/llm/rag/stats`

Response:
```json
{
  "initialized": true,
  "total_chunks": 234,
  "collection_name": "android_pdf_docs",
  "embedding_model": "sentence-transformers/all-MiniLM-L6-v2"
}
```

## 🐛 Troubleshooting

### Container không start

```powershell
# Check logs
docker-compose logs llm-service

# Rebuild from scratch
docker-compose build --no-cache llm-service
```

### ChromaDB error

```powershell
# Xóa ChromaDB và để nó tự tạo lại
docker-compose exec llm-service rm -rf /app/chroma_db
docker-compose restart llm-service
```

### Import error

```powershell
# Kiểm tra dependencies installed
docker-compose exec llm-service pip list | grep llama-index
docker-compose exec llm-service pip list | grep chromadb
```

## 📝 Notes

- **Lần đầu start**: Service sẽ mất ~2-5 phút để:
  - Download embedding model (~90MB)
  - Parse 14 PDF files
  - Create vector index (~234 chunks)
  - Lưu vào ChromaDB

- **Lần sau**: Load index từ ChromaDB (~5-10 giây)

- **ChromaDB location**: `/app/chroma_db` (trong container)

- **PDFs location**: `/app/folder_pdf` (trong container)

## ✅ Success Indicators

```
[RAG] Initializing RAG system...
[RAG] PDF folder: /app/folder_pdf
[RAG] ChromaDB dir: /app/chroma_db
[RAG] Loading PDF documents...
[RAG] Loaded 14 documents
[RAG] Chunking documents...
[RAG] Created 234 nodes
[RAG] Creating vector index...
[RAG] Index created successfully!
[RAG] ✅ RAG system initialized successfully!
```

## 🎯 Quick Test với curl

```bash
curl -X POST "http://localhost:8003/api/llm/chat_rag" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is Android?", "top_k": 3}'
```
