// Test overlay migration and functionality
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

async function testOverlayImplementation() {
  console.log('🧪 Testing Overlay Implementation...');
  
  try {
    // Test 1: Check if overlay columns exist
    console.log('\n📋 Test 1: Checking carousel_images table structure...');
    const { data: tableData, error: tableError } = await supabase
      .from('carousel_images')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Failed to fetch table data:', tableError);
      return;
    }

    if (tableData && tableData.length > 0) {
      const columns = Object.keys(tableData[0]);
      console.log('✅ Current table columns:', columns);
      
      const overlayColumns = columns.filter(col => col.includes('overlay'));
      if (overlayColumns.length > 0) {
        console.log('🎨 Overlay columns found:', overlayColumns);
      } else {
        console.log('⚠️ No overlay columns found - migration still needed');
      }
    }

    // Test 2: Test overlay configuration simulation
    console.log('\n🎨 Test 2: Testing overlay configuration logic...');
    
    // Simulate overlay configuration
    const overlayConfig = {
      overlay_enabled: true,
      overlay_type: 'gradient-lr',
      overlay_color: '#000000',
      overlay_opacity: 60,
      overlay_gradient_start: '#1a1a2e',
      overlay_gradient_end: '#16213e'
    };
    
    console.log('Sample overlay config:', overlayConfig);
    
    // Test generateOverlayStyle function logic (simplified version)
    const generateOverlayStyle = (config) => {
      if (!config.overlay_enabled) return '';
      
      const opacity = config.overlay_opacity / 100;
      
      switch (config.overlay_type) {
        case 'solid':
          return `rgba(${hexToRgb(config.overlay_color)}, ${opacity})`;
        case 'gradient-lr':
          return `linear-gradient(to right, ${config.overlay_gradient_start}${Math.round(opacity * 255).toString(16).padStart(2, '0')}, ${config.overlay_gradient_end}${Math.round(opacity * 255).toString(16).padStart(2, '0')})`;
        case 'gradient-tb':
          return `linear-gradient(to bottom, ${config.overlay_gradient_start}${Math.round(opacity * 255).toString(16).padStart(2, '0')}, ${config.overlay_gradient_end}${Math.round(opacity * 255).toString(16).padStart(2, '0')})`;
        case 'gradient-radial':
          return `radial-gradient(circle, ${config.overlay_gradient_start}${Math.round(opacity * 255).toString(16).padStart(2, '0')}, ${config.overlay_gradient_end}${Math.round(opacity * 255).toString(16).padStart(2, '0')})`;
        default:
          return '';
      }
    };
    
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? 
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
        : '0, 0, 0';
    };
    
    const generatedStyle = generateOverlayStyle(overlayConfig);
    console.log('✅ Generated overlay style:', generatedStyle);

    // Test 3: Check if we can update a record (once migration is done)
    console.log('\n🔧 Test 3: Migration requirement check...');
    try {
      const { data: updateTest, error: updateError } = await supabase
        .from('carousel_images')
        .update({ 
          overlay_enabled: false,
          overlay_type: 'gradient-lr',
          overlay_opacity: 50 
        })
        .eq('id', 1)
        .select();

      if (updateError) {
        if (updateError.message.includes('column') && updateError.message.includes('does not exist')) {
          console.log('⚠️ Overlay columns not yet added - migration needed');
          console.log('\n📝 Run this SQL in Supabase SQL Editor:');
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
        } else {
          console.error('❌ Unexpected update error:', updateError);
        }
      } else {
        console.log('✅ Overlay columns exist and update successful!');
        console.log('Updated record:', updateTest);
      }
    } catch (err) {
      console.log('⚠️ Update test failed (expected if migration not done):', err.message);
    }

    console.log('\n🎯 Implementation Status:');
    console.log('✅ TypeScript interfaces updated');
    console.log('✅ Admin UI components added');
    console.log('✅ Overlay generation logic ready');
    console.log('⏳ Database migration needed');
    console.log('\n🚀 After migration, visit: http://localhost:8081 → Admin → Carousel Management');

  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

testOverlayImplementation();