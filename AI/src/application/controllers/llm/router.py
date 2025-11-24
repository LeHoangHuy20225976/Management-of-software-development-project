"""
LLM Service API Router
"""

from fastapi import APIRouter

router = APIRouter()

@router.get('/health')
async def llm_health():
    return {'status': 'ok', 'service': 'llm'}

@router.get('/')
async def llm_root():
    """ LLM service root endpoint"""
    return {
        'service': 'LLM',
        'version': '0.1.0',
        'status': 'running'
    }