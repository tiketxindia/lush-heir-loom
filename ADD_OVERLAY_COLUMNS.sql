-- Migration: Add overlay configuration columns to carousel_images table
-- Run this in your Supabase SQL Editor

-- Add overlay configuration columns to existing carousel_images table
ALTER TABLE carousel_images 
ADD COLUMN IF NOT EXISTS overlay_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS overlay_type TEXT DEFAULT 'gradient-lr' CHECK (overlay_type IN ('none', 'solid', 'gradient-lr', 'gradient-tb', 'gradient-radial')),
ADD COLUMN IF NOT EXISTS overlay_color TEXT DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS overlay_opacity INTEGER DEFAULT 50 CHECK (overlay_opacity >= 0 AND overlay_opacity <= 100),
ADD COLUMN IF NOT EXISTS overlay_gradient_start TEXT DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS overlay_gradient_end TEXT DEFAULT '#000000';

-- Update existing records to have default overlay settings (optional)
UPDATE carousel_images 
SET 
  overlay_enabled = false,
  overlay_type = 'gradient-lr',
  overlay_color = '#000000',
  overlay_opacity = 50,
  overlay_gradient_start = '#000000',
  overlay_gradient_end = '#000000'
WHERE overlay_enabled IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN carousel_images.overlay_enabled IS 'Whether to show an overlay on the carousel image';
COMMENT ON COLUMN carousel_images.overlay_type IS 'Type of overlay: none, solid, gradient-lr, gradient-tb, gradient-radial';
COMMENT ON COLUMN carousel_images.overlay_color IS 'Hex color code for solid overlays';
COMMENT ON COLUMN carousel_images.overlay_opacity IS 'Opacity percentage (0-100) for solid overlays';
COMMENT ON COLUMN carousel_images.overlay_gradient_start IS 'Starting color for gradient overlays';
COMMENT ON COLUMN carousel_images.overlay_gradient_end IS 'Ending color for gradient overlays';