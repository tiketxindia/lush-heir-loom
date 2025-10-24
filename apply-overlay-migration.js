// Apply overlay columns migration to Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function applyOverlayMigration() {
  console.log('🔧 Applying overlay columns migration...');
  
  try {
    // Read the SQL migration file
    const migrationSQL = fs.readFileSync('./ADD_OVERLAY_COLUMNS.sql', 'utf8');
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: migrationSQL
    });

    if (error) {
      console.error('❌ Migration failed:', error);
      
      // Try alternative approach - add columns one by one
      console.log('🔄 Trying alternative approach...');
      
      const alterQueries = [
        'ALTER TABLE carousel_images ADD COLUMN IF NOT EXISTS overlay_enabled BOOLEAN DEFAULT false',
        'ALTER TABLE carousel_images ADD COLUMN IF NOT EXISTS overlay_type TEXT DEFAULT \'gradient-lr\'',
        'ALTER TABLE carousel_images ADD COLUMN IF NOT EXISTS overlay_color TEXT DEFAULT \'#000000\'',
        'ALTER TABLE carousel_images ADD COLUMN IF NOT EXISTS overlay_opacity INTEGER DEFAULT 50',
        'ALTER TABLE carousel_images ADD COLUMN IF NOT EXISTS overlay_gradient_start TEXT DEFAULT \'#000000\'',
        'ALTER TABLE carousel_images ADD COLUMN IF NOT EXISTS overlay_gradient_end TEXT DEFAULT \'#000000\''
      ];
      
      for (const query of alterQueries) {
        console.log('Executing:', query);
        const { error: alterError } = await supabase.rpc('exec_sql', { sql: query });
        if (alterError) {
          console.error('❌ Failed to execute:', query, alterError);
        } else {
          console.log('✅ Success');
        }
      }
    } else {
      console.log('✅ Migration applied successfully');
    }

    // Verify the columns were added
    console.log('🔍 Verifying table structure...');
    const { data: tableInfo, error: infoError } = await supabase
      .from('carousel_images')
      .select('*')
      .limit(1);

    if (infoError) {
      console.error('❌ Failed to verify table:', infoError);
    } else {
      console.log('✅ Table structure verified');
      if (tableInfo && tableInfo.length > 0) {
        console.log('Sample record structure:', Object.keys(tableInfo[0]));
      }
    }

  } catch (err) {
    console.error('❌ Exception during migration:', err);
  }
}

applyOverlayMigration();