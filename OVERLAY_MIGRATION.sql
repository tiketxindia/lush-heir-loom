-- ========================================
-- OVERLAY FEATURE DATABASE MIGRATION
-- ========================================
-- This script adds overlay configuration columns to the carousel_images table
-- Run this in your Supabase SQL Editor

-- Step 1: Add overlay columns to carousel_images table
ALTER TABLE carousel_images 
ADD COLUMN overlay_enabled BOOLEAN DEFAULT false,
ADD COLUMN overlay_type TEXT DEFAULT 'gradient-lr',
ADD COLUMN overlay_color TEXT DEFAULT '#000000',
ADD COLUMN overlay_opacity INTEGER DEFAULT 50,
ADD COLUMN overlay_gradient_start TEXT DEFAULT '#000000',
ADD COLUMN overlay_gradient_end TEXT DEFAULT '#000000';

-- Step 2: Add constraints for data validation
ALTER TABLE carousel_images 
ADD CONSTRAINT check_overlay_type 
CHECK (overlay_type IN ('solid', 'gradient-lr', 'gradient-tb', 'gradient-radial'));

ALTER TABLE carousel_images 
ADD CONSTRAINT check_overlay_opacity 
CHECK (overlay_opacity >= 0 AND overlay_opacity <= 100);

-- Step 3: Optional - Set some sample overlay configurations for testing
-- Uncomment the lines below if you want to test with some sample overlays

-- UPDATE carousel_images 
-- SET overlay_enabled = true, 
--     overlay_type = 'gradient-lr',
--     overlay_gradient_start = '#1a1a2e',
--     overlay_gradient_end = '#16213e',
--     overlay_opacity = 60
-- WHERE id = 1;

-- UPDATE carousel_images 
-- SET overlay_enabled = true, 
--     overlay_type = 'solid',
--     overlay_color = '#000000',
--     overlay_opacity = 40
-- WHERE id = 2;

-- Verification query - run this to confirm migration success
SELECT 
    id, 
    title,
    overlay_enabled,
    overlay_type,
    overlay_color,
    overlay_opacity,
    overlay_gradient_start,
    overlay_gradient_end
FROM carousel_images 
ORDER BY order_index;