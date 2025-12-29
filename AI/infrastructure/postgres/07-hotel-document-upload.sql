-- =============================================================================
-- Migration 07: Hotel Document & Image Upload System
-- =============================================================================
-- Purpose: Add support for hotel-specific document and image uploads
-- - Add image_type column to categorize images
-- - Create HotelDocument table for PDF/DOCX uploads
-- - Support RAG indexing for documents
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Update Image table to add image_type categorization
-- -----------------------------------------------------------------------------

-- Add image_type column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'image'
        AND column_name = 'image_type'
    ) THEN
        ALTER TABLE image
        ADD COLUMN image_type VARCHAR(50) DEFAULT 'general';

        COMMENT ON COLUMN image.image_type IS 'Image category: hotel_exterior, room_interior, facility, food, destination, general';
    END IF;
END $$;

-- Update existing images to have proper type based on foreign keys
UPDATE image SET image_type = 'hotel_exterior' WHERE hotel_id IS NOT NULL AND room_id IS NULL AND destination_id IS NULL;
UPDATE image SET image_type = 'room_interior' WHERE room_id IS NOT NULL;
UPDATE image SET image_type = 'destination' WHERE destination_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 2. Create HotelDocument table for PDF/DOCX uploads
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS HotelDocument (
    document_id SERIAL PRIMARY KEY,
    hotel_id INT NOT NULL REFERENCES hotel(hotel_id) ON DELETE CASCADE,

    -- Document metadata
    document_type VARCHAR(50) NOT NULL,  -- 'brochure', 'policy', 'menu', 'guide', 'contract'
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,              -- MinIO or S3 URL
    file_size BIGINT,                    -- bytes
    mime_type VARCHAR(100),              -- 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

    -- Upload tracking
    uploaded_by INT REFERENCES "User"(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- RAG indexing status
    rag_status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'processing', 'indexed', 'failed'
    rag_table_name VARCHAR(100),               -- PGVector table name (e.g., 'hotel_123_docs')
    rag_indexed_at TIMESTAMP,
    rag_error TEXT,                            -- Error message if indexing failed
    total_chunks INT DEFAULT 0,                -- Number of text chunks created

    -- Soft delete
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_hoteldocument_hotel_id ON HotelDocument(hotel_id);
CREATE INDEX IF NOT EXISTS idx_hoteldocument_type ON HotelDocument(document_type);
CREATE INDEX IF NOT EXISTS idx_hoteldocument_rag_status ON HotelDocument(rag_status);
CREATE INDEX IF NOT EXISTS idx_hoteldocument_created_at ON HotelDocument(created_at DESC);

-- Add comments
COMMENT ON TABLE HotelDocument IS 'Stores uploaded documents (PDF, DOCX) for hotels with RAG indexing support';
COMMENT ON COLUMN HotelDocument.document_type IS 'Category: brochure, policy, menu, guide, contract';
COMMENT ON COLUMN HotelDocument.rag_status IS 'RAG indexing status: pending, processing, indexed, failed';
COMMENT ON COLUMN HotelDocument.rag_table_name IS 'PGVector table name where document chunks are stored';

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_hoteldocument_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hoteldocument_updated_at_trigger
    BEFORE UPDATE ON HotelDocument
    FOR EACH ROW
    EXECUTE FUNCTION update_hoteldocument_updated_at();

-- -----------------------------------------------------------------------------
-- 3. Create view for easy document querying
-- -----------------------------------------------------------------------------

CREATE OR REPLACE VIEW v_hotel_documents AS
SELECT
    hd.document_id,
    hd.hotel_id,
    h.name AS hotel_name,
    hd.document_type,
    hd.file_name,
    hd.file_url,
    hd.file_size,
    hd.mime_type,
    hd.rag_status,
    hd.total_chunks,
    hd.created_at,
    hd.rag_indexed_at,
    u.name AS uploaded_by_name,
    u.email AS uploaded_by_email
FROM HotelDocument hd
LEFT JOIN hotel h ON hd.hotel_id = h.hotel_id
LEFT JOIN "User" u ON hd.uploaded_by = u.user_id
WHERE hd.is_deleted = FALSE
ORDER BY hd.created_at DESC;

COMMENT ON VIEW v_hotel_documents IS 'Easy view for querying hotel documents with related info';

-- -----------------------------------------------------------------------------
-- 4. Create view for hotel images with categorization
-- -----------------------------------------------------------------------------

CREATE OR REPLACE VIEW v_hotel_images AS
SELECT
    i.image_id,
    i.hotel_id,
    h.name AS hotel_name,
    i.room_id,
    r.name AS room_name,
    i.image_type,
    i.image_url,
    i.image_description,
    i.image_tags,
    i.is_primary,
    i.display_order,
    i.image_width,
    i.image_height,
    i.created_at
FROM image i
LEFT JOIN hotel h ON i.hotel_id = h.hotel_id
LEFT JOIN room r ON i.room_id = r.room_id
WHERE i.hotel_id IS NOT NULL
ORDER BY i.hotel_id, i.display_order, i.created_at DESC;

COMMENT ON VIEW v_hotel_images IS 'Hotel images with type categorization and metadata';

-- -----------------------------------------------------------------------------
-- 5. Grant permissions (if needed)
-- -----------------------------------------------------------------------------

-- Grant access to hotel_user (default user)
GRANT SELECT, INSERT, UPDATE, DELETE ON HotelDocument TO hotel_user;
GRANT USAGE, SELECT ON SEQUENCE hoteldocument_document_id_seq TO hotel_user;
GRANT SELECT ON v_hotel_documents TO hotel_user;
GRANT SELECT ON v_hotel_images TO hotel_user;

-- =============================================================================
-- Migration Complete
-- =============================================================================
-- Next steps:
-- 1. Create Python API endpoints for document/image upload
-- 2. Integrate with MinIO storage service
-- 3. Add RAG indexing flow for documents
-- 4. Create frontend upload components
-- =============================================================================
