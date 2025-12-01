-- ============================================================================
-- FACE RECOGNITION & ATTENDANCE TRACKING SCHEMA
-- ============================================================================
-- This schema manages employee face embeddings and attendance logs
-- Uses pgvector for face similarity search

-- 1. EMPLOYEE FACES TABLE
-- Stores face embeddings for enrolled employees
CREATE TABLE IF NOT EXISTS employee_faces (
    face_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "User"(user_id) ON DELETE CASCADE,

    -- Face embedding vector (512 dimensions for ArcFace/InsightFace)
    face_embedding vector(512) NOT NULL,

    -- Face quality metrics
    face_quality_score DOUBLE PRECISION,  -- Overall quality score (0-1)
    sharpness_score DOUBLE PRECISION,     -- Image sharpness
    brightness_score DOUBLE PRECISION,    -- Lighting quality

    -- Face metadata
    bbox_x1 INTEGER,  -- Bounding box coordinates
    bbox_y1 INTEGER,
    bbox_x2 INTEGER,
    bbox_y2 INTEGER,

    -- Image storage
    face_image_url VARCHAR(500),  -- URL to MinIO/S3 storage
    original_image_url VARCHAR(500),

    -- Liveness detection
    is_liveness_verified BOOLEAN DEFAULT FALSE,
    liveness_score DOUBLE PRECISION,

    -- Enrollment metadata
    enrollment_device VARCHAR(100),  -- Device used for enrollment
    enrollment_location VARCHAR(200),
    enrollment_notes TEXT,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Ensure each user can have multiple face samples
    CONSTRAINT unique_user_face UNIQUE(user_id, face_id)
);

-- Create index for vector similarity search (using cosine distance)
CREATE INDEX IF NOT EXISTS employee_faces_embedding_idx
ON employee_faces
USING ivfflat (face_embedding vector_cosine_ops)
WITH (lists = 100);

-- Index for user lookup
CREATE INDEX IF NOT EXISTS employee_faces_user_idx
ON employee_faces(user_id)
WHERE is_active = TRUE;

-- Index for quality filtering
CREATE INDEX IF NOT EXISTS employee_faces_quality_idx
ON employee_faces(face_quality_score)
WHERE is_active = TRUE;


-- 2. ATTENDANCE LOGS TABLE
-- Tracks all attendance events (check-in, check-out, recognition attempts)
CREATE TABLE IF NOT EXISTS attendance_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "User"(user_id) ON DELETE SET NULL,

    -- Recognition details
    matched_face_id INTEGER REFERENCES employee_faces(face_id) ON DELETE SET NULL,
    recognition_confidence DOUBLE PRECISION,  -- Similarity score (0-1)
    recognition_threshold DOUBLE PRECISION DEFAULT 0.7,

    -- Event type
    event_type VARCHAR(30) NOT NULL CHECK (
        event_type IN (
            'CHECK_IN',
            'CHECK_OUT',
            'RECOGNITION_SUCCESS',
            'RECOGNITION_FAILED',
            'MANUAL_ENTRY',
            'MANUAL_CORRECTION'
        )
    ),

    -- Location & device
    location VARCHAR(200),  -- e.g., "Front Desk", "Staff Entrance"
    device_id VARCHAR(100),
    device_type VARCHAR(50),  -- e.g., "tablet", "mobile", "kiosk"

    -- Image captured during recognition
    captured_image_url VARCHAR(500),
    captured_face_embedding vector(512),  -- Store for later review

    -- Liveness check
    liveness_verified BOOLEAN DEFAULT FALSE,
    liveness_score DOUBLE PRECISION,

    -- Manual verification
    verified_by INTEGER REFERENCES "User"(user_id) ON DELETE SET NULL,
    verification_notes TEXT,

    -- Timestamps
    event_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Additional metadata
    metadata JSONB  -- Flexible field for extra data
);

