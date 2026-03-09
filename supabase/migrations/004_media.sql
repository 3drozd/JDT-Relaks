-- Add media column (JSONB array of images/videos)
ALTER TABLE events ADD COLUMN IF NOT EXISTS media JSONB DEFAULT '[]';

-- Example media item structure:
-- { "type": "image" | "video", "url": "https://...", "order": 1 }
