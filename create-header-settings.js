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

async function createHeaderSettingsTable() {
  try {
    console.log('Checking header_settings table...');
    
    // Try to query the table to see if it exists
    const { data, error } = await supabase
      .from('header_settings')
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ Table does not exist. Please create it manually.');
        console.log('\n🔧 Please run this SQL in your Supabase SQL Editor:\n');
        
        console.log(`-- Create header_settings table
CREATE TABLE header_settings (
  id SERIAL PRIMARY KEY,
  is_sticky BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Insert default settings
INSERT INTO header_settings (is_sticky) VALUES (true);

-- Enable RLS
ALTER TABLE header_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to header_settings" ON header_settings
    FOR SELECT USING (true);

-- Allow admin update access  
CREATE POLICY "Allow admin update access to header_settings" ON header_settings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Create update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_header_settings_updated_at
    BEFORE UPDATE ON header_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();`);
        
        console.log('\n📍 Go to: https://app.supabase.com/project/ezfbekvpmzykjniyyrof/sql/new');
        
      } else {
        console.error('❌ Error accessing table:', error);
      }
    } else {
      console.log('✅ header_settings table exists and is accessible!');
      console.log('📊 Current data:', data);
    }
    
  } catch (err) {
    console.error('❌ Script error:', err.message);
  }
}

createHeaderSettingsTable();