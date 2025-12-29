"""
Chat with Image Search Service
Combines LLM chat with semantic image search
"""

from typing import List, Dict, Any, Optional
from langchain_core.messages import HumanMessage
import uuid
from src.utils.logger import app_logger

class ChatWithImageSearchService:
    """Service for chat with image search capabilities"""

    def __init__(self):
        """Initialize the service"""
        self.image_search_service = None
        self.chat_graph = None

    def _lazy_init(self):
        """Lazy initialization of dependencies"""
        if self.chat_graph is None:
            # Use agent graph with tool calling capability
            from src.application.services.llm.agent_graph import agent_graph
            self.chat_graph = agent_graph

        if self.image_search_service is None:
            from src.application.services.cv.image_search import ImageSearchService
            self.image_search_service = ImageSearchService()

    async def chat_with_images(
        self,
        message: str,
        user_id: Optional[int] = None,
        hotel_id: Optional[int] = None,
        conversation_id: Optional[str] = None,
        include_images: bool = True,
        max_images: int = 5,
        similarity_threshold: float = 0.3
    ) -> Dict[str, Any]:
        """
        Chat with LLM and search for related images

        Args:
            message: User message
            user_id: Optional user ID for personalized queries (enables tool calling)
            hotel_id: Optional hotel ID to filter images
            conversation_id: Conversation ID for history
            include_images: Whether to search images
            max_images: Max images to return
            similarity_threshold: Min similarity score

        Returns:
            Dict with response, images, and metadata
        """
        self._lazy_init()

        conversation_id = conversation_id or str(uuid.uuid4())

        # 1. Add user context if user_id provided
        user_context = ""
        if user_id:
            user_context = f"\n\nUSER CONTEXT:\nCurrent user ID: {user_id}\nNote: You can use tools like get_user_info_sync({user_id}) or get_user_bookings_sync({user_id}) to get detailed information.\n"

        # 2. Query RAG for hotel context
        rag_context = ""
        sources = []
        try:
            from src.application.services.llm.rag import RAGIndexer
            from src.infrastructure.config import get_settings

            settings = get_settings()
            conn_str = settings.postgres_chat_url

            # Load RAG index
            indexer = RAGIndexer(
                connection_string=conn_str,
                table_name="rag_embeddings",
                embed_dim=384
            )
            indexer.load_index()

            # Retrieve relevant documents (no LLM synthesis)
            retriever = indexer.index.as_retriever(similarity_top_k=3)
            nodes = retriever.retrieve(message)

            if nodes:
                rag_context = "\n\nTHÔNG TIN TỪ CƠ SỞ DỮ LIỆU:\n"
                for i, node in enumerate(nodes, 1):
                    rag_context += f"\n{i}. {node.text[:500]}...\n"
                    sources.append(node.text[:300] + "...")  # First 300 chars as string

                app_logger.info(f"Retrieved {len(nodes)} RAG documents")
        except Exception as e:
            app_logger.warning(f"RAG query failed: {str(e)}")
            # Continue without RAG context

        # 3. Get LLM response with RAG context and user context
        import asyncio
        user_message_with_context = message + user_context + rag_context

        result = await asyncio.to_thread(
            self.chat_graph.invoke,
            {
                "messages": [HumanMessage(content=user_message_with_context)],
                "conversation_id": conversation_id
            },
            config={
                "configurable": {
                    "thread_id": conversation_id
                }
            }
        )

        ai_message = result["messages"][-1]
        ai_response = ai_message.content

        # 4. Search for images if requested
        images = []
        total_images_found = 0

        if include_images:
            try:
                app_logger.info(f"🔍 Starting image search for: {message[:50]}...")

                # Initialize image search service if needed
                if self.image_search_service.clip_extractor is None:
                    app_logger.info("Initializing image search service...")
                    await self.image_search_service.initialize()
                    app_logger.info("✅ Image search service initialized")

                # Search images using the user's message as query
                app_logger.info(f"Searching images with query: {message}")
                search_response = await self.image_search_service.search_by_text(
                    query=message,
                    entity_type="hotel" if hotel_id else None,
                    entity_id=hotel_id,
                    min_similarity=similarity_threshold,
                    limit=max_images
                )
                app_logger.info(f"Search response: {search_response.get('success', False)}, total: {search_response.get('total', 0)}")

                if search_response["success"]:
                    search_results = search_response["results"]
                    total_images_found = len(search_results)

                    # Format image results
                    for result in search_results:
                        img = result.get("image", {})
                        hotel_info = result.get("hotel", {})

                        images.append({
                            "image_id": img.get("image_id"),
                            "image_url": img.get("image_url"),
                            "similarity_score": result.get("similarity", 0.0),
                            "hotel_id": hotel_info.get("hotel_id"),
                            "hotel_name": hotel_info.get("hotel_name"),
                            "hotel_rating": hotel_info.get("hotel_rating"),
                            "image_description": img.get("image_description"),
                            "image_tags": img.get("image_tags", [])
                        })

                    app_logger.info(f"Found {total_images_found} images for query: {message[:50]}...")
                else:
                    app_logger.warning(f"Image search failed: {search_response.get('error', 'Unknown error')}")

            except Exception as e:
                app_logger.error(f"Error searching images: {str(e)}", exc_info=True)
                # Continue without images if search fails

        return {
            "response": ai_response,
            "conversation_id": conversation_id,
            "images": images,
            "sources": sources,
            "total_images_found": total_images_found
        }
