# Script để rebuild và restart LLM service với RAG support
# Run: .\rebuild_llm_service.ps1

Write-Host "🔨 Rebuilding LLM Service with RAG support..." -ForegroundColor Cyan

# Stop existing container
Write-Host "`n📦 Stopping existing container..." -ForegroundColor Yellow
docker-compose stop llm-service

# Remove container
Write-Host "`n🗑️  Removing old container..." -ForegroundColor Yellow
docker-compose rm -f llm-service

# Rebuild image
Write-Host "`n🏗️  Building new image..." -ForegroundColor Yellow
docker-compose build llm-service

# Start container
Write-Host "`n🚀 Starting LLM service..." -ForegroundColor Yellow
docker-compose up -d llm-service

# Wait a bit
Write-Host "`n⏳ Waiting for service to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check logs
Write-Host "`n📋 Recent logs:" -ForegroundColor Yellow
docker-compose logs --tail=50 llm-service

# Check health
Write-Host "`n🏥 Checking health..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8003/health" -Method Get
    Write-Host "Service is healthy!" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "Health check failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`nSwagger UI: http://localhost:8003/docs" -ForegroundColor Cyan
Write-Host "RAG endpoint: POST http://localhost:8003/api/llm/chat_rag" -ForegroundColor Cyan
Write-Host "`nDone!" -ForegroundColor Green
