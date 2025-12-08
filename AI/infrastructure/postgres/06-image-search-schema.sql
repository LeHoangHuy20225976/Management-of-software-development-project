-- ============================================================================
-- Image Search & Retrieval Schema
-- ============================================================================
-- Add vector embeddings to Image table for semantic search
-- Uses CLIP (clip-vit-base-patch32) - 512 dimensions

-- Add columns for image embeddings
ALTER TABLE Image ADD COLUMN IF NOT EXISTS image_embedding vector(512);
ALTER TABLE Image ADD COLUMN IF NOT EXISTS embedding_model VARCHAR(100) DEFAULT 'clip-vit-base-patch32';
ALTER TABLE Image ADD COLUMN IF NOT EXISTS embedding_created_at TIMESTAMP;

-- Create index for fast similarity search (HNSW algorithm)
-- HNSW (Hierarchical Navigable Small World) is faster than IVFFlat for < 1M vectors
CREATE INDEX IF NOT EXISTS image_embedding_idx ON Image
USING hnsw (image_embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Add metadata columns for better search
ALTER TABLE Image ADD COLUMN IF NOT EXISTS image_width INTEGER;
ALTER TABLE Image ADD COLUMN IF NOT EXISTS image_height INTEGER;
ALTER TABLE Image ADD COLUMN IF NOT EXISTS image_format VARCHAR(10);
ALTER TABLE Image ADD COLUMN IF NOT EXISTS image_size_bytes BIGINT;
ALTER TABLE Image ADD COLUMN IF NOT EXISTS image_description TEXT;
ALTER TABLE Image ADD COLUMN IF NOT EXISTS image_tags TEXT[]; -- Array of tags
ALTER TABLE Image ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE; -- Primary image for hotel/room
ALTER TABLE Image ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0; -- Order for display
ALTER TABLE Image ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE Image ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create function to update updated_at automatically
CREATE OR REPLACE FUNCTION update_image_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS image_updated_at_trigger ON Image;
CREATE TRIGGER image_updated_at_trigger
    BEFORE UPDATE ON Image
    FOR EACH ROW
    EXECUTE FUNCTION update_image_updated_at();

-- Add comments for documentation
COMMENT ON COLUMN Image.image_embedding IS 'CLIP embedding vector (512-dim) for semantic similarity search';
COMMENT ON COLUMN Image.embedding_model IS 'Model used to generate embedding (e.g., clip-vit-base-patch32)';
COMMENT ON COLUMN Image.image_tags IS 'Tags for categorization (e.g., {pool, sunset, luxury})';
COMMENT ON COLUMN Image.is_primary IS 'Whether this is the primary/thumbnail image';

-- Create view for image search results with metadata
CREATE OR REPLACE VIEW image_search_view AS
SELECT
    i.image_id,
    i.image_url,
    i.image_description,
    i.image_tags,
    i.is_primary,
    i.image_width,
    i.image_height,
    i.embedding_model,
    i.created_at,
    -- Hotel info
    h.hotel_id,
    h.name as hotel_name,
    h.rating as hotel_rating,
    h.address as hotel_address,
    h.thumbnail as hotel_thumbnail,
    -- Room info
    r.room_id,
    r.room_name,
    r.room_status,
    -- Destination info
    d.destination_id,
    d.name as destination_name,
    d.location as destination_location,
    d.type as destination_type
FROM Image i
LEFT JOIN Hotel h ON i.hotel_id = h.hotel_id
LEFT JOIN Room r ON i.room_id = r.room_id
LEFT JOIN Destination d ON i.destination_id = d.destination_id;

COMMENT ON VIEW image_search_view IS 'Denormalized view for image search with related entity metadata';
