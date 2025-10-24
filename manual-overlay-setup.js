// Manual overlay column addition using Supabase client
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function manuallyAddOverlayColumns() {
  console.log('🔧 Manually updating carousel_images records with overlay defaults...');
  
  try {
    // First, let's get all existing records
    const { data: existingRecords, error: fetchError } = await supabase
      .from('carousel_images')
      .select('*');

    if (fetchError) {
      console.error('❌ Failed to fetch existing records:', fetchError);
      return;
    }

    console.log('📋 Found', existingRecords?.length || 0, 'existing carousel images');

    // Check if overlay columns already exist by trying to select them
    const { data: testData, error: testError } = await supabase
      .from('carousel_images')
      .select('id, overlay_enabled, overlay_type, overlay_color, overlay_opacity, overlay_gradient_start, overlay_gradient_end')
      .limit(1);

    if (testError) {
      console.log('ℹ️ Overlay columns do not exist yet, which is expected');
      console.log('🚨 You need to manually add these columns in Supabase SQL Editor:');
      console.log(`
-- Add overlay columns to carousel_images table
ALTER TABLE carousel_images 
ADD COLUMN overlay_enabled BOOLEAN DEFAULT false,
ADD COLUMN overlay_type TEXT DEFAULT 'gradient-lr',
ADD COLUMN overlay_color TEXT DEFAULT '#000000',
ADD COLUMN overlay_opacity INTEGER DEFAULT 50,
ADD COLUMN overlay_gradient_start TEXT DEFAULT '#000000',
ADD COLUMN overlay_gradient_end TEXT DEFAULT '#000000';

-- Add constraints
ALTER TABLE carousel_images 
ADD CONSTRAINT check_overlay_type 
CHECK (overlay_type IN ('solid', 'gradient-lr', 'gradient-tb', 'gradient-radial'));

ALTER TABLE carousel_images 
ADD CONSTRAINT check_overlay_opacity 
CHECK (overlay_opacity >= 0 AND overlay_opacity <= 100);
      `);
      console.log('📝 Please copy the above SQL and run it in Supabase SQL Editor');
    } else {
      console.log('✅ Overlay columns already exist!');
      console.log('Current overlay columns:', Object.keys(testData[0]).filter(key => key.includes('overlay')));
    }

  } catch (err) {
    console.error('❌ Exception during column check:', err);
  }
}

manuallyAddOverlayColumns();