"""
Hotel Upload Controller
Handles image and document uploads for hotels
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from typing import List, Optional
import asyncio
from io import BytesIO

from src.application.dtos.hotel.upload_dto import (
    HotelImageUploadResponse,
    HotelImageBatchUploadResponse,
    HotelDocumentUploadResponse,
    ImageListResponse,
    DocumentListResponse,
    HotelUploadStatsResponse
)
from src.application.services.storage.minio_service import MinioStorageService
from src.application.services.cv.image_search import ImageSearchService
from src.utils.logger import get_logger
from src.infrastructure.config import get_settings
import psycopg2
from psycopg2.extras import RealDictCursor

logger = get_logger(__name__)
settings = get_settings()

router = APIRouter(
    prefix="/hotel",
    tags=["Hotel Upload Management"]
)

# Initialize services
minio_service = MinioStorageService()
image_search_service = ImageSearchService()


def get_db_connection():
    """Get PostgreSQL connection"""
    return psycopg2.connect(
        host=settings.postgres_host,
        port=settings.postgres_port,
        user=settings.postgres_user,
        password=settings.postgres_password,
        database=settings.postgres_db
    )


# =============================================================================
# Image Upload Endpoints
# =============================================================================

@router.post("/{hotel_id}/images/upload", response_model=HotelImageBatchUploadResponse)
async def upload_hotel_images(
    hotel_id: int,
    files: List[UploadFile] = File(..., description="Image files (JPG, PNG, WEBP)"),
    image_types: str = Form(..., description="Comma-separated image types for each file"),
    descriptions: str = Form("", description="Comma-separated descriptions (optional)"),
    uploaded_by: Optional[int] = Form(None, description="User ID who uploaded"),
    background_tasks: BackgroundTasks = None
):
    """
    Upload multiple images for a hotel

    - **hotel_id**: Hotel ID
    - **files**: List of image files
    - **image_types**: Comma-separated types (hotel_exterior, room_interior, facility, food)
    - **descriptions**: Optional descriptions for each image
    - **uploaded_by**: User ID

    Process:
    1. Upload images to MinIO
    2. Generate CLIP embeddings
    3. Store metadata in database
    4. Return uploaded image info
    """

    try:
        # Parse types and descriptions
        types_list = [t.strip() for t in image_types.split(',')]
        desc_list = [d.strip() for d in descriptions.split(',')] if descriptions else []

        # Validate
        if len(types_list) != len(files):
            raise HTTPException(
                status_code=400,
                detail=f"Number of image_types ({len(types_list)}) must match number of files ({len(files)})"
            )

        # Pad descriptions if needed
        while len(desc_list) < len(files):
            desc_list.append("")

        uploaded_images = []
        errors = []

        for idx, (file, img_type, desc) in enumerate(zip(files, types_list, desc_list)):
            try:
                logger.info(f"Processing image {idx+1}/{len(files)}: {file.filename}")

                # 1. Upload to MinIO
                bucket_name = f"hotel-{hotel_id}"
                file_content = await file.read()
                file_size = len(file_content)

                # Generate object name: type/timestamp_filename
                import time
                timestamp = int(time.time())
                object_name = f"{img_type}/{timestamp}_{file.filename}"

                upload_result = minio_service.upload_file(
                    bucket_name=bucket_name,
                    object_name=object_name,
                    file_data=BytesIO(file_content),
                    file_size=file_size,
                    content_type=file.content_type or "image/jpeg"
                )

                image_url = upload_result["file_url"]

                # 2. Generate CLIP embedding (async in background if possible)
                from PIL import Image
                import io

                pil_image = Image.open(io.BytesIO(file_content))

                # Initialize image search service if needed
                if image_search_service.clip_extractor is None:
                    await image_search_service.initialize()

                # Generate embedding
                embedding = await image_search_service.generate_embedding(pil_image)
                embedding_list = embedding.tolist()

                # 3. Insert to database
                conn = get_db_connection()
                cur = conn.cursor(cursor_factory=RealDictCursor)

                cur.execute("""
                    INSERT INTO image (
                        hotel_id, image_url, image_type, image_description,
                        image_embedding, embedding_model,
                        image_width, image_height, image_size_bytes,
                        embedding_created_at
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                    RETURNING image_id
                """, (
                    hotel_id,
                    image_url,
                    img_type,
                    desc if desc else None,
                    embedding_list,
                    'clip-vit-base-patch32',
                    pil_image.width,
                    pil_image.height,
                    file_size
                ))

                image_id = cur.fetchone()['image_id']
                conn.commit()
                cur.close()
                conn.close()

                uploaded_images.append(HotelImageUploadResponse(
                    success=True,
                    image_id=image_id,
                    image_url=image_url,
                    image_type=img_type,
                    hotel_id=hotel_id,
                    message=f"Image uploaded successfully"
                ))

                logger.info(f"✅ Image {idx+1} uploaded: ID={image_id}")

            except Exception as e:
                logger.error(f"❌ Failed to upload image {idx+1}: {e}")
                errors.append(f"File {file.filename}: {str(e)}")

        return HotelImageBatchUploadResponse(
            success=len(errors) == 0,
            total_uploaded=len(uploaded_images),
            total_failed=len(errors),
            images=uploaded_images,
            errors=errors,
            message=f"Uploaded {len(uploaded_images)}/{len(files)} images successfully"
        )

    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{hotel_id}/images", response_model=ImageListResponse)
async def list_hotel_images(hotel_id: int):
    """
    List all images for a hotel
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT
                image_id, image_url, image_type, image_description,
                image_tags, is_primary, display_order,
                image_width, image_height, created_at
            FROM image
            WHERE hotel_id = %s
            ORDER BY display_order, created_at DESC
        """, (hotel_id,))

        images = [dict(row) for row in cur.fetchall()]

        # Convert datetime to string
        for img in images:
            if img.get('created_at'):
                img['created_at'] = img['created_at'].isoformat()

        cur.close()
        conn.close()

        return ImageListResponse(
            success=True,
            total=len(images),
            images=images,
            hotel_id=hotel_id
        )

    except Exception as e:
        logger.error(f"Error listing images: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{hotel_id}/images/{image_id}")
async def delete_hotel_image(hotel_id: int, image_id: int):
    """
    Delete a hotel image
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Delete from database
        cur.execute("""
            DELETE FROM image
            WHERE image_id = %s AND hotel_id = %s
            RETURNING image_url
        """, (image_id, hotel_id))

        result = cur.fetchone()

        if not result:
            raise HTTPException(status_code=404, detail="Image not found")

        conn.commit()
        cur.close()
        conn.close()

        # TODO: Delete from MinIO if needed

        return {
            "success": True,
            "message": f"Image {image_id} deleted successfully"
        }

    except Exception as e:
        logger.error(f"Error deleting image: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# Document Upload Endpoints
# =============================================================================

@router.post("/{hotel_id}/documents/upload", response_model=HotelDocumentUploadResponse)
async def upload_hotel_document(
    hotel_id: int,
    file: UploadFile = File(..., description="Document file (PDF, DOCX)"),
    document_type: str = Form(..., description="Document type: brochure, policy, menu, guide"),
    uploaded_by: Optional[int] = Form(None, description="User ID"),
    background_tasks: BackgroundTasks = None
):
    """
    Upload a document for a hotel

    - **hotel_id**: Hotel ID
    - **file**: PDF or DOCX file
    - **document_type**: brochure, policy, menu, guide, contract
    - **uploaded_by**: User ID

    Process:
    1. Upload document to MinIO
    2. Insert metadata to HotelDocument table
    3. Trigger background RAG indexing
    4. Return document info
    """

    try:
        # Validate file type
        allowed_types = ['.pdf', '.docx', '.doc', '.txt']
        if not any(file.filename.lower().endswith(ext) for ext in allowed_types):
            raise HTTPException(
                status_code=400,
                detail=f"Only {', '.join(allowed_types)} files are allowed"
            )

        # 1. Upload to MinIO
        bucket_name = f"hotel-{hotel_id}-docs"
        file_content = await file.read()
        file_size = len(file_content)

        import time
        timestamp = int(time.time())
        object_name = f"{document_type}/{timestamp}_{file.filename}"

        upload_result = minio_service.upload_file(
            bucket_name=bucket_name,
            object_name=object_name,
            file_data=BytesIO(file_content),
            file_size=file_size,
            content_type=file.content_type or "application/pdf"
        )

        file_url = upload_result["file_url"]

        # 2. Insert to database
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            INSERT INTO HotelDocument (
                hotel_id, document_type, file_name, file_url,
                file_size, mime_type, uploaded_by, rag_status
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'pending')
            RETURNING document_id
        """, (
            hotel_id,
            document_type,
            file.filename,
            file_url,
            file_size,
            file.content_type,
            uploaded_by
        ))

        document_id = cur.fetchone()['document_id']
        conn.commit()
        cur.close()
        conn.close()

        # 3. TODO: Trigger RAG indexing in background
        # background_tasks.add_task(index_document_to_rag, document_id, file_url)

        logger.info(f"✅ Document uploaded: ID={document_id}, Hotel={hotel_id}")

        return HotelDocumentUploadResponse(
            success=True,
            document_id=document_id,
            file_url=file_url,
            document_type=document_type,
            hotel_id=hotel_id,
            rag_status="pending",
            message="Document uploaded successfully. RAG indexing pending."
        )

    except Exception as e:
        logger.error(f"Document upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{hotel_id}/documents", response_model=DocumentListResponse)
async def list_hotel_documents(hotel_id: int):
    """
    List all documents for a hotel
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT
                document_id, document_type, file_name, file_url,
                file_size, mime_type, rag_status, total_chunks,
                created_at, rag_indexed_at
            FROM HotelDocument
            WHERE hotel_id = %s AND is_deleted = FALSE
            ORDER BY created_at DESC
        """, (hotel_id,))

        documents = [dict(row) for row in cur.fetchall()]

        # Convert datetime to string
        for doc in documents:
            if doc.get('created_at'):
                doc['created_at'] = doc['created_at'].isoformat()
            if doc.get('rag_indexed_at'):
                doc['rag_indexed_at'] = doc['rag_indexed_at'].isoformat()

        cur.close()
        conn.close()

        return DocumentListResponse(
            success=True,
            total=len(documents),
            documents=documents,
            hotel_id=hotel_id
        )

    except Exception as e:
        logger.error(f"Error listing documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{hotel_id}/documents/{document_id}")
async def delete_hotel_document(hotel_id: int, document_id: int):
    """
    Soft delete a hotel document
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            UPDATE HotelDocument
            SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP
            WHERE document_id = %s AND hotel_id = %s
            RETURNING document_id
        """, (document_id, hotel_id))

        result = cur.fetchone()

        if not result:
            raise HTTPException(status_code=404, detail="Document not found")

        conn.commit()
        cur.close()
        conn.close()

        return {
            "success": True,
            "message": f"Document {document_id} deleted successfully"
        }

    except Exception as e:
        logger.error(f"Error deleting document: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# Statistics
# =============================================================================

@router.get("/{hotel_id}/upload-stats", response_model=HotelUploadStatsResponse)
async def get_hotel_upload_stats(hotel_id: int):
    """
    Get upload statistics for a hotel
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Get image stats
        cur.execute("""
            SELECT
                COUNT(*) as total,
                image_type,
                COUNT(*) as count
            FROM image
            WHERE hotel_id = %s
            GROUP BY image_type
        """, (hotel_id,))

        image_stats = {row['image_type']: row['count'] for row in cur.fetchall()}
        total_images = sum(image_stats.values())

        # Get document stats
        cur.execute("""
            SELECT
                COUNT(*) as total,
                document_type,
                COUNT(*) as count,
                SUM(CASE WHEN rag_status = 'indexed' THEN 1 ELSE 0 END) as indexed
            FROM HotelDocument
            WHERE hotel_id = %s AND is_deleted = FALSE
            GROUP BY document_type
        """, (hotel_id,))

        doc_stats = {row['document_type']: row['count'] for row in cur.fetchall()}
        total_docs = sum(doc_stats.values())
        rag_indexed = sum([row['indexed'] for row in cur.fetchall()])

        # Get last upload
        cur.execute("""
            SELECT MAX(created_at) as last_upload
            FROM (
                SELECT created_at FROM image WHERE hotel_id = %s
                UNION ALL
                SELECT created_at FROM HotelDocument WHERE hotel_id = %s AND is_deleted = FALSE
            ) combined
        """, (hotel_id, hotel_id))

        last_upload = cur.fetchone()['last_upload']

        cur.close()
        conn.close()

        return HotelUploadStatsResponse(
            hotel_id=hotel_id,
            total_images=total_images,
            total_documents=total_docs,
            images_by_type=image_stats,
            documents_by_type=doc_stats,
            rag_indexed_docs=rag_indexed,
            last_upload=last_upload
        )

    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# Health Check
# =============================================================================

@router.get("/upload/health")
async def upload_health():
    """Health check for upload service"""
    return {
        "status": "healthy",
        "service": "hotel-upload",
        "storage": "minio",
        "image_embedding": "clip",
        "document_indexing": "rag"
    }