-- Index for user attendance history
CREATE INDEX IF NOT EXISTS attendance_logs_user_idx
ON attendance_logs(user_id, event_timestamp DESC);

-- Index for event type filtering
CREATE INDEX IF NOT EXISTS attendance_logs_event_idx
ON attendance_logs(event_type, event_timestamp DESC);

-- Index for date range queries
CREATE INDEX IF NOT EXISTS attendance_logs_timestamp_idx
ON attendance_logs(event_timestamp DESC);

-- Index for location-based queries
CREATE INDEX IF NOT EXISTS attendance_logs_location_idx
ON attendance_logs(location, event_timestamp DESC);

-- Index for JSONB metadata queries
CREATE INDEX IF NOT EXISTS attendance_logs_metadata_idx
ON attendance_logs USING gin(metadata);


-- 3. FACE RECOGNITION SETTINGS TABLE
-- System-wide and per-location settings for face recognition
CREATE TABLE IF NOT EXISTS face_recognition_settings (
    setting_id SERIAL PRIMARY KEY,
    location VARCHAR(200),  -- NULL for global settings

    -- Recognition thresholds
    recognition_threshold DOUBLE PRECISION DEFAULT 0.7,
    liveness_threshold DOUBLE PRECISION DEFAULT 0.8,

    -- Quality requirements
    min_face_quality DOUBLE PRECISION DEFAULT 0.5,
    min_sharpness DOUBLE PRECISION DEFAULT 0.4,
    min_brightness DOUBLE PRECISION DEFAULT 0.3,

    -- Enrollment settings
    require_liveness_enrollment BOOLEAN DEFAULT TRUE,
    min_enrollment_samples INTEGER DEFAULT 3,  -- Minimum face samples per user

    -- Operational settings
    allow_manual_override BOOLEAN DEFAULT TRUE,
    auto_check_out_hours INTEGER DEFAULT 12,  -- Auto check-out after N hours

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_location_settings UNIQUE(location)
);

-- Insert default global settings
INSERT INTO face_recognition_settings (location, recognition_threshold, liveness_threshold)
VALUES (NULL, 0.7, 0.8)
ON CONFLICT (location) DO NOTHING;


-- 4. ATTENDANCE SUMMARY VIEW
-- Pre-calculated daily attendance summary for reporting
CREATE TABLE IF NOT EXISTS attendance_summary (
    summary_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "User"(user_id) ON DELETE CASCADE,
    date DATE NOT NULL,

    -- Attendance times
    first_check_in TIMESTAMP,
    last_check_out TIMESTAMP,
    total_hours DOUBLE PRECISION,

    -- Counts
    check_in_count INTEGER DEFAULT 0,
    check_out_count INTEGER DEFAULT 0,

    -- Status
    status VARCHAR(30) CHECK (
        status IN ('PRESENT', 'ABSENT', 'LATE', 'EARLY_LEAVE', 'INCOMPLETE')
    ),

    -- Notes
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_user_date UNIQUE(user_id, date)
);

-- Index for date range queries
CREATE INDEX IF NOT EXISTS attendance_summary_date_idx
ON attendance_summary(date DESC);

-- Index for user summary history
CREATE INDEX IF NOT EXISTS attendance_summary_user_idx
ON attendance_summary(user_id, date DESC);


-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_employee_faces_updated_at
    BEFORE UPDATE ON employee_faces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_face_recognition_settings_updated_at
    BEFORE UPDATE ON face_recognition_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_summary_updated_at
    BEFORE UPDATE ON attendance_summary
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Add face recognition role to existing users (if not exists)
-- This allows us to use existing User table entries as employees
COMMENT ON TABLE employee_faces IS 'Stores face embeddings for employee recognition. Links to User table where role can be "employee", "hotel_owner", or "admin".';
COMMENT ON TABLE attendance_logs IS 'Tracks all attendance events including check-in, check-out, and recognition attempts.';
COMMENT ON TABLE attendance_summary IS 'Daily attendance summary for reporting and analytics.';
